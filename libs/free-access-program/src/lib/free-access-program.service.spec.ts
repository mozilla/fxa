/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { StatsD } from 'hot-shots';

import { AccountManager } from '@fxa/shared/account/account';
import {
  type FreeAccessByClientProjection,
  FreeAccessProgramConfigurationManager,
  type FreeAccessProjection,
  type FreeAccessProjectionEntry,
} from '@fxa/shared/cms';
import { StatsDService } from '@fxa/shared/metrics/statsd';

import { FreeAccessProgramJournalManager } from './free-access-program.journal.manager';
import { FreeAccessProgramService } from './free-access-program.service';
import {
  FREE_ACCESS_NOTIFIER,
  type FreeAccessNotifier,
} from './free-access-program.types';

const entry = (
  caps: Record<string, string[]>,
  offerings: string[] = ['vpn']
): FreeAccessProjectionEntry => ({
  capabilities: caps,
  offeringApiIdentifiers: offerings,
});

const projection = (
  pairs: Array<[string, FreeAccessProjectionEntry]>
): FreeAccessProjection => Object.fromEntries(pairs);

describe('FreeAccessProgramService', () => {
  let service: FreeAccessProgramService;
  let configurationManager: jest.Mocked<
    Pick<
      FreeAccessProgramConfigurationManager,
      | 'getCachedProjection'
      | 'getFreshProjection'
      | 'getCachedAccessGrantsByClient'
      | 'invalidateProjectionCache'
    >
  >;
  let accountManager: jest.Mocked<Pick<AccountManager, 'getPrimaryEmailByUid'>>;
  let journalManager: jest.Mocked<
    Pick<FreeAccessProgramJournalManager, 'get' | 'set'>
  >;
  let notifier: jest.Mocked<FreeAccessNotifier>;
  let statsd: jest.Mocked<Pick<StatsD, 'increment' | 'timing'>>;
  let logger: jest.Mocked<Pick<Logger, 'error' | 'log'>>;

  beforeEach(async () => {
    jest.clearAllMocks();
    configurationManager = {
      getCachedProjection: jest.fn().mockResolvedValue({}),
      getFreshProjection: jest.fn().mockResolvedValue({}),
      getCachedAccessGrantsByClient: jest.fn().mockResolvedValue({}),
      invalidateProjectionCache: jest.fn().mockResolvedValue(undefined),
    };
    accountManager = {
      getPrimaryEmailByUid: jest.fn().mockResolvedValue(undefined),
    };
    journalManager = {
      // Default: warm-but-empty journal; tests opt into the cold-start
      // (null) path explicitly.
      get: jest.fn().mockResolvedValue({}),
      set: jest.fn().mockResolvedValue(undefined),
    };
    notifier = {
      notifyEmailChanged: jest.fn().mockResolvedValue(undefined),
    };
    statsd = {
      increment: jest.fn(),
      timing: jest.fn(),
    } as jest.Mocked<Pick<StatsD, 'increment' | 'timing'>>;
    logger = {
      error: jest.fn(),
      log: jest.fn(),
    } as jest.Mocked<Pick<Logger, 'error' | 'log'>>;

    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: FreeAccessProgramConfigurationManager,
          useValue: configurationManager,
        },
        { provide: AccountManager, useValue: accountManager },
        {
          provide: FreeAccessProgramJournalManager,
          useValue: journalManager,
        },
        { provide: FREE_ACCESS_NOTIFIER, useValue: notifier },
        { provide: StatsDService, useValue: statsd as unknown as StatsD },
        { provide: Logger, useValue: logger },
        FreeAccessProgramService,
      ],
    }).compile();
    service = moduleRef.get(FreeAccessProgramService);
  });

  describe('findCapabilitiesForEmail', () => {
    it('returns an empty map for a null email without touching the cache', async () => {
      expect(await service.findCapabilitiesForEmail(null)).toEqual({});
      expect(configurationManager.getCachedProjection).not.toHaveBeenCalled();
    });

    it('returns an empty map for an undefined email without touching the cache', async () => {
      expect(await service.findCapabilitiesForEmail(undefined)).toEqual({});
      expect(configurationManager.getCachedProjection).not.toHaveBeenCalled();
    });

    it('returns an empty map when the projection has no entry for the email', async () => {
      configurationManager.getCachedProjection.mockResolvedValue(
        projection([['someone@example.com', entry({ 'client-a': ['vpn'] })]])
      );
      expect(
        await service.findCapabilitiesForEmail('nobody@example.com')
      ).toEqual({});
    });

    it('returns the capabilities for a matching email (lowercased lookup)', async () => {
      configurationManager.getCachedProjection.mockResolvedValue(
        projection([['user@example.com', entry({ 'client-a': ['vpn'] })]])
      );
      expect(
        await service.findCapabilitiesForEmail('USER@example.com')
      ).toEqual({ 'client-a': ['vpn'] });
    });
  });

  describe('findOfferingIdsForEmail', () => {
    it('returns an empty array for null/undefined emails without touching the cache', async () => {
      expect(await service.findOfferingIdsForEmail(null)).toEqual([]);
      expect(await service.findOfferingIdsForEmail(undefined)).toEqual([]);
      expect(configurationManager.getCachedProjection).not.toHaveBeenCalled();
    });

    it('returns the deduped offering apiIdentifiers for a matching email', async () => {
      configurationManager.getCachedProjection.mockResolvedValue(
        projection([
          [
            'user@example.com',
            entry({ 'client-a': ['vpn'] }, ['vpn', 'relay']),
          ],
        ])
      );
      expect(
        await service.findOfferingIdsForEmail('user@example.com')
      ).toEqual(['vpn', 'relay']);
    });

    it('returns an empty array when the email is not in the projection', async () => {
      configurationManager.getCachedProjection.mockResolvedValue({});
      expect(
        await service.findOfferingIdsForEmail('nobody@example.com')
      ).toEqual([]);
    });
  });

  describe('findFreeAccessForUid', () => {
    const UID = 'uid-1';

    const grantsByClient = (
      map: Record<string, Record<string, Array<[string, number]>>>
    ): FreeAccessByClientProjection =>
      Object.fromEntries(
        Object.entries(map).map(([email, byClient]) => [
          email,
          Object.fromEntries(
            Object.entries(byClient).map(([clientId, grants]) => [
              clientId,
              grants.map(([offeringApiIdentifier, expiresAt]) => ({
                offeringApiIdentifier,
                expiresAt,
              })),
            ])
          ),
        ])
      );

    it('returns not-a-member without touching access grants when the uid has no email', async () => {
      accountManager.getPrimaryEmailByUid.mockResolvedValue(undefined);

      expect(await service.findFreeAccessForUid(UID)).toEqual({
        isMember: false,
        grantsByClient: {},
      });
      expect(
        configurationManager.getCachedAccessGrantsByClient
      ).not.toHaveBeenCalled();
    });

    it('returns not-a-member when the email is absent from the projection gate', async () => {
      accountManager.getPrimaryEmailByUid.mockResolvedValue('user@example.com');
      configurationManager.getCachedProjection.mockResolvedValue({});

      expect(await service.findFreeAccessForUid(UID)).toEqual({
        isMember: false,
        grantsByClient: {},
      });
      expect(
        configurationManager.getCachedAccessGrantsByClient
      ).not.toHaveBeenCalled();
    });

    it('returns all grants for the email keyed by client, without filtering', async () => {
      accountManager.getPrimaryEmailByUid.mockResolvedValue('User@Example.com');
      configurationManager.getCachedProjection.mockResolvedValue(
        projection([['user@example.com', entry({ 'client-a': ['vpn'] })]])
      );
      configurationManager.getCachedAccessGrantsByClient.mockResolvedValue(
        grantsByClient({
          'user@example.com': {
            'client-a': [['vpn', 4_070_995_200_000]],
            'client-b': [['relay', 4_070_995_200_000]],
          },
        })
      );

      expect(await service.findFreeAccessForUid(UID)).toEqual({
        isMember: true,
        grantsByClient: {
          'client-a': [
            { offeringApiIdentifier: 'vpn', expiresAt: 4_070_995_200_000 },
          ],
          'client-b': [
            { offeringApiIdentifier: 'relay', expiresAt: 4_070_995_200_000 },
          ],
        },
      });
    });

    it('is a member with an empty grant map when the email has no resolved grants', async () => {
      accountManager.getPrimaryEmailByUid.mockResolvedValue('user@example.com');
      configurationManager.getCachedProjection.mockResolvedValue(
        projection([['user@example.com', entry({ 'client-a': ['vpn'] })]])
      );
      configurationManager.getCachedAccessGrantsByClient.mockResolvedValue({});

      expect(await service.findFreeAccessForUid(UID)).toEqual({
        isMember: true,
        grantsByClient: {},
      });
    });
  });

  describe('reconcile', () => {
    it('notifies for an email that appears for the first time', async () => {
      journalManager.get.mockResolvedValue({});
      configurationManager.getFreshProjection.mockResolvedValue(
        projection([['alice@example.com', entry({ 'client-a': ['vpn'] })]])
      );

      const result = await service.reconcile();

      expect(notifier.notifyEmailChanged).toHaveBeenCalledTimes(1);
      expect(notifier.notifyEmailChanged).toHaveBeenCalledWith(
        'alice@example.com'
      );
      expect(result).toEqual({ changed: 1 });
    });

    it('notifies for an email that disappears from the fresh projection', async () => {
      journalManager.get.mockResolvedValue(
        projection([['stale@example.com', entry({ 'client-a': ['vpn'] })]])
      );
      configurationManager.getFreshProjection.mockResolvedValue({});

      const result = await service.reconcile();

      expect(notifier.notifyEmailChanged).toHaveBeenCalledTimes(1);
      expect(notifier.notifyEmailChanged).toHaveBeenCalledWith(
        'stale@example.com'
      );
      expect(result).toEqual({ changed: 1 });
    });

    it("notifies once when an email's capabilities change", async () => {
      journalManager.get.mockResolvedValue(
        projection([['alice@example.com', entry({ 'client-a': ['vpn-old'] })]])
      );
      configurationManager.getFreshProjection.mockResolvedValue(
        projection([['alice@example.com', entry({ 'client-a': ['vpn-new'] })]])
      );

      const result = await service.reconcile();

      expect(notifier.notifyEmailChanged).toHaveBeenCalledTimes(1);
      expect(notifier.notifyEmailChanged).toHaveBeenCalledWith(
        'alice@example.com'
      );
      expect(result).toEqual({ changed: 1 });
    });

    it('emits no notifications when before and after capability sets are equal', async () => {
      const projectionValue = projection([
        ['alice@example.com', entry({ 'client-a': ['vpn'] })],
      ]);
      journalManager.get.mockResolvedValue(projectionValue);
      configurationManager.getFreshProjection.mockResolvedValue(
        projectionValue
      );

      const result = await service.reconcile();

      expect(notifier.notifyEmailChanged).not.toHaveBeenCalled();
      expect(result).toEqual({ changed: 0 });
    });

    it('persists the new projection to the journal before firing notifications', async () => {
      journalManager.get.mockResolvedValue({});
      const fresh = projection([
        ['alice@example.com', entry({ 'client-a': ['vpn'] })],
      ]);
      configurationManager.getFreshProjection.mockResolvedValue(fresh);

      const callOrder: string[] = [];
      journalManager.set.mockImplementation(async () => {
        callOrder.push('journal-write');
      });
      configurationManager.invalidateProjectionCache.mockImplementation(
        async () => {
          callOrder.push('invalidate');
        }
      );
      notifier.notifyEmailChanged.mockImplementation(async () => {
        callOrder.push('notify');
      });

      await service.reconcile();

      expect(journalManager.set).toHaveBeenCalledWith(fresh);
      expect(callOrder).toEqual(['journal-write', 'invalidate', 'notify']);
    });

    it('still fires notifications when invalidateProjectionCache throws', async () => {
      journalManager.get.mockResolvedValue({});
      configurationManager.getFreshProjection.mockResolvedValue(
        projection([['alice@example.com', entry({ 'client-a': ['vpn'] })]])
      );
      configurationManager.invalidateProjectionCache.mockRejectedValueOnce(
        new Error('firestore-down')
      );

      await service.reconcile();

      expect(notifier.notifyEmailChanged).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalled();
      expect(statsd.increment).toHaveBeenCalledWith(
        'free_access_program.reconcile.invalidate.error'
      );
    });

    it('seeds the journal and fires nothing on a cold start', async () => {
      const fresh = projection([
        ['alice@example.com', entry({ 'client-a': ['vpn'] })],
      ]);
      journalManager.get.mockResolvedValue(null);
      configurationManager.getFreshProjection.mockResolvedValue(fresh);

      const result = await service.reconcile();

      expect(journalManager.set).toHaveBeenCalledWith(fresh);
      expect(notifier.notifyEmailChanged).not.toHaveBeenCalled();
      expect(
        configurationManager.invalidateProjectionCache
      ).not.toHaveBeenCalled();
      expect(result).toEqual({ changed: 0, skipped: 'cold-cache-seeded' });
      expect(statsd.increment).toHaveBeenCalledWith(
        'free_access_program.reconcile.cold_start_seeded'
      );
    });

    it('logs and continues when an individual notification rejects', async () => {
      journalManager.get.mockResolvedValue({});
      configurationManager.getFreshProjection.mockResolvedValue(
        projection([
          ['a@example.com', entry({ 'client-a': ['vpn'] })],
          ['b@example.com', entry({ 'client-a': ['vpn'] })],
        ])
      );
      notifier.notifyEmailChanged.mockRejectedValueOnce(new Error('boom'));

      await service.reconcile();

      expect(notifier.notifyEmailChanged).toHaveBeenCalledTimes(2);
      expect(logger.error).toHaveBeenCalled();
      expect(statsd.increment).toHaveBeenCalledWith(
        'free_access_program.reconcile.notify.error'
      );
    });

    it('emits success metric and duration timing on a normal run', async () => {
      journalManager.get.mockResolvedValue({});
      configurationManager.getFreshProjection.mockResolvedValue({});

      await service.reconcile();

      expect(statsd.increment).toHaveBeenCalledWith(
        'free_access_program.reconcile.success'
      );
      expect(statsd.timing).toHaveBeenCalledWith(
        'free_access_program.reconcile.duration_ms',
        expect.any(Number)
      );
    });

    it('emits failure metric and rethrows when Strapi fetch errors', async () => {
      configurationManager.getFreshProjection.mockRejectedValue(
        new Error('strapi-down')
      );

      await expect(service.reconcile()).rejects.toThrow('strapi-down');
      expect(statsd.increment).toHaveBeenCalledWith(
        'free_access_program.reconcile.failure'
      );
    });
  });

  // payments-api constructs the service read-only (no journal manager /
  // notifier). The read methods must work; reconcile() must fail loudly.
  describe('read-only construction (optional write-path deps)', () => {
    let readOnlyService: FreeAccessProgramService;

    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        providers: [
          {
            provide: FreeAccessProgramConfigurationManager,
            useValue: configurationManager,
          },
          { provide: AccountManager, useValue: accountManager },
          { provide: StatsDService, useValue: statsd as unknown as StatsD },
          { provide: Logger, useValue: logger },
          FreeAccessProgramService,
        ],
      }).compile();
      readOnlyService = moduleRef.get(FreeAccessProgramService);
    });

    it('resolves free access for a uid without the write-path deps', async () => {
      accountManager.getPrimaryEmailByUid.mockResolvedValue('user@example.com');
      configurationManager.getCachedProjection.mockResolvedValue(
        projection([['user@example.com', entry({ 'client-a': ['vpn'] })]])
      );

      await expect(
        readOnlyService.findFreeAccessForUid('uid-1')
      ).resolves.toEqual({ isMember: true, grantsByClient: {} });
    });

    it('throws from reconcile() when the journal manager and notifier are absent', async () => {
      await expect(readOnlyService.reconcile()).rejects.toThrow(
        'requires a journal manager and notifier'
      );
    });
  });
});

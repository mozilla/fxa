/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Timestamp } from '@google-cloud/firestore';
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
import type { FreeAccessPendingNotification } from './free-access-program.repository';
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
      | 'memoryCacheTtlSeconds'
    >
  >;
  let accountManager: jest.Mocked<Pick<AccountManager, 'getPrimaryEmailByUid'>>;
  let journalManager: jest.Mocked<
    Pick<
      FreeAccessProgramJournalManager,
      | 'get'
      | 'set'
      | 'queueNotifications'
      | 'getDueNotifications'
      | 'deleteNotification'
    >
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
      memoryCacheTtlSeconds: jest.fn().mockReturnValue(300),
    };
    accountManager = {
      getPrimaryEmailByUid: jest.fn().mockResolvedValue(undefined),
    };
    journalManager = {
      // Default: warm-but-empty journal; tests opt into the cold-start
      // (null) path explicitly.
      get: jest.fn().mockResolvedValue({}),
      set: jest.fn().mockResolvedValue(undefined),
      queueNotifications: jest.fn().mockResolvedValue(undefined),
      getDueNotifications: jest.fn().mockResolvedValue([]),
      deleteNotification: jest.fn().mockResolvedValue(undefined),
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

    it('records a non-member membership check for a missing email', async () => {
      await service.findCapabilitiesForEmail(null);
      expect(statsd.increment).toHaveBeenCalledWith(
        'free_access_program.membership.check',
        { member: 'false', lookup: 'email_capabilities' }
      );
    });

    it('records a member membership check when capabilities are found', async () => {
      configurationManager.getCachedProjection.mockResolvedValue(
        projection([['user@example.com', entry({ 'client-a': ['vpn'] })]])
      );
      await service.findCapabilitiesForEmail('user@example.com');
      expect(statsd.increment).toHaveBeenCalledWith(
        'free_access_program.membership.check',
        { member: 'true', lookup: 'email_capabilities' }
      );
    });

    it('records a non-member membership check when the email has no capabilities', async () => {
      configurationManager.getCachedProjection.mockResolvedValue({});
      await service.findCapabilitiesForEmail('nobody@example.com');
      expect(statsd.increment).toHaveBeenCalledWith(
        'free_access_program.membership.check',
        { member: 'false', lookup: 'email_capabilities' }
      );
    });
  });

  describe('findCapabilitiesForUid', () => {
    const UID = 'f9416ce3703e4916a4cd6b1e665a3f1a';

    it('returns an empty map without reading the account when the program has no members', async () => {
      configurationManager.getCachedProjection.mockResolvedValue({});
      expect(await service.findCapabilitiesForUid(UID)).toEqual({});
      expect(accountManager.getPrimaryEmailByUid).not.toHaveBeenCalled();
    });

    it('returns the capabilities for the primary email of the uid (lowercased lookup)', async () => {
      configurationManager.getCachedProjection.mockResolvedValue(
        projection([['user@example.com', entry({ 'client-a': ['vpn'] })]])
      );
      accountManager.getPrimaryEmailByUid.mockResolvedValue('USER@example.com');
      expect(await service.findCapabilitiesForUid(UID)).toEqual({
        'client-a': ['vpn'],
      });
      expect(accountManager.getPrimaryEmailByUid).toHaveBeenCalledWith(UID);
    });

    it('returns an empty map when the primary email has no entry in the projection', async () => {
      configurationManager.getCachedProjection.mockResolvedValue(
        projection([['someone@example.com', entry({ 'client-a': ['vpn'] })]])
      );
      accountManager.getPrimaryEmailByUid.mockResolvedValue(
        'nobody@example.com'
      );
      expect(await service.findCapabilitiesForUid(UID)).toEqual({});
    });

    it('returns an empty map when the uid has no primary email', async () => {
      configurationManager.getCachedProjection.mockResolvedValue(
        projection([['someone@example.com', entry({ 'client-a': ['vpn'] })]])
      );
      accountManager.getPrimaryEmailByUid.mockResolvedValue(undefined);
      expect(await service.findCapabilitiesForUid(UID)).toEqual({});
    });

    it('records a member membership check when capabilities are found', async () => {
      configurationManager.getCachedProjection.mockResolvedValue(
        projection([['user@example.com', entry({ 'client-a': ['vpn'] })]])
      );
      accountManager.getPrimaryEmailByUid.mockResolvedValue('user@example.com');
      await service.findCapabilitiesForUid(UID);
      expect(statsd.increment).toHaveBeenCalledWith(
        'free_access_program.membership.check',
        { member: 'true', lookup: 'uid_capabilities' }
      );
    });

    it('records a non-member membership check when the program has no members', async () => {
      configurationManager.getCachedProjection.mockResolvedValue({});
      await service.findCapabilitiesForUid(UID);
      expect(statsd.increment).toHaveBeenCalledWith(
        'free_access_program.membership.check',
        { member: 'false', lookup: 'uid_capabilities' }
      );
    });

    it('propagates a projection load failure', async () => {
      configurationManager.getCachedProjection.mockRejectedValue(
        new Error('strapi unavailable')
      );
      await expect(service.findCapabilitiesForUid(UID)).rejects.toThrow(
        'strapi unavailable'
      );
    });

    it('propagates an account read failure', async () => {
      configurationManager.getCachedProjection.mockResolvedValue(
        projection([['user@example.com', entry({ 'client-a': ['vpn'] })]])
      );
      accountManager.getPrimaryEmailByUid.mockRejectedValue(
        new Error('ECONNREFUSED')
      );
      await expect(service.findCapabilitiesForUid(UID)).rejects.toThrow(
        'ECONNREFUSED'
      );
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
      expect(await service.findOfferingIdsForEmail('user@example.com')).toEqual(
        ['vpn', 'relay']
      );
    });

    it('returns an empty array when the email is not in the projection', async () => {
      configurationManager.getCachedProjection.mockResolvedValue({});
      expect(
        await service.findOfferingIdsForEmail('nobody@example.com')
      ).toEqual([]);
    });

    it('records a member membership check when offerings are found', async () => {
      configurationManager.getCachedProjection.mockResolvedValue(
        projection([
          ['user@example.com', entry({ 'client-a': ['vpn'] }, ['vpn'])],
        ])
      );
      await service.findOfferingIdsForEmail('user@example.com');
      expect(statsd.increment).toHaveBeenCalledWith(
        'free_access_program.membership.check',
        { member: 'true', lookup: 'email_offerings' }
      );
    });

    it('records a non-member membership check when the email has no offerings', async () => {
      configurationManager.getCachedProjection.mockResolvedValue({});
      await service.findOfferingIdsForEmail('nobody@example.com');
      expect(statsd.increment).toHaveBeenCalledWith(
        'free_access_program.membership.check',
        { member: 'false', lookup: 'email_offerings' }
      );
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

    it('records a non-member membership check when the uid has no email', async () => {
      accountManager.getPrimaryEmailByUid.mockResolvedValue(undefined);
      await service.findFreeAccessForUid(UID);
      expect(statsd.increment).toHaveBeenCalledWith(
        'free_access_program.membership.check',
        { member: 'false', lookup: 'uid' }
      );
    });

    it('records a member membership check when the uid resolves to a member', async () => {
      accountManager.getPrimaryEmailByUid.mockResolvedValue('user@example.com');
      configurationManager.getCachedProjection.mockResolvedValue(
        projection([['user@example.com', entry({ 'client-a': ['vpn'] })]])
      );
      await service.findFreeAccessForUid(UID);
      expect(statsd.increment).toHaveBeenCalledWith(
        'free_access_program.membership.check',
        { member: 'true', lookup: 'uid' }
      );
    });
  });

  describe('reconcile', () => {
    const NOW = 1_700_000_000_000;
    const DEFAULT_DELAY_MS = (300 + 60) * 1000;
    const pending = (
      email: string,
      id = `id-${email}`
    ): FreeAccessPendingNotification => ({
      id,
      email,
      updateTime: { seconds: 1, nanoseconds: 0 } as Timestamp,
    });

    beforeEach(() => {
      jest.spyOn(Date, 'now').mockReturnValue(NOW);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('queues an email that appears for the first time', async () => {
      journalManager.get.mockResolvedValue({});
      configurationManager.getFreshProjection.mockResolvedValue(
        projection([['alice@example.com', entry({ 'client-a': ['vpn'] })]])
      );

      const result = await service.reconcile();

      expect(journalManager.queueNotifications).toHaveBeenCalledWith(
        ['alice@example.com'],
        NOW + DEFAULT_DELAY_MS
      );
      expect(result).toEqual({ changed: 1 });
    });

    it('queues an email that disappears from the fresh projection', async () => {
      journalManager.get.mockResolvedValue(
        projection([['stale@example.com', entry({ 'client-a': ['vpn'] })]])
      );
      configurationManager.getFreshProjection.mockResolvedValue({});

      const result = await service.reconcile();

      expect(journalManager.queueNotifications).toHaveBeenCalledWith(
        ['stale@example.com'],
        NOW + DEFAULT_DELAY_MS
      );
      expect(result).toEqual({ changed: 1 });
    });

    it('queues an email once when its capabilities change', async () => {
      journalManager.get.mockResolvedValue(
        projection([['alice@example.com', entry({ 'client-a': ['vpn-old'] })]])
      );
      configurationManager.getFreshProjection.mockResolvedValue(
        projection([['alice@example.com', entry({ 'client-a': ['vpn-new'] })]])
      );

      const result = await service.reconcile();

      expect(journalManager.queueNotifications).toHaveBeenCalledTimes(1);
      expect(journalManager.queueNotifications).toHaveBeenCalledWith(
        ['alice@example.com'],
        NOW + DEFAULT_DELAY_MS
      );
      expect(result).toEqual({ changed: 1 });
    });

    it('queues nothing when before and after capability sets are equal', async () => {
      const projectionValue = projection([
        ['alice@example.com', entry({ 'client-a': ['vpn'] })],
      ]);
      journalManager.get.mockResolvedValue(projectionValue);
      configurationManager.getFreshProjection.mockResolvedValue(
        projectionValue
      );

      const result = await service.reconcile();

      expect(journalManager.queueNotifications).not.toHaveBeenCalled();
      expect(result).toEqual({ changed: 0 });
    });

    it('delays notifications by the memory cache TTL plus a 60 second margin', async () => {
      configurationManager.memoryCacheTtlSeconds.mockReturnValue(120);
      journalManager.get.mockResolvedValue({});
      configurationManager.getFreshProjection.mockResolvedValue(
        projection([['alice@example.com', entry({ 'client-a': ['vpn'] })]])
      );

      await service.reconcile();

      expect(journalManager.queueNotifications).toHaveBeenCalledWith(
        ['alice@example.com'],
        NOW + 180_000
      );
    });

    it('loads at most 500 due notifications as of now', async () => {
      await service.reconcile();

      expect(journalManager.getDueNotifications).toHaveBeenCalledWith(NOW, 500);
    });

    it('records pending.backlog when a full page of due notifications is loaded', async () => {
      journalManager.getDueNotifications.mockResolvedValue(
        Array.from({ length: 500 }, (_, i) => pending(`user${i}@example.com`))
      );

      await service.reconcile();

      expect(statsd.increment).toHaveBeenCalledWith(
        'free_access_program.reconcile.pending.backlog'
      );
    });

    it('does not record pending.backlog for a partial page', async () => {
      journalManager.getDueNotifications.mockResolvedValue([
        pending('alice@example.com'),
      ]);

      await service.reconcile();

      expect(statsd.increment).not.toHaveBeenCalledWith(
        'free_access_program.reconcile.pending.backlog'
      );
    });

    it('notifies and deletes each due pending notification', async () => {
      const alice = pending('alice@example.com');
      const bob = pending('bob@example.com');
      journalManager.getDueNotifications.mockResolvedValue([alice, bob]);

      await service.reconcile();

      expect(notifier.notifyEmailChanged).toHaveBeenCalledTimes(2);
      expect(notifier.notifyEmailChanged).toHaveBeenNthCalledWith(
        1,
        'alice@example.com'
      );
      expect(notifier.notifyEmailChanged).toHaveBeenNthCalledWith(
        2,
        'bob@example.com'
      );
      expect(journalManager.deleteNotification).toHaveBeenCalledTimes(2);
      expect(journalManager.deleteNotification).toHaveBeenNthCalledWith(
        1,
        alice
      );
      expect(journalManager.deleteNotification).toHaveBeenNthCalledWith(
        2,
        bob
      );
    });

    it('sends due notifications when nothing changed in this run', async () => {
      journalManager.getDueNotifications.mockResolvedValue([
        pending('alice@example.com'),
      ]);

      await service.reconcile();

      expect(notifier.notifyEmailChanged).toHaveBeenCalledWith(
        'alice@example.com'
      );
    });

    it('queues, writes the journal, invalidates, then sends due notifications', async () => {
      journalManager.get.mockResolvedValue({});
      const fresh = projection([
        ['alice@example.com', entry({ 'client-a': ['vpn'] })],
      ]);
      configurationManager.getFreshProjection.mockResolvedValue(fresh);

      const callOrder: string[] = [];
      journalManager.queueNotifications.mockImplementation(async () => {
        callOrder.push('queue');
      });
      journalManager.set.mockImplementation(async () => {
        callOrder.push('journal-write');
      });
      configurationManager.invalidateProjectionCache.mockImplementation(
        async () => {
          callOrder.push('invalidate');
        }
      );
      journalManager.getDueNotifications.mockImplementation(async () => {
        callOrder.push('load-due');
        return [pending('bob@example.com')];
      });
      notifier.notifyEmailChanged.mockImplementation(async () => {
        callOrder.push('notify');
      });
      journalManager.deleteNotification.mockImplementation(async () => {
        callOrder.push('delete');
      });

      await service.reconcile();

      expect(journalManager.set).toHaveBeenCalledWith(fresh);
      expect(callOrder).toEqual([
        'queue',
        'journal-write',
        'invalidate',
        'load-due',
        'notify',
        'delete',
      ]);
    });

    it('rejects without writing the journal when queueing fails', async () => {
      journalManager.get.mockResolvedValue({});
      configurationManager.getFreshProjection.mockResolvedValue(
        projection([['alice@example.com', entry({ 'client-a': ['vpn'] })]])
      );
      journalManager.queueNotifications.mockRejectedValue(
        new Error('firestore-down')
      );

      await expect(service.reconcile()).rejects.toThrow('firestore-down');
      expect(journalManager.set).not.toHaveBeenCalled();
      expect(statsd.increment).toHaveBeenCalledWith(
        'free_access_program.reconcile.failure'
      );
    });

    it('still sends earlier due notifications, then rethrows, when the journal write fails', async () => {
      journalManager.get.mockResolvedValue({});
      configurationManager.getFreshProjection.mockResolvedValue(
        projection([['alice@example.com', entry({ 'client-a': ['vpn'] })]])
      );
      journalManager.set.mockRejectedValue(new Error('journal-write-failed'));
      journalManager.getDueNotifications.mockResolvedValue([
        pending('bob@example.com'),
      ]);

      await expect(service.reconcile()).rejects.toThrow('journal-write-failed');
      expect(notifier.notifyEmailChanged).toHaveBeenCalledWith(
        'bob@example.com'
      );
      expect(statsd.increment).toHaveBeenCalledWith(
        'free_access_program.reconcile.failure'
      );
    });

    it('still sends due notifications when invalidateProjectionCache throws', async () => {
      journalManager.getDueNotifications.mockResolvedValue([
        pending('alice@example.com'),
      ]);
      configurationManager.invalidateProjectionCache.mockRejectedValueOnce(
        new Error('firestore-down')
      );

      await service.reconcile();

      expect(notifier.notifyEmailChanged).toHaveBeenCalledWith(
        'alice@example.com'
      );
      expect(statsd.increment).toHaveBeenCalledWith(
        'free_access_program.reconcile.invalidate.error'
      );
    });

    it('seeds the journal without queueing or sending on a cold start', async () => {
      const fresh = projection([
        ['alice@example.com', entry({ 'client-a': ['vpn'] })],
      ]);
      journalManager.get.mockResolvedValue(null);
      configurationManager.getFreshProjection.mockResolvedValue(fresh);

      const result = await service.reconcile();

      expect(journalManager.set).toHaveBeenCalledWith(fresh);
      expect(journalManager.queueNotifications).not.toHaveBeenCalled();
      expect(journalManager.getDueNotifications).not.toHaveBeenCalled();
      expect(
        configurationManager.invalidateProjectionCache
      ).not.toHaveBeenCalled();
      expect(result).toEqual({ changed: 0, skipped: 'cold-cache-seeded' });
      expect(statsd.increment).toHaveBeenCalledWith(
        'free_access_program.reconcile.cold_start_seeded'
      );
    });

    it('keeps a pending notification whose send fails and continues with the rest', async () => {
      const alice = pending('alice@example.com');
      const bob = pending('bob@example.com');
      journalManager.getDueNotifications.mockResolvedValue([alice, bob]);
      const sendError = new Error('boom');
      notifier.notifyEmailChanged.mockRejectedValueOnce(sendError);

      await service.reconcile();

      expect(notifier.notifyEmailChanged).toHaveBeenCalledTimes(2);
      expect(logger.error).toHaveBeenCalledWith(sendError);
      expect(journalManager.deleteNotification).toHaveBeenCalledTimes(1);
      expect(journalManager.deleteNotification).toHaveBeenCalledWith(bob);
      expect(statsd.increment).toHaveBeenCalledWith(
        'free_access_program.reconcile.notify.error'
      );
      expect(statsd.increment).toHaveBeenCalledWith(
        'free_access_program.reconcile.notify.success'
      );
    });

    it('records pending.delete.error and continues with the rest when a delete fails', async () => {
      const alice = pending('alice@example.com');
      const bob = pending('bob@example.com');
      journalManager.getDueNotifications.mockResolvedValue([alice, bob]);
      const deleteError = Object.assign(new Error('unavailable'), { code: 14 });
      journalManager.deleteNotification.mockRejectedValueOnce(deleteError);

      await expect(service.reconcile()).resolves.toEqual({ changed: 0 });
      expect(journalManager.deleteNotification).toHaveBeenNthCalledWith(2, bob);
      expect(statsd.increment).toHaveBeenCalledWith(
        'free_access_program.reconcile.pending.delete.error'
      );
      expect(logger.error).toHaveBeenCalledWith(
        'freeAccessProgram.pending.delete.error',
        { id: alice.id, err: deleteError }
      );
    });

    it.each([
      { code: 9, reason: 're-queued (FAILED_PRECONDITION)' },
      { code: 5, reason: 'already deleted (NOT_FOUND)' },
    ])(
      'records pending.delete.superseded without logging an error when the doc was $reason',
      async ({ code }) => {
        journalManager.getDueNotifications.mockResolvedValue([
          pending('alice@example.com'),
        ]);
        journalManager.deleteNotification.mockRejectedValue(
          Object.assign(new Error('superseded'), { code })
        );

        await service.reconcile();

        expect(statsd.increment).toHaveBeenCalledWith(
          'free_access_program.reconcile.pending.delete.superseded'
        );
        expect(statsd.increment).not.toHaveBeenCalledWith(
          'free_access_program.reconcile.pending.delete.error'
        );
        expect(logger.error).not.toHaveBeenCalled();
      }
    );

    it('deletes a pending doc without a string email instead of notifying', async () => {
      const malformed = { ...pending('ignored'), email: undefined };
      journalManager.getDueNotifications.mockResolvedValue([malformed]);

      await service.reconcile();

      expect(notifier.notifyEmailChanged).not.toHaveBeenCalled();
      expect(journalManager.deleteNotification).toHaveBeenCalledWith(malformed);
      expect(statsd.increment).toHaveBeenCalledWith(
        'free_access_program.reconcile.pending.malformed'
      );
      expect(logger.error).toHaveBeenCalledWith(
        'freeAccessProgram.pending.malformed',
        { id: malformed.id }
      );
    });

    it('records pending.load.error and still succeeds when due notifications cannot be loaded', async () => {
      const loadError = new Error('firestore-down');
      journalManager.getDueNotifications.mockRejectedValue(loadError);

      await expect(service.reconcile()).resolves.toEqual({ changed: 0 });
      expect(notifier.notifyEmailChanged).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith(loadError);
      expect(statsd.increment).toHaveBeenCalledWith(
        'free_access_program.reconcile.pending.load.error'
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

    it('times the journal load, delegating projection timing to the manager', async () => {
      journalManager.get.mockResolvedValue({});
      configurationManager.getFreshProjection.mockResolvedValue({});

      await service.reconcile();

      expect(statsd.timing).toHaveBeenCalledWith(
        'free_access_program.reconcile.load.journal_ms',
        expect.any(Number)
      );
      // Projection timing is emitted inside getFreshProjection (the CMS
      // manager), not by the service.
      expect(statsd.timing).not.toHaveBeenCalledWith(
        'free_access_program.reconcile.load.projection_ms',
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

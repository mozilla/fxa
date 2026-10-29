/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import fs from 'fs';
import path from 'path';
import Container from 'typedi';
import { SubscriptionStatus } from 'app-store-server-api';

import { AppConfig, AuthFirestore } from '../../lib/types';

import { SubplatActiveAccounts } from './subplat-active-accounts';

const DAY_IN_MS = 86_400_000;
const NOW = Date.UTC(2026, 9, 28);
const CUTOFF = NOW - 730 * DAY_IN_MS;

const uid = (n: number) => n.toString(16).padStart(32, '0');

const mockConfig = {
  authFirestore: {
    prefix: 'mock-fxa-',
  },
};

const stripeDoc = (customerUid: string | undefined, data: object) => ({
  data: () => data,
  ref: {
    parent: { parent: customerUid === undefined ? null : { id: customerUid } },
  },
});

const purchaseDoc = (data: object) => ({
  data: () => data,
  ref: { parent: { parent: null } },
});

const snapshot = (docs: object[]) => ({ empty: docs.length === 0, docs });

const pagedQuery = (pages: object[][]) => {
  const remaining = [...pages, []];
  const get = jest.fn(async () => snapshot(remaining.shift() ?? []));
  const query = {
    get,
    startAfter: jest.fn(() => ({ get })),
  };
  return {
    orderBy: jest.fn(() => ({ limit: jest.fn(() => query) })),
  };
};

describe('SubplatActiveAccounts', () => {
  let firestoreStub: any;
  let bigQueryStub: any;
  let loadStub: jest.Mock;
  let datasetStub: jest.Mock;
  let statsdStub: any;
  let logStub: any;
  let collections: Record<string, object[][]>;

  const build = (dryRun = false) =>
    new SubplatActiveAccounts(bigQueryStub, statsdStub, logStub, 730, dryRun);

  beforeEach(() => {
    jest.useFakeTimers({ now: NOW });

    collections = {
      'mock-fxa-stripe-subscriptions': [],
      'mock-fxa-iap-app-store-purchases': [],
      'mock-fxa-iap-play-purchases': [],
    };
    firestoreStub = {
      collectionGroup: jest.fn((collectionId: string) =>
        pagedQuery(collections[collectionId])
      ),
    };
    Container.set(AuthFirestore, firestoreStub);
    Container.set(AppConfig, mockConfig);

    loadStub = jest.fn().mockResolvedValue([{}]);
    datasetStub = jest.fn(() => ({
      table: jest.fn(() => ({ load: loadStub })),
    }));
    bigQueryStub = { dataset: datasetStub };

    statsdStub = { increment: jest.fn(), timing: jest.fn() };
    logStub = { info: jest.fn(), error: jest.fn() };
  });

  afterEach(() => {
    jest.useRealTimers();
    Container.reset();
  });

  describe('isActiveStripeSubscription', () => {
    it.each(['active', 'past_due', 'trialing'])(
      'includes %s subscriptions',
      (status) => {
        expect(
          build().isActiveStripeSubscription({ status, ended_at: null }, CUTOFF)
        ).toBe(true);
      }
    );

    it('includes subscriptions that ended after the cutoff', () => {
      expect(
        build().isActiveStripeSubscription(
          { status: 'canceled', ended_at: (CUTOFF + DAY_IN_MS) / 1000 },
          CUTOFF
        )
      ).toBe(true);
    });

    it('excludes subscriptions that ended before the cutoff', () => {
      expect(
        build().isActiveStripeSubscription(
          { status: 'canceled', ended_at: (CUTOFF - DAY_IN_MS) / 1000 },
          CUTOFF
        )
      ).toBe(false);
    });

    it('excludes inactive subscriptions without an end time', () => {
      expect(
        build().isActiveStripeSubscription(
          { status: 'incomplete', ended_at: null },
          CUTOFF
        )
      ).toBe(false);
    });
  });

  describe('isActiveApplePurchase', () => {
    it.each([
      SubscriptionStatus.Active,
      SubscriptionStatus.InBillingGracePeriod,
    ])('includes purchases with status %s', (status) => {
      expect(build().isActiveApplePurchase({ status }, CUTOFF)).toBe(true);
    });

    it('includes purchases that expired after the cutoff', () => {
      expect(
        build().isActiveApplePurchase(
          {
            status: SubscriptionStatus.Expired,
            expiresDate: CUTOFF + DAY_IN_MS,
          },
          CUTOFF
        )
      ).toBe(true);
    });

    it('excludes purchases that expired before the cutoff', () => {
      expect(
        build().isActiveApplePurchase(
          {
            status: SubscriptionStatus.Expired,
            expiresDate: CUTOFF - DAY_IN_MS,
          },
          CUTOFF
        )
      ).toBe(false);
    });
  });

  describe('isActiveGooglePurchase', () => {
    it('includes purchases that expire after the cutoff', () => {
      expect(
        build().isActiveGooglePurchase(
          { userId: uid(1), expiryTimeMillis: `${CUTOFF + DAY_IN_MS}` },
          CUTOFF
        )
      ).toBe(true);
    });

    it('excludes purchases that expired before the cutoff', () => {
      expect(
        build().isActiveGooglePurchase(
          { userId: uid(1), expiryTimeMillis: CUTOFF - DAY_IN_MS },
          CUTOFF
        )
      ).toBe(false);
    });

    it('excludes replaced purchases', () => {
      expect(
        build().isActiveGooglePurchase(
          { userId: 'invalid', expiryTimeMillis: NOW + DAY_IN_MS },
          CUTOFF
        )
      ).toBe(false);
    });
  });

  describe('collectActiveUids', () => {
    it('collects lowercased, distinct uids across sources and pages', async () => {
      collections['mock-fxa-stripe-subscriptions'] = [
        [stripeDoc(uid(1), { status: 'active' })],
        [
          stripeDoc(uid(2), { status: 'canceled', ended_at: 0 }),
          stripeDoc(undefined, { status: 'active' }),
        ],
      ];
      collections['mock-fxa-iap-app-store-purchases'] = [
        [
          purchaseDoc({
            userId: uid(0xa).toUpperCase(),
            status: SubscriptionStatus.Active,
          }),
        ],
      ];
      collections['mock-fxa-iap-play-purchases'] = [
        [
          purchaseDoc({ userId: uid(1), expiryTimeMillis: NOW + DAY_IN_MS }),
          purchaseDoc({ userId: 'not-a-uid', expiryTimeMillis: NOW }),
        ],
      ];

      const uids = await build().collectActiveUids(CUTOFF);

      expect([...uids].sort()).toEqual([uid(1), uid(0xa)]);
      expect(statsdStub.increment).toHaveBeenCalledWith(
        'subplat-active-accounts.source-uids',
        1,
        { source: 'stripe' }
      );
      expect(statsdStub.increment).toHaveBeenCalledWith(
        'subplat-active-accounts.source-uids',
        1,
        { source: 'google' }
      );
    });
  });

  describe('run', () => {
    it('refuses to replace the table when no uids are found', async () => {
      await expect(build().run('project.dataset.table')).rejects.toThrow(
        'No active SubPlat accounts found'
      );
      expect(loadStub).not.toHaveBeenCalled();
    });

    it('does not write to BigQuery in a dry run', async () => {
      collections['mock-fxa-stripe-subscriptions'] = [
        [stripeDoc(uid(1), { status: 'active' })],
      ];

      await expect(build(true).run('project.dataset.table')).resolves.toBe(1);
      expect(loadStub).not.toHaveBeenCalled();
    });

    it('replaces the table with the collected uids', async () => {
      collections['mock-fxa-stripe-subscriptions'] = [
        [
          stripeDoc(uid(1), { status: 'active' }),
          stripeDoc(uid(2), { status: 'trialing' }),
        ],
      ];
      let loadedContents = '';
      loadStub.mockImplementation(async (filepath: string) => {
        loadedContents = fs.readFileSync(filepath, 'utf8');
        return [{}];
      });

      await expect(build().run('project.dataset.table')).resolves.toBe(2);

      expect(datasetStub).toHaveBeenCalledWith('dataset', {
        projectId: 'project',
      });
      expect(loadStub).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          sourceFormat: 'CSV',
          writeDisposition: 'WRITE_TRUNCATE',
        })
      );
      expect(loadedContents.split(/\r?\n/).sort()).toEqual([uid(1), uid(2)]);
      expect(fs.existsSync(loadStub.mock.calls[0][0])).toBe(false);
    });

    it('propagates a Firestore read failure without replacing the table', async () => {
      firestoreStub.collectionGroup = jest.fn(() => ({
        orderBy: jest.fn(() => ({
          limit: jest.fn(() => ({
            get: jest
              .fn()
              .mockRejectedValue(new Error('firestore unavailable')),
            startAfter: jest.fn(),
          })),
        })),
      }));

      await expect(build().run('project.dataset.table')).rejects.toThrow(
        'firestore unavailable'
      );
      expect(loadStub).not.toHaveBeenCalled();
    });

    it('propagates a BigQuery load failure and removes the temporary file', async () => {
      collections['mock-fxa-stripe-subscriptions'] = [
        [stripeDoc(uid(1), { status: 'active' })],
      ];
      loadStub.mockRejectedValue(new Error('load failed'));

      await expect(build().run('project.dataset.table')).rejects.toThrow(
        'load failed'
      );
      expect(fs.existsSync(path.dirname(loadStub.mock.calls[0][0]))).toBe(
        false
      );
    });
  });
});

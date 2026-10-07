/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Container from 'typedi';
import { StatsD } from 'hot-shots';

import { ConfigType } from '../../config';
import { AppConfig, AuthFirestore } from '../../lib/types';

import {
  FirestoreAcaciaUpdater,
  isAcaciaShape,
} from './update-firestore-acacia-records';
import Stripe from 'stripe';
import { StripeHelper } from '../../lib/payments/stripe';
import { StripeFirestore } from '../../lib/payments/stripe-firestore';
import {
  StripeInvoiceFactory,
  StripeSubscriptionFactory,
} from '@fxa/payments/stripe';

import customer1 from '../../test/local/payments/fixtures/stripe/customer1.json';
import subscription1 from '../../test/local/payments/fixtures/stripe/subscription1.json';
import invoicePaid from '../../test/local/payments/fixtures/stripe/invoice_paid.json';

jest.mock('../../lib/payments/stripe-firestore');

const mockCustomer = customer1 as unknown as Stripe.Customer;

// The Stripe API answers in the current (basil) shape, while these fixtures
// predate the cutover and stand in for the records the migration has to find.
const mockSubscription = StripeSubscriptionFactory();
const mockAcaciaSubscription = subscription1;
const mockAcaciaInvoice = invoicePaid;

const mockConfig = {
  authFirestore: {
    prefix: 'mock-fxa-',
  },
} as unknown as ConfigType;

/**
 * Mirrors the customers -> subscriptions -> invoices document hierarchy the
 * updater walks.
 */
const buildFirestoreStub = ({
  subscriptionSnapshot,
  invoiceDocs = [],
  invoiceReadError,
}: {
  subscriptionSnapshot?: any;
  invoiceDocs?: { id: string; data: () => any }[];
  invoiceReadError?: Error;
} = {}) => {
  const invoiceCollectionRef = {
    get: invoiceReadError
      ? jest.fn().mockRejectedValue(invoiceReadError)
      : jest.fn().mockResolvedValue({ docs: invoiceDocs }),
  };
  const subscriptionDocRef = {
    get: jest.fn().mockResolvedValue(subscriptionSnapshot ?? { exists: false }),
    collection: jest.fn().mockReturnValue(invoiceCollectionRef),
  };
  const customerDocRef = {
    collection: jest.fn().mockReturnValue({
      doc: jest.fn().mockReturnValue(subscriptionDocRef),
    }),
  };

  return {
    collection: jest.fn().mockReturnValue({
      doc: jest.fn().mockReturnValue(customerDocRef),
    }),
  };
};

const snapshotOf = (data: any) => ({
  exists: true,
  data: jest.fn().mockReturnValue(data),
});

const invoiceDocOf = (id: string, data: any) => ({
  id,
  data: jest.fn().mockReturnValue(data),
});

const subscriptionListStub = (subscriptions: any[]) =>
  jest.fn().mockReturnValue({
    autoPagingToArray: jest.fn().mockResolvedValue(subscriptions),
  });

const lastStripeFirestore = () =>
  jest
    .mocked(StripeFirestore)
    .mock.instances.at(-1) as jest.Mocked<StripeFirestore>;

describe('FirestoreAcaciaUpdater', () => {
  let acaciaUpdater: FirestoreAcaciaUpdater;
  let stripeStub: Stripe;
  let stripeHelperStub: StripeHelper;
  let firestoreStub: any;
  let logStub: any;

  const buildUpdater = (dryRun = false) => {
    Container.set(AuthFirestore, firestoreStub);
    return new FirestoreAcaciaUpdater(stripeHelperStub, 20, logStub, dryRun);
  };

  beforeEach(() => {
    firestoreStub = buildFirestoreStub();

    Container.set(AuthFirestore, firestoreStub);
    Container.set(AppConfig, mockConfig);
    Container.set(StatsD, { increment: jest.fn(), timing: jest.fn() });

    stripeStub = {
      on: jest.fn(),
      customers: {
        list: jest.fn(),
      },
    } as unknown as Stripe;

    stripeHelperStub = {
      stripe: stripeStub,
    } as unknown as StripeHelper;

    logStub = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    acaciaUpdater = buildUpdater();
  });

  afterEach(() => {
    Container.reset();
  });

  describe('isAcaciaShape', () => {
    it('spots a subscription still carrying the dropped top-level fields', () => {
      expect(isAcaciaShape(mockAcaciaSubscription)).toBe(true);
    });

    it('spots an invoice still carrying the dropped top-level fields', () => {
      expect(isAcaciaShape(mockAcaciaInvoice)).toBe(true);
    });

    it('passes over records already in the current shape', () => {
      expect(isAcaciaShape(StripeSubscriptionFactory())).toBe(false);
      expect(isAcaciaShape(StripeInvoiceFactory())).toBe(false);
    });

    it('passes over a missing record', () => {
      expect(isAcaciaShape(undefined)).toBe(false);
    });
  });

  describe('run', () => {
    let autoPagingEachStub: jest.Mock;
    let processCustomerStub: jest.Mock;

    beforeEach(async () => {
      autoPagingEachStub = jest
        .fn()
        .mockImplementation(async (callback: any) => {
          await callback(mockCustomer);
        });

      stripeStub.customers.list = jest.fn().mockReturnValue({
        autoPagingEach: autoPagingEachStub,
      }) as any;

      processCustomerStub = jest.fn().mockResolvedValue(undefined);
      acaciaUpdater.processCustomer = processCustomerStub;

      await acaciaUpdater.run();
    });

    it('calls Stripe customers.list', () => {
      expect(stripeStub.customers.list as any).toHaveBeenCalledWith({
        limit: 25,
      });
    });

    it('calls autoPagingEach to iterate through all customers', () => {
      expect(autoPagingEachStub).toHaveBeenCalledTimes(1);
    });

    it('processes each customer', () => {
      expect(processCustomerStub).toHaveBeenCalledTimes(1);
      expect(processCustomerStub).toHaveBeenCalledWith(mockCustomer);
    });

    it('logs summary', () => {
      expect(logStub.info).toHaveBeenCalledWith(
        'firestore-acacia-update-complete',
        expect.objectContaining({
          dryRun: false,
          customersChecked: 0,
          subscriptionsOutdatedShape: 0,
          invoicesOutdatedShape: 0,
        })
      );
    });
  });

  describe('completion tally', () => {
    const deletedCustomer = { id: 'cus_deleted', deleted: true };

    beforeEach(async () => {
      firestoreStub = buildFirestoreStub({
        subscriptionSnapshot: snapshotOf(mockAcaciaSubscription),
        invoiceDocs: [
          invoiceDocOf('in_acacia', mockAcaciaInvoice),
          invoiceDocOf('in_dahlia', StripeInvoiceFactory()),
        ],
      });

      stripeStub.customers.list = jest.fn().mockReturnValue({
        autoPagingEach: jest.fn().mockImplementation(async (callback: any) => {
          await callback(deletedCustomer);
          await callback(mockCustomer);
        }),
      }) as any;

      stripeStub.subscriptions = {
        list: subscriptionListStub([mockSubscription]),
      } as any;

      acaciaUpdater = buildUpdater();

      await acaciaUpdater.run();
    });

    it('reports every record in exactly one bucket', () => {
      expect(logStub.info).toHaveBeenCalledWith(
        'firestore-acacia-update-complete',
        {
          dryRun: false,
          customersChecked: 2,
          customersSkippedDeleted: 1,
          customersProcessed: 1,
          customersFailed: 0,
          subscriptionsChecked: 1,
          subscriptionsCurrentShape: 0,
          subscriptionsMissingDoc: 0,
          subscriptionsOutdatedShape: 1,
          subscriptionsFailed: 0,
          subscriptionsInvoiceWalkFailed: 0,
          subscriptionsResynced: 1,
          subscriptionsResyncFailed: 0,
          invoicesChecked: 2,
          invoicesCurrentShape: 1,
          invoicesOutdatedShape: 1,
          invoicesResynced: 1,
          invoicesResyncFailed: 0,
        }
      );
    });

    it('balances customers seen against how they were disposed of', () => {
      expect(acaciaUpdater['customersChecked']).toBe(
        acaciaUpdater['customersSkippedDeleted'] +
          acaciaUpdater['customersProcessed'] +
          acaciaUpdater['customersFailed']
      );
    });

    it('balances subscriptions checked against how they were classified', () => {
      expect(acaciaUpdater['subscriptionsChecked']).toBe(
        acaciaUpdater['subscriptionsCurrentShape'] +
          acaciaUpdater['subscriptionsMissingDoc'] +
          acaciaUpdater['subscriptionsOutdatedShape'] +
          acaciaUpdater['subscriptionsFailed']
      );
    });

    it('balances invoices checked against how they were classified', () => {
      expect(acaciaUpdater['invoicesChecked']).toBe(
        acaciaUpdater['invoicesCurrentShape'] +
          acaciaUpdater['invoicesOutdatedShape']
      );
    });

    it('names every outdated record it found', () => {
      expect(logStub.warn).toHaveBeenCalledWith(
        'firestore-acacia-record-outdated',
        {
          type: 'subscription',
          customerId: mockCustomer.id,
          uid: mockCustomer.metadata.userid,
          subscriptionId: mockSubscription.id,
          invoiceId: null,
        }
      );
      expect(logStub.warn).toHaveBeenCalledWith(
        'firestore-acacia-record-outdated',
        {
          type: 'invoice',
          customerId: mockCustomer.id,
          uid: mockCustomer.metadata.userid,
          subscriptionId: mockSubscription.id,
          invoiceId: 'in_acacia',
        }
      );
    });
  });

  describe('processCustomer', () => {
    const buildUpdaterFor = (subscriptionCount: number) => {
      acaciaUpdater = buildUpdater();
      acaciaUpdater.processSubscription = jest
        .fn()
        .mockResolvedValue(undefined);

      stripeStub.subscriptions = {
        list: subscriptionListStub(
          new Array(subscriptionCount)
            .fill(null)
            .map(() => StripeSubscriptionFactory())
        ),
      } as any;

      return acaciaUpdater;
    };

    beforeEach(() => {
      stripeStub.subscriptions = {
        list: subscriptionListStub([mockSubscription]),
      } as any;
    });

    describe('a customer holding one subscription', () => {
      beforeEach(async () => {
        await buildUpdaterFor(1).processCustomer(mockCustomer);
      });

      it('checks the subscription', () => {
        expect(acaciaUpdater.processSubscription).toHaveBeenCalledWith(
          mockCustomer.id,
          mockCustomer.metadata.userid,
          expect.any(Object)
        );
      });
    });

    describe('a customer holding more subscriptions than one Stripe page', () => {
      const pageSize = 100;
      const subscriptionCount = pageSize + 20;

      beforeEach(async () => {
        await buildUpdaterFor(subscriptionCount).processCustomer(mockCustomer);
      });

      it('checks every subscription past the first page', () => {
        expect(acaciaUpdater.processSubscription).toHaveBeenCalledTimes(
          subscriptionCount
        );
      });

      it('walks the pages rather than reading only the first', () => {
        const listResult = (stripeStub.subscriptions.list as jest.Mock).mock
          .results[0].value;
        expect(listResult.autoPagingToArray).toHaveBeenCalledWith({
          limit: 10000,
        });
      });
    });

    describe('deleted customer', () => {
      beforeEach(async () => {
        const deletedCustomer = {
          id: mockCustomer.id,
          deleted: true,
        };

        await acaciaUpdater.processCustomer(deletedCustomer as any);
      });

      it('counts the customer as skipped rather than processed', () => {
        expect(acaciaUpdater['customersSkippedDeleted']).toBe(1);
        expect(acaciaUpdater['customersProcessed']).toBe(0);
      });

      it('does not go looking for subscriptions', () => {
        expect(stripeStub.subscriptions.list).not.toHaveBeenCalled();
      });
    });

    describe('customer missing a userid', () => {
      beforeEach(async () => {
        await acaciaUpdater.processCustomer({
          ...mockCustomer,
          metadata: {},
        });
      });

      it('logs error', () => {
        expect(logStub.error).toHaveBeenCalledWith(
          'error-processing-customer',
          expect.any(Object)
        );
      });
    });

    describe('error processing customer', () => {
      beforeEach(async () => {
        stripeStub.subscriptions = {
          list: jest.fn().mockReturnValue({
            autoPagingToArray: jest
              .fn()
              .mockRejectedValue(new Error('Stripe error')),
          }),
        } as any;

        await acaciaUpdater.processCustomer(mockCustomer);
      });

      it('logs error', () => {
        expect(logStub.error).toHaveBeenCalledWith(
          'error-processing-customer',
          expect.any(Object)
        );
      });
    });
  });

  describe('processSubscription', () => {
    let recordOutdatedStub: jest.Mock;
    let processInvoicesStub: jest.Mock;
    let resyncSubscriptionStub: jest.Mock;

    const buildUpdaterFor = (subscriptionData?: any) => {
      firestoreStub = buildFirestoreStub({
        subscriptionSnapshot: subscriptionData
          ? snapshotOf(subscriptionData)
          : { exists: false, data: jest.fn() },
      });

      acaciaUpdater = buildUpdater();
      acaciaUpdater.recordOutdated = recordOutdatedStub;
      acaciaUpdater.processInvoices = processInvoicesStub;
      acaciaUpdater.resyncSubscription = resyncSubscriptionStub;
      return acaciaUpdater;
    };

    beforeEach(() => {
      recordOutdatedStub = jest.fn();
      processInvoicesStub = jest.fn().mockResolvedValue(undefined);
      resyncSubscriptionStub = jest.fn().mockResolvedValue(undefined);
    });

    describe('subscription already in the current shape', () => {
      beforeEach(async () => {
        await buildUpdaterFor({
          ...mockSubscription,
        }).processSubscription(
          mockCustomer.id,
          mockCustomer.metadata.userid,
          mockSubscription
        );
      });

      it('does not record the subscription as outdated', () => {
        expect(recordOutdatedStub).not.toHaveBeenCalled();
      });

      it('does not resync the subscription', () => {
        expect(resyncSubscriptionStub).not.toHaveBeenCalled();
      });

      it('walks the subscription invoices', () => {
        expect(processInvoicesStub).toHaveBeenCalledWith(
          mockCustomer.id,
          mockCustomer.metadata.userid,
          mockSubscription.id
        );
      });
    });

    describe('subscription still in the pre-cutover shape', () => {
      beforeEach(async () => {
        await buildUpdaterFor(mockAcaciaSubscription).processSubscription(
          mockCustomer.id,
          mockCustomer.metadata.userid,
          mockSubscription
        );
      });

      it('records the subscription as outdated', () => {
        expect(recordOutdatedStub).toHaveBeenCalledWith(
          'subscription',
          mockCustomer.id,
          mockCustomer.metadata.userid,
          mockSubscription.id
        );
      });

      it('resyncs that subscription rather than the whole customer', () => {
        expect(resyncSubscriptionStub).toHaveBeenCalledWith(
          mockSubscription.id,
          mockCustomer.id,
          mockCustomer.metadata.userid
        );
      });

      it('still walks the subscription invoices', () => {
        expect(processInvoicesStub).toHaveBeenCalledWith(
          mockCustomer.id,
          mockCustomer.metadata.userid,
          mockSubscription.id
        );
      });
    });

    describe('subscription missing in Firestore', () => {
      beforeEach(async () => {
        await buildUpdaterFor().processSubscription(
          mockCustomer.id,
          mockCustomer.metadata.userid,
          mockSubscription
        );
      });

      it('leaves the missing doc to the sync checker', () => {
        expect(recordOutdatedStub).not.toHaveBeenCalled();
        expect(resyncSubscriptionStub).not.toHaveBeenCalled();
      });

      it('counts it as a missing doc rather than a current shape', () => {
        expect(acaciaUpdater['subscriptionsMissingDoc']).toBe(1);
        expect(acaciaUpdater['subscriptionsCurrentShape']).toBe(0);
      });
    });

    describe('invoice walk fails', () => {
      beforeEach(async () => {
        firestoreStub = buildFirestoreStub({
          subscriptionSnapshot: snapshotOf(mockAcaciaSubscription),
          invoiceReadError: new Error('Firestore error'),
        });

        acaciaUpdater = buildUpdater();
        acaciaUpdater.recordOutdated = recordOutdatedStub;
        acaciaUpdater.resyncSubscription = resyncSubscriptionStub;

        await acaciaUpdater.processSubscription(
          mockCustomer.id,
          mockCustomer.metadata.userid,
          mockSubscription
        );
      });

      it('still resyncs the subscription', () => {
        expect(resyncSubscriptionStub).toHaveBeenCalledWith(
          mockSubscription.id,
          mockCustomer.id,
          mockCustomer.metadata.userid
        );
      });

      it('counts the subscription as having an unexamined invoice walk', () => {
        expect(acaciaUpdater['subscriptionsInvoiceWalkFailed']).toBe(1);
        expect(acaciaUpdater['invoicesChecked']).toBe(0);
      });

      it('logs the invoice error rather than the subscription error', () => {
        expect(logStub.error).toHaveBeenCalledWith(
          'error-processing-invoices',
          {
            customerId: mockCustomer.id,
            uid: mockCustomer.metadata.userid,
            subscriptionId: mockSubscription.id,
            error: expect.any(Error),
          }
        );
        expect(logStub.error).not.toHaveBeenCalledWith(
          'error-processing-subscription',
          expect.anything()
        );
      });
    });

    describe('error processing subscription', () => {
      beforeEach(async () => {
        firestoreStub = buildFirestoreStub();
        firestoreStub.collection = jest.fn().mockReturnValue({
          doc: jest.fn().mockImplementation(() => {
            throw new Error('Firestore error');
          }),
        });

        acaciaUpdater = buildUpdater();
        acaciaUpdater.resyncSubscription = resyncSubscriptionStub;

        await acaciaUpdater.processSubscription(
          mockCustomer.id,
          mockCustomer.metadata.userid,
          mockSubscription
        );
      });

      it('logs error', () => {
        expect(logStub.error).toHaveBeenCalledWith(
          'error-processing-subscription',
          expect.any(Object)
        );
      });

      it('does not resync the subscription', () => {
        expect(resyncSubscriptionStub).not.toHaveBeenCalled();
      });
    });
  });

  describe('processInvoices', () => {
    let recordOutdatedStub: jest.Mock;
    let resyncInvoiceStub: jest.Mock;

    const buildUpdaterFor = (
      invoiceDocs: { id: string; data: () => any }[]
    ) => {
      firestoreStub = buildFirestoreStub({ invoiceDocs });

      acaciaUpdater = buildUpdater();
      acaciaUpdater.recordOutdated = recordOutdatedStub;
      acaciaUpdater.resyncInvoice = resyncInvoiceStub;
      return acaciaUpdater;
    };

    beforeEach(() => {
      recordOutdatedStub = jest.fn();
      resyncInvoiceStub = jest.fn().mockResolvedValue(undefined);
    });

    describe('invoice still in the pre-cutover shape', () => {
      beforeEach(async () => {
        await buildUpdaterFor([
          invoiceDocOf('in_acacia', mockAcaciaInvoice),
        ]).processInvoices(
          mockCustomer.id,
          mockCustomer.metadata.userid,
          mockSubscription.id
        );
      });

      it('records the invoice as outdated', () => {
        expect(recordOutdatedStub).toHaveBeenCalledWith(
          'invoice',
          mockCustomer.id,
          mockCustomer.metadata.userid,
          mockSubscription.id,
          'in_acacia'
        );
      });

      it('resyncs the invoice', () => {
        expect(resyncInvoiceStub).toHaveBeenCalledWith(
          'in_acacia',
          mockCustomer.id,
          mockSubscription.id
        );
      });
    });

    describe('invoice already in the current shape', () => {
      beforeEach(async () => {
        await buildUpdaterFor([
          invoiceDocOf('in_dahlia', StripeInvoiceFactory()),
        ]).processInvoices(
          mockCustomer.id,
          mockCustomer.metadata.userid,
          mockSubscription.id
        );
      });

      it('does not record the invoice as outdated', () => {
        expect(recordOutdatedStub).not.toHaveBeenCalled();
      });

      it('does not resync the invoice', () => {
        expect(resyncInvoiceStub).not.toHaveBeenCalled();
      });
    });

    it('counts every invoice it walks', async () => {
      const updater = buildUpdaterFor([
        invoiceDocOf('in_acacia', mockAcaciaInvoice),
        invoiceDocOf('in_dahlia', StripeInvoiceFactory()),
      ]);

      await updater.processInvoices(
        mockCustomer.id,
        mockCustomer.metadata.userid,
        mockSubscription.id
      );

      expect(updater['invoicesChecked']).toBe(2);
    });
  });

  describe('recordOutdated', () => {
    it('increments the outdated subscription counter', () => {
      acaciaUpdater.recordOutdated(
        'subscription',
        mockCustomer.id,
        mockCustomer.metadata.userid,
        mockSubscription.id
      );

      expect(acaciaUpdater['subscriptionsOutdatedShape']).toBe(1);
      expect(acaciaUpdater['invoicesOutdatedShape']).toBe(0);
    });

    it('increments the outdated invoice counter', () => {
      acaciaUpdater.recordOutdated(
        'invoice',
        mockCustomer.id,
        mockCustomer.metadata.userid,
        mockSubscription.id,
        'in_acacia'
      );

      expect(acaciaUpdater['invoicesOutdatedShape']).toBe(1);
      expect(acaciaUpdater['subscriptionsOutdatedShape']).toBe(0);
    });

    it('logs the outdated record', () => {
      acaciaUpdater.recordOutdated(
        'invoice',
        mockCustomer.id,
        mockCustomer.metadata.userid,
        mockSubscription.id,
        'in_acacia'
      );

      expect(logStub.warn).toHaveBeenCalledWith(
        'firestore-acacia-record-outdated',
        {
          type: 'invoice',
          customerId: mockCustomer.id,
          uid: mockCustomer.metadata.userid,
          subscriptionId: mockSubscription.id,
          invoiceId: 'in_acacia',
        }
      );
    });
  });

  describe('resyncSubscription', () => {
    const resync = (updater: FirestoreAcaciaUpdater) =>
      updater.resyncSubscription(
        mockSubscription.id,
        mockCustomer.id,
        mockCustomer.metadata.userid
      );

    it('rewrites the subscription through the locking Firestore path', async () => {
      await resync(acaciaUpdater);

      expect(
        lastStripeFirestore().fetchAndInsertSubscription
      ).toHaveBeenCalledWith(mockSubscription.id, mockCustomer.metadata.userid);
      expect(
        lastStripeFirestore().fetchAndInsertCustomer
      ).not.toHaveBeenCalled();
    });

    it('writes nothing on a dry run', async () => {
      const dryRunUpdater = buildUpdater(true);

      await resync(dryRunUpdater);

      expect(
        lastStripeFirestore().fetchAndInsertSubscription
      ).not.toHaveBeenCalled();
    });

    it('logs error on failure', async () => {
      lastStripeFirestore().fetchAndInsertSubscription.mockRejectedValue(
        new Error('Firestore error')
      );

      await resync(acaciaUpdater);

      expect(logStub.error).toHaveBeenCalledWith(
        'failed-to-resync-subscription',
        {
          subscriptionId: mockSubscription.id,
          customerId: mockCustomer.id,
          uid: mockCustomer.metadata.userid,
          error: expect.any(Error),
        }
      );
    });
  });

  describe('resyncInvoice', () => {
    it('rewrites the invoice from Stripe', async () => {
      await acaciaUpdater.resyncInvoice(
        'in_acacia',
        mockCustomer.id,
        mockSubscription.id
      );

      expect(lastStripeFirestore().fetchAndInsertInvoice).toHaveBeenCalledWith(
        'in_acacia',
        expect.any(Number)
      );
    });

    it('writes nothing on a dry run', async () => {
      const dryRunUpdater = buildUpdater(true);

      await dryRunUpdater.resyncInvoice(
        'in_acacia',
        mockCustomer.id,
        mockSubscription.id
      );

      expect(
        lastStripeFirestore().fetchAndInsertInvoice
      ).not.toHaveBeenCalled();
    });

    it('logs error on failure', async () => {
      lastStripeFirestore().fetchAndInsertInvoice.mockRejectedValue(
        new Error('Firestore error')
      );

      await acaciaUpdater.resyncInvoice(
        'in_acacia',
        mockCustomer.id,
        mockSubscription.id
      );

      expect(logStub.error).toHaveBeenCalledWith('failed-to-resync-invoice', {
        invoiceId: 'in_acacia',
        customerId: mockCustomer.id,
        subscriptionId: mockSubscription.id,
        error: expect.any(Error),
      });
    });
  });
});

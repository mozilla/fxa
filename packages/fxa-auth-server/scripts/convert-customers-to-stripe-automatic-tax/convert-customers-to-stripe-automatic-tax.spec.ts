/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Container from 'typedi';
import fs from 'fs';

import { ConfigType } from '../../config';
import { AppConfig, AuthFirestore } from '../../lib/types';

import { StripeAutomaticTaxConverter } from './convert-customers-to-stripe-automatic-tax';
import {
  FirestoreSubscription,
  IpAddressMapFileEntry,
  StripeAutomaticTaxConverterHelpers,
} from './helpers';
import Stripe from 'stripe';
import { StripeHelper } from '../../lib/payments/stripe';

import plan1 from '../../test/local/payments/fixtures/stripe/plan1.json';
import product1 from '../../test/local/payments/fixtures/stripe/product1.json';
import customer1 from '../../test/local/payments/fixtures/stripe/customer1.json';
import subscription1 from '../../test/local/payments/fixtures/stripe/subscription1.json';
import invoicePreviewTax from '../../test/local/payments/fixtures/stripe/invoice_preview_tax.json';

const mockPlan = plan1 as unknown as Stripe.Plan;
const mockProduct = product1 as unknown as Stripe.Product;
const mockCustomer = customer1 as unknown as Stripe.Customer;
const mockSubscription = subscription1 as unknown as FirestoreSubscription;
const mockInvoicePreview = invoicePreviewTax as unknown as Stripe.Invoice;

const mockAccount = {
  locale: 'en-US',
};

const mockConfig = {
  authFirestore: {
    prefix: 'mock-fxa-',
  },
  subscriptions: {
    playApiServiceAccount: {
      credentials: {
        clientEmail: 'mock-client-email',
      },
      keyFile: 'mock-private-keyfile',
    },
    productConfigsFirestore: {
      schemaValidation: {
        cdnUrlRegex: ['^http'],
      },
    },
  },
} as unknown as ConfigType;

describe('StripeAutomaticTaxConverter', () => {
  let stripeAutomaticTaxConverter: StripeAutomaticTaxConverter;
  let helperStub: any;
  let stripeStub: Stripe;
  let stripeHelperStub: StripeHelper;
  let dbStub: any;
  let geodbStub: jest.Mock;
  let firestoreGetStub: jest.Mock;
  let mockIpAddressMapping: IpAddressMapFileEntry[];
  let readFileSyncStub: jest.SpyInstance;

  beforeEach(() => {
    mockIpAddressMapping = [
      {
        uid: 'mock-uid',
        remote_address_chain: '1.1.1.1',
      },
    ];
    readFileSyncStub = jest
      .spyOn(fs, 'readFileSync')
      .mockReturnValue(JSON.stringify(mockIpAddressMapping));

    firestoreGetStub = jest.fn();
    Container.set(AuthFirestore, {
      collectionGroup: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        startAfter: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: firestoreGetStub,
      }),
    });

    Container.set(AppConfig, mockConfig);

    helperStub = {
      processIPAddressList: jest.fn(),
      filterEligibleSubscriptions: jest.fn(),
      isTaxEligible: jest.fn(),
      getSpecialTaxAmounts: jest.fn(),
    };
    Container.set(StripeAutomaticTaxConverterHelpers, helperStub);

    helperStub.processIPAddressList.mockReturnValue({
      [mockIpAddressMapping[0].uid]:
        mockIpAddressMapping[0].remote_address_chain,
    });

    geodbStub = jest.fn();

    stripeStub = {
      on: jest.fn(),
      products: {},
      customers: {},
      subscriptions: {},
      invoices: {},
    } as unknown as Stripe;

    stripeHelperStub = {
      stripe: stripeStub,
      currencyHelper: {
        isCurrencyCompatibleWithCountry: jest.fn(),
      },
    } as unknown as StripeHelper;

    dbStub = {
      account: jest.fn(),
    };

    stripeAutomaticTaxConverter = new StripeAutomaticTaxConverter(
      geodbStub,
      100,
      './stripe-automatic-tax-converter.tmp.csv',
      './stripe-automatic-tax-converter-ipaddresses.tmp.json',
      stripeHelperStub,
      20,
      dbStub
    );
  });

  afterEach(() => {
    readFileSyncStub.mockRestore();
    Container.reset();
  });

  describe('convert', () => {
    let fetchSubsBatchStub: jest.Mock;
    let generateReportForSubscriptionStub: jest.Mock;
    const mockSubs = [mockSubscription];

    beforeEach(async () => {
      fetchSubsBatchStub = jest
        .fn()
        .mockReturnValueOnce(mockSubs)
        .mockReturnValueOnce([]);
      stripeAutomaticTaxConverter.fetchSubsBatch = fetchSubsBatchStub as any;

      generateReportForSubscriptionStub = jest.fn();
      stripeAutomaticTaxConverter.generateReportForSubscription =
        generateReportForSubscriptionStub as any;

      helperStub.filterEligibleSubscriptions.mockImplementation(
        (subscriptions) => subscriptions
      );

      await stripeAutomaticTaxConverter.convert();
    });

    it('fetches subscriptions until no results', () => {
      expect(fetchSubsBatchStub).toHaveBeenCalledTimes(2);
    });

    it('filters ineligible subscriptions', () => {
      expect(helperStub.filterEligibleSubscriptions).toHaveBeenCalledTimes(2);
      expect(helperStub.filterEligibleSubscriptions).toHaveBeenCalledWith(
        mockSubs
      );
    });

    it('generates a report for each applicable subscription', () => {
      expect(generateReportForSubscriptionStub).toHaveBeenCalledTimes(1);
    });
  });

  describe('fetchSubsBatch', () => {
    const mockSubscriptionId = 'mock-id';
    let result: FirestoreSubscription[];

    beforeEach(async () => {
      firestoreGetStub.mockResolvedValue({
        docs: [
          {
            data: jest.fn().mockReturnValue(mockSubscription),
          },
        ],
      });

      result =
        await stripeAutomaticTaxConverter.fetchSubsBatch(mockSubscriptionId);
    });

    it('returns a list of subscriptions from Firestore', () => {
      expect(result).toEqual([mockSubscription]);
    });
  });

  describe('generateReportForSubscription', () => {
    const mockFirestoreSub = {
      id: 'test',
      customer: 'test',
      plan: {
        product: 'example-product',
      },
    } as FirestoreSubscription;
    const mockReport = ['mock-report'];
    let logStub: jest.SpyInstance;
    let enableTaxForCustomer: jest.Mock;
    let enableTaxForSubscription: jest.Mock;
    let fetchInvoicePreview: jest.Mock;
    let buildReport: jest.Mock;
    let writeReportStub: jest.Mock;

    beforeEach(async () => {
      (stripeStub.products as any).retrieve = jest
        .fn()
        .mockResolvedValue(mockProduct);
      fetchInvoicePreview = jest.fn();
      stripeAutomaticTaxConverter.fetchInvoicePreview =
        fetchInvoicePreview as any;
      stripeAutomaticTaxConverter.fetchCustomer = jest
        .fn()
        .mockResolvedValue(mockCustomer) as any;
      dbStub.account.mockResolvedValue({
        locale: 'en-US',
      });
      enableTaxForCustomer = jest.fn().mockResolvedValue(true);
      stripeAutomaticTaxConverter.enableTaxForCustomer =
        enableTaxForCustomer as any;
      stripeAutomaticTaxConverter.isExcludedSubscriptionProduct = jest
        .fn()
        .mockReturnValue(false) as any;
      enableTaxForSubscription = jest.fn().mockResolvedValue(undefined);
      stripeAutomaticTaxConverter.enableTaxForSubscription =
        enableTaxForSubscription as any;
      fetchInvoicePreview = jest
        .fn()
        .mockResolvedValueOnce({
          ...mockInvoicePreview,
          total: (mockInvoicePreview as any).total - 1,
        })
        .mockResolvedValueOnce(mockInvoicePreview);
      stripeAutomaticTaxConverter.fetchInvoicePreview =
        fetchInvoicePreview as any;
      buildReport = jest.fn().mockReturnValue(mockReport);
      stripeAutomaticTaxConverter.buildReport = buildReport as any;
      writeReportStub = jest.fn().mockResolvedValue(undefined);
      stripeAutomaticTaxConverter.writeReport = writeReportStub as any;
      logStub = jest.spyOn(console, 'log');
    });

    afterEach(() => {
      logStub.mockRestore();
    });

    describe('success', () => {
      beforeEach(async () => {
        await stripeAutomaticTaxConverter.generateReportForSubscription(
          mockFirestoreSub
        );
      });

      it('enables stripe tax for customer', () => {
        expect(enableTaxForCustomer).toHaveBeenCalledWith(mockCustomer);
      });

      it('enables stripe tax for subscription', () => {
        expect(enableTaxForSubscription).toHaveBeenCalledWith(
          mockFirestoreSub.id
        );
      });

      it('fetches an invoice preview', () => {
        expect(fetchInvoicePreview).toHaveBeenCalledWith(mockFirestoreSub.id);
      });

      it('writes the report to disk', () => {
        expect(writeReportStub).toHaveBeenCalledWith(mockReport);
      });
    });

    describe('invalid', () => {
      it('aborts if customer does not exist', async () => {
        stripeAutomaticTaxConverter.fetchCustomer = jest
          .fn()
          .mockResolvedValue(null) as any;
        await stripeAutomaticTaxConverter.generateReportForSubscription(
          mockFirestoreSub
        );

        expect(enableTaxForCustomer).not.toHaveBeenCalled();
        expect(enableTaxForSubscription).not.toHaveBeenCalled();
        expect(writeReportStub).not.toHaveBeenCalled();
      });

      it('aborts if account for customer does not exist', async () => {
        dbStub.account.mockResolvedValue(null);
        await stripeAutomaticTaxConverter.generateReportForSubscription(
          mockFirestoreSub
        );

        expect(enableTaxForCustomer).not.toHaveBeenCalled();
        expect(enableTaxForSubscription).not.toHaveBeenCalled();
        expect(writeReportStub).not.toHaveBeenCalled();
      });

      it('aborts if customer is not taxable', async () => {
        stripeAutomaticTaxConverter.enableTaxForCustomer = jest
          .fn()
          .mockResolvedValue(false) as any;
        await stripeAutomaticTaxConverter.generateReportForSubscription(
          mockFirestoreSub
        );

        expect(enableTaxForCustomer).not.toHaveBeenCalled();
        expect(enableTaxForSubscription).not.toHaveBeenCalled();
        expect(writeReportStub).not.toHaveBeenCalled();
      });

      it('does not save report to CSV if total has not changed', async () => {
        stripeAutomaticTaxConverter.fetchInvoicePreview = jest
          .fn()
          .mockResolvedValue(mockInvoicePreview) as any;
        await stripeAutomaticTaxConverter.generateReportForSubscription(
          mockFirestoreSub
        );

        expect(enableTaxForCustomer).toHaveBeenCalled();
        expect(enableTaxForSubscription).toHaveBeenCalled();
        expect(writeReportStub).not.toHaveBeenCalled();
      });

      it('does not update subscription for ineligible product', async () => {
        stripeAutomaticTaxConverter.isExcludedSubscriptionProduct = jest
          .fn()
          .mockReturnValue(true) as any;
        await stripeAutomaticTaxConverter.generateReportForSubscription(
          mockFirestoreSub
        );

        expect(enableTaxForCustomer).not.toHaveBeenCalled();
        expect(enableTaxForSubscription).not.toHaveBeenCalled();
        expect(writeReportStub).not.toHaveBeenCalled();
      });
    });
  });

  describe('fetchCustomer', () => {
    let customerRetrieveStub: jest.Mock;
    let result: Stripe.Customer | null;

    describe('customer exists', () => {
      beforeEach(async () => {
        customerRetrieveStub = jest.fn().mockResolvedValue(mockCustomer);
        stripeStub.customers.retrieve = customerRetrieveStub as any;

        result = await stripeAutomaticTaxConverter.fetchCustomer(
          mockCustomer.id
        );
      });

      it('fetches customer from Stripe', () => {
        expect(customerRetrieveStub).toHaveBeenCalledWith(mockCustomer.id, {
          expand: ['tax'],
        });
      });

      it('returns customer', () => {
        expect(result).toEqual(mockCustomer);
      });
    });

    describe('customer deleted', () => {
      beforeEach(async () => {
        const deletedCustomer = {
          ...mockCustomer,
          deleted: true,
        };
        customerRetrieveStub = jest.fn().mockResolvedValue(deletedCustomer);
        stripeStub.customers.retrieve = customerRetrieveStub as any;

        result = await stripeAutomaticTaxConverter.fetchCustomer(
          mockCustomer.id
        );
      });

      it('returns null', () => {
        expect(result).toEqual(null);
      });
    });
  });

  describe('enableTaxForCustomer', () => {
    let updateStub: jest.Mock;
    let result: boolean;

    describe('tax already enabled', () => {
      beforeEach(async () => {
        helperStub.isTaxEligible.mockReturnValue(true);
        updateStub = jest.fn().mockResolvedValue(mockCustomer);
        stripeStub.customers.update = updateStub as any;

        result =
          await stripeAutomaticTaxConverter.enableTaxForCustomer(mockCustomer);
      });

      it('does not update customer', () => {
        expect(updateStub).not.toHaveBeenCalled();
      });

      it('returns true', () => {
        expect(result).toBe(true);
      });
    });

    describe('tax not enabled', () => {
      beforeEach(async () => {
        helperStub.isTaxEligible
          .mockReturnValueOnce(false)
          .mockReturnValueOnce(true);
        updateStub = jest.fn().mockResolvedValue(mockCustomer);
        stripeStub.customers.update = updateStub as any;
        stripeAutomaticTaxConverter.fetchCustomer = jest
          .fn()
          .mockResolvedValue(mockCustomer) as any;
      });

      describe("invalid IP address, can't resolve geolocation", () => {
        beforeEach(async () => {
          geodbStub.mockReturnValue({});

          result = await stripeAutomaticTaxConverter.enableTaxForCustomer({
            ...mockCustomer,
            metadata: {
              userid: mockIpAddressMapping[0].uid,
            },
          } as any);
        });

        it('does not update customer', () => {
          expect(updateStub).not.toHaveBeenCalled();
        });

        it('returns false', () => {
          expect(result).toBe(false);
        });
      });

      describe("invalid IP address, isn't in same country", () => {
        beforeEach(async () => {
          geodbStub.mockReturnValue({
            postalCode: 'ABC',
            countryCode: 'ZZZ',
          });

          (
            stripeHelperStub.currencyHelper as any
          ).isCurrencyCompatibleWithCountry = jest.fn().mockReturnValue(false);

          result = await stripeAutomaticTaxConverter.enableTaxForCustomer({
            ...mockCustomer,
            metadata: {
              userid: mockIpAddressMapping[0].uid,
            },
          } as any);
        });

        it('does not update customer', () => {
          expect(updateStub).not.toHaveBeenCalled();
        });

        it('returns false', () => {
          expect(result).toBe(false);
        });
      });

      describe('valid IP address', () => {
        beforeEach(async () => {
          geodbStub.mockReturnValue({
            countryCode: 'US',
            postalCode: 92841,
          });

          (
            stripeHelperStub.currencyHelper as any
          ).isCurrencyCompatibleWithCountry = jest.fn().mockReturnValue(true);

          result = await stripeAutomaticTaxConverter.enableTaxForCustomer({
            ...mockCustomer,
            metadata: {
              userid: mockIpAddressMapping[0].uid,
            },
          } as any);
        });

        it('updates customer', () => {
          expect(updateStub).toHaveBeenCalledWith(mockCustomer.id, {
            shipping: {
              name: mockCustomer.email,
              address: {
                country: 'US',
                postal_code: 92841,
              },
            },
          });
        });

        it('returns true', () => {
          expect(result).toBe(true);
        });
      });
    });
  });

  describe('isEligibleSubscriptionProduct', () => {
    let result: boolean;
    const VALID_PRODUCT = 'valid';
    const EXCLUDED_PRODUCT = 'prod_HEJ13uxjG4Rj6L';

    it('returns false if the product is not excluded', () => {
      result =
        stripeAutomaticTaxConverter.isExcludedSubscriptionProduct(
          VALID_PRODUCT
        );
      expect(result).toBe(false);
    });

    it('returns true if the product is meant to be excluded', () => {
      result =
        stripeAutomaticTaxConverter.isExcludedSubscriptionProduct(
          EXCLUDED_PRODUCT
        );
      expect(result).toBe(true);
    });
  });

  describe('enableTaxForSubscription', () => {
    let updateStub: jest.Mock;
    let retrieveStub: jest.Mock;

    beforeEach(async () => {
      updateStub = jest.fn().mockResolvedValue(mockSubscription);
      stripeStub.subscriptions.update = updateStub as any;
      retrieveStub = jest.fn().mockResolvedValue(mockSubscription);
      stripeStub.subscriptions.retrieve = retrieveStub as any;

      await stripeAutomaticTaxConverter.enableTaxForSubscription(
        mockSubscription.id
      );
    });

    it('updates the subscription', () => {
      expect(updateStub).toHaveBeenCalledWith(mockSubscription.id, {
        automatic_tax: {
          enabled: true,
        },
        proration_behavior: 'none',
        items: [
          {
            id: mockSubscription.items.data[0].id,
            tax_rates: '',
          },
        ],
        default_tax_rates: '',
      });
    });
  });

  describe('fetchInvoicePreview', () => {
    let result: Stripe.Response<Stripe.UpcomingInvoice>;
    let stub: jest.Mock;

    beforeEach(async () => {
      stub = jest.fn().mockResolvedValue(mockInvoicePreview);
      stripeStub.invoices.retrieveUpcoming = stub as any;

      result = await stripeAutomaticTaxConverter.fetchInvoicePreview(
        mockSubscription.id
      );
    });

    it('calls stripe for the invoice preview', () => {
      expect(stub).toHaveBeenCalledWith({
        subscription: mockSubscription.id,
        expand: ['total_tax_amounts.tax_rate'],
      });
    });

    it('returns invoice preview', () => {
      expect(result).toEqual(mockInvoicePreview);
    });
  });

  describe('buildReport', () => {
    it('returns a report', () => {
      const mockSpecialTaxAmounts = {
        hst: 10,
        gst: 11,
        pst: 12,
        qst: 13,
        rst: 14,
      };
      helperStub.getSpecialTaxAmounts.mockReturnValue(mockSpecialTaxAmounts);

      // Invoice preview with tax doesn't include total_excluding_tax which we need
      const _mockInvoicePreview = {
        ...mockInvoicePreview,
        total_excluding_tax: 10,
      };

      const result = stripeAutomaticTaxConverter.buildReport(
        mockCustomer,
        mockAccount,
        mockSubscription as any,
        mockProduct,
        mockPlan,
        _mockInvoicePreview as any
      );

      expect(result).toEqual([
        mockCustomer.metadata.userid,
        `"${mockCustomer.email}"`,
        mockProduct.id,
        `"${mockProduct.name}"`,
        mockPlan.id,
        `"${mockPlan.nickname}"`,
        mockPlan.interval_count,
        mockPlan.interval,
        (_mockInvoicePreview as any).total_excluding_tax,
        (_mockInvoicePreview as any).tax,
        mockSpecialTaxAmounts.hst,
        mockSpecialTaxAmounts.gst,
        mockSpecialTaxAmounts.pst,
        mockSpecialTaxAmounts.qst,
        mockSpecialTaxAmounts.rst,
        (_mockInvoicePreview as any).total,
        mockSubscription.current_period_end,
        `"${mockAccount.locale}"`,
      ]);
    });
  });
});

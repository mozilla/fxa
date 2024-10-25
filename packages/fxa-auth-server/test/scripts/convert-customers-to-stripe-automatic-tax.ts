/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import cp from 'child_process';
import util from 'util';
import path from 'path';
import sinon from 'sinon';
import { expect } from 'chai';
import Container from 'typedi';
import fs from 'fs';

import { ConfigType } from '../../config';
import { AppConfig, AuthFirestore } from '../../lib/types';

import { StripeAutomaticTaxConverter } from '../../scripts/convert-customers-to-stripe-automatic-tax/convert-customers-to-stripe-automatic-tax';
import {
  FirestoreSubscription,
  IpAddressMapFileEntry,
  StripeAutomaticTaxConverterHelpers,
} from '../../scripts/convert-customers-to-stripe-automatic-tax/helpers';
import Stripe from 'stripe';
import { StripeHelper } from '../../lib/payments/stripe';

import plan1 from '../local/payments/fixtures/stripe/plan1.json';
import product1 from '../local/payments/fixtures/stripe/product1.json';
import customer1 from '../local/payments/fixtures/stripe/customer1.json';
import subscription1 from '../local/payments/fixtures/stripe/subscription1.json';
import invoicePreviewTax from '../local/payments/fixtures/stripe/invoice_preview_tax.json';

const mockPlan = plan1 as unknown as Stripe.Plan;
const mockProduct = product1 as unknown as Stripe.Product;
const mockCustomer = customer1 as unknown as Stripe.Customer;
const mockSubscription = subscription1 as unknown as FirestoreSubscription;
const mockInvoicePreview = invoicePreviewTax as unknown as Stripe.Invoice;

const mockAccount = {
  locale: 'en-US',
};

const ROOT_DIR = '../..';
const execAsync = util.promisify(cp.exec);
const cwd = path.resolve(__dirname, ROOT_DIR);
const execOptions = {
  cwd,
  env: {
    ...process.env,
    NODE_ENV: 'dev',
    LOG_LEVEL: 'error',
    AUTH_FIRESTORE_EMULATOR_HOST: 'localhost:9090',
  },
};

describe('starting script', () => {
  it('does not fail', function () {
    this.timeout(20000);
    return execAsync(
      'node -r esbuild-register scripts/remove-unverified-accounts.ts',
      execOptions
    );
  });
});

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
        cdnUrlRegex: '^http',
      },
    },
  },
} as unknown as ConfigType;

describe('StripeAutomaticTaxConverter', () => {
  let stripeAutomaticTaxConverter: StripeAutomaticTaxConverter;
  let helperStub: sinon.SinonStubbedInstance<StripeAutomaticTaxConverterHelpers>;
  let stripeStub: Stripe;
  let stripeHelperStub: StripeHelper;
  let dbStub: any;
  let geodbStub: sinon.SinonStub;
  let firestoreGetStub: sinon.SinonStub;
  let mockIpAddressMapping: IpAddressMapFileEntry[];
  let readFileSyncStub: sinon.SinonStub;

  beforeEach(() => {
    mockIpAddressMapping = [
      {
        uid: 'mock-uid',
        remote_address_chain: '1.1.1.1',
      },
    ];
    readFileSyncStub = sinon
      .stub(fs, 'readFileSync')
      .returns(JSON.stringify(mockIpAddressMapping));

    firestoreGetStub = sinon.stub();
    Container.set(AuthFirestore, {
      collectionGroup: sinon.stub().returns({
        where: sinon.stub().returnsThis(),
        orderBy: sinon.stub().returnsThis(),
        startAfter: sinon.stub().returnsThis(),
        limit: sinon.stub().returnsThis(),
        get: firestoreGetStub,
      }),
    });

    Container.set(AppConfig, mockConfig);

    helperStub = sinon.createStubInstance(StripeAutomaticTaxConverterHelpers);
    Container.set(StripeAutomaticTaxConverterHelpers, helperStub);

    helperStub.processIPAddressList.returns({
      [mockIpAddressMapping[0].uid]:
        mockIpAddressMapping[0].remote_address_chain,
    });

    geodbStub = sinon.stub();

    stripeStub = {
      on: sinon.stub(),
      products: {},
      customers: {},
      subscriptions: {},
      invoices: {},
    } as unknown as Stripe;

    stripeHelperStub = {
      stripe: stripeStub,
      currencyHelper: {
        isCurrencyCompatibleWithCountry: sinon.stub(),
      },
    } as unknown as StripeHelper;

    dbStub = {
      account: sinon.stub(),
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
    readFileSyncStub.restore();
    Container.reset();
  });

  describe('convert', () => {
    let fetchSubsBatchStub: sinon.SinonStub;
    let generateReportForSubscriptionStub: sinon.SinonStub;
    const mockSubs = [mockSubscription];

    beforeEach(async () => {
      fetchSubsBatchStub = sinon
        .stub()
        .onFirstCall()
        .returns(mockSubs)
        .onSecondCall()
        .returns([]);
      stripeAutomaticTaxConverter.fetchSubsBatch = fetchSubsBatchStub;

      generateReportForSubscriptionStub = sinon.stub();
      stripeAutomaticTaxConverter.generateReportForSubscription =
        generateReportForSubscriptionStub;

      helperStub.filterEligibleSubscriptions.callsFake(
        (subscriptions) => subscriptions
      );

      await stripeAutomaticTaxConverter.convert();
    });

    it('fetches subscriptions until no results', () => {
      expect(fetchSubsBatchStub.callCount).eq(2);
    });

    it('filters ineligible subscriptions', () => {
      expect(helperStub.filterEligibleSubscriptions.callCount).eq(2);
      expect(helperStub.filterEligibleSubscriptions.calledWith(mockSubs)).true;
    });

    it('generates a report for each applicable subscription', () => {
      expect(generateReportForSubscriptionStub.callCount).eq(1);
    });
  });

  describe('fetchSubsBatch', () => {
    const mockSubscriptionId = 'mock-id';
    let result: FirestoreSubscription[];

    beforeEach(async () => {
      firestoreGetStub.resolves({
        docs: [
          {
            data: sinon.stub().returns(mockSubscription),
          },
        ],
      });

      result = await stripeAutomaticTaxConverter.fetchSubsBatch(
        mockSubscriptionId
      );
    });

    it('returns a list of subscriptions from Firestore', () => {
      sinon.assert.match(result, [mockSubscription]);
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
    let logStub: sinon.SinonStub;
    let enableTaxForCustomer: sinon.SinonStub;
    let enableTaxForSubscription: sinon.SinonStub;
    let fetchInvoicePreview: sinon.SinonStub;
    let buildReport: sinon.SinonStub;
    let writeReportStub: sinon.SinonStub;

    beforeEach(async () => {
      stripeStub.products.retrieve = sinon.stub().resolves(mockProduct);
      fetchInvoicePreview = sinon.stub();
      stripeAutomaticTaxConverter.fetchInvoicePreview = fetchInvoicePreview;
      stripeAutomaticTaxConverter.fetchCustomer = sinon
        .stub()
        .resolves(mockCustomer);
      dbStub.account.resolves({
        locale: 'en-US',
      });
      enableTaxForCustomer = sinon.stub().resolves(true);
      stripeAutomaticTaxConverter.enableTaxForCustomer = enableTaxForCustomer;
      stripeAutomaticTaxConverter.isExcludedSubscriptionProduct = sinon
        .stub()
        .returns(false);
      enableTaxForSubscription = sinon.stub().resolves();
      stripeAutomaticTaxConverter.enableTaxForSubscription =
        enableTaxForSubscription;
      fetchInvoicePreview = sinon
        .stub()
        .onFirstCall()
        .resolves({
          ...mockInvoicePreview,
          total: mockInvoicePreview.total - 1,
        })
        .onSecondCall()
        .resolves(mockInvoicePreview);
      stripeAutomaticTaxConverter.fetchInvoicePreview = fetchInvoicePreview;
      buildReport = sinon.stub().returns(mockReport);
      stripeAutomaticTaxConverter.buildReport = buildReport;
      writeReportStub = sinon.stub().resolves();
      stripeAutomaticTaxConverter.writeReport = writeReportStub;
      logStub = sinon.stub(console, 'log');
    });

    afterEach(() => {
      logStub.restore();
    });

    describe('success', () => {
      beforeEach(async () => {
        await stripeAutomaticTaxConverter.generateReportForSubscription(
          mockFirestoreSub
        );
      });

      it('enables stripe tax for customer', () => {
        expect(enableTaxForCustomer.calledWith(mockCustomer)).true;
      });

      it('enables stripe tax for subscription', () => {
        expect(enableTaxForSubscription.calledWith(mockFirestoreSub.id)).true;
      });

      it('fetches an invoice preview', () => {
        expect(fetchInvoicePreview.calledWith(mockFirestoreSub.id)).true;
      });

      it('writes the report to disk', () => {
        expect(writeReportStub.calledWith(mockReport)).true;
      });
    });

    describe('invalid', () => {
      it('aborts if customer does not exist', async () => {
        stripeAutomaticTaxConverter.fetchCustomer = sinon.stub().resolves(null);
        await stripeAutomaticTaxConverter.generateReportForSubscription(
          mockFirestoreSub
        );

        expect(enableTaxForCustomer.notCalled).true;
        expect(enableTaxForSubscription.notCalled).true;
        expect(writeReportStub.notCalled).true;
      });

      it('aborts if account for customer does not exist', async () => {
        dbStub.account.resolves(null);
        await stripeAutomaticTaxConverter.generateReportForSubscription(
          mockFirestoreSub
        );

        expect(enableTaxForCustomer.notCalled).true;
        expect(enableTaxForSubscription.notCalled).true;
        expect(writeReportStub.notCalled).true;
      });

      it('aborts if customer is not taxable', async () => {
        stripeAutomaticTaxConverter.enableTaxForCustomer = sinon
          .stub()
          .resolves(false);
        await stripeAutomaticTaxConverter.generateReportForSubscription(
          mockFirestoreSub
        );

        expect(enableTaxForCustomer.notCalled).true;
        expect(enableTaxForSubscription.notCalled).true;
        expect(writeReportStub.notCalled).true;
      });

      it('does not save report to CSV if total has not changed', async () => {
        stripeAutomaticTaxConverter.fetchInvoicePreview = sinon
          .stub()
          .resolves(mockInvoicePreview);
        await stripeAutomaticTaxConverter.generateReportForSubscription(
          mockFirestoreSub
        );

        expect(enableTaxForCustomer.called).true;
        expect(enableTaxForSubscription.called).true;
        expect(writeReportStub.notCalled).true;
      });

      it('does not update subscription for ineligible product', async () => {
        stripeAutomaticTaxConverter.isExcludedSubscriptionProduct = sinon
          .stub()
          .returns(true);
        await stripeAutomaticTaxConverter.generateReportForSubscription(
          mockFirestoreSub
        );

        expect(enableTaxForCustomer.notCalled).true;
        expect(enableTaxForSubscription.notCalled).true;
        expect(writeReportStub.notCalled).true;
      });
    });
  });

  describe('fetchCustomer', () => {
    let customerRetrieveStub: sinon.SinonStub;
    let result: Stripe.Customer | null;

    describe('customer exists', () => {
      beforeEach(async () => {
        customerRetrieveStub = sinon.stub().resolves(mockCustomer);
        stripeStub.customers.retrieve = customerRetrieveStub;

        result = await stripeAutomaticTaxConverter.fetchCustomer(
          mockCustomer.id
        );
      });

      it('fetches customer from Stripe', () => {
        expect(
          customerRetrieveStub.calledWith(mockCustomer.id, {
            expand: ['tax'],
          })
        ).true;
      });

      it('returns customer', () => {
        sinon.assert.match(result, mockCustomer);
      });
    });

    describe('customer deleted', () => {
      beforeEach(async () => {
        const deletedCustomer = {
          ...mockCustomer,
          deleted: true,
        };
        customerRetrieveStub = sinon.stub().resolves(deletedCustomer);
        stripeStub.customers.retrieve = customerRetrieveStub;

        result = await stripeAutomaticTaxConverter.fetchCustomer(
          mockCustomer.id
        );
      });

      it('returns null', () => {
        sinon.assert.match(result, null);
      });
    });
  });

  describe('enableTaxForCustomer', () => {
    let updateStub: sinon.SinonStub;
    let result: boolean;

    describe('tax already enabled', () => {
      beforeEach(async () => {
        helperStub.isTaxEligible.returns(true);
        updateStub = sinon.stub().resolves(mockCustomer);
        stripeStub.customers.update = updateStub;

        result = await stripeAutomaticTaxConverter.enableTaxForCustomer(
          mockCustomer
        );
      });

      it('does not update customer', () => {
        expect(updateStub.notCalled).true;
      });

      it('returns true', () => {
        expect(result).true;
      });
    });

    describe('tax not enabled', () => {
      beforeEach(async () => {
        helperStub.isTaxEligible
          .onFirstCall()
          .returns(false)
          .onSecondCall()
          .returns(true);
        updateStub = sinon.stub().resolves(mockCustomer);
        stripeStub.customers.update = updateStub;
        stripeAutomaticTaxConverter.fetchCustomer = sinon
          .stub()
          .resolves(mockCustomer);
      });

      describe("invalid IP address, can't resolve geolocation", () => {
        beforeEach(async () => {
          geodbStub.returns({});

          result = await stripeAutomaticTaxConverter.enableTaxForCustomer({
            ...mockCustomer,
            metadata: {
              userid: mockIpAddressMapping[0].uid,
            },
          });
        });

        it('does not update customer', () => {
          expect(updateStub.notCalled).true;
        });

        it('returns false', () => {
          expect(result).false;
        });
      });

      describe("invalid IP address, isn't in same country", () => {
        beforeEach(async () => {
          geodbStub.returns({
            postalCode: 'ABC',
            countryCode: 'ZZZ',
          });

          stripeHelperStub.currencyHelper.isCurrencyCompatibleWithCountry =
            sinon.stub().returns(false);

          result = await stripeAutomaticTaxConverter.enableTaxForCustomer({
            ...mockCustomer,
            metadata: {
              userid: mockIpAddressMapping[0].uid,
            },
          });
        });

        it('does not update customer', () => {
          expect(updateStub.notCalled).true;
        });

        it('returns false', () => {
          expect(result).false;
        });
      });

      describe('valid IP address', () => {
        beforeEach(async () => {
          geodbStub.returns({
            countryCode: 'US',
            postalCode: 92841,
          });

          stripeHelperStub.currencyHelper.isCurrencyCompatibleWithCountry =
            sinon.stub().returns(true);

          result = await stripeAutomaticTaxConverter.enableTaxForCustomer({
            ...mockCustomer,
            metadata: {
              userid: mockIpAddressMapping[0].uid,
            },
          });
        });

        it('updates customer', () => {
          expect(
            updateStub.calledWith(mockCustomer.id, {
              shipping: {
                name: mockCustomer.email,
                address: {
                  country: 'US',
                  postal_code: 92841,
                },
              },
            })
          ).true;
        });

        it('returns true', () => {
          expect(result).true;
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
      expect(result).false;
    });

    it('returns true if the product is meant to be excluded', () => {
      result =
        stripeAutomaticTaxConverter.isExcludedSubscriptionProduct(
          EXCLUDED_PRODUCT
        );
      expect(result).true;
    });
  });

  describe('enableTaxForSubscription', () => {
    let updateStub: sinon.SinonStub;
    let retrieveStub: sinon.SinonStub;

    beforeEach(async () => {
      updateStub = sinon.stub().resolves(mockSubscription);
      stripeStub.subscriptions.update = updateStub;
      retrieveStub = sinon.stub().resolves(mockSubscription);
      stripeStub.subscriptions.retrieve = retrieveStub;

      await stripeAutomaticTaxConverter.enableTaxForSubscription(
        mockSubscription.id
      );
    });

    it('updates the subscription', () => {
      expect(
        updateStub.calledWith(mockSubscription.id, {
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
        })
      ).true;
    });
  });

  describe('fetchInvoicePreview', () => {
    let result: Stripe.Response<Stripe.UpcomingInvoice>;
    let stub: sinon.SinonStub;

    beforeEach(async () => {
      stub = sinon.stub().resolves(mockInvoicePreview);
      stripeStub.invoices.retrieveUpcoming = stub;

      result = await stripeAutomaticTaxConverter.fetchInvoicePreview(
        mockSubscription.id
      );
    });

    it('calls stripe for the invoice preview', () => {
      expect(
        stub.calledWith({
          subscription: mockSubscription.id,
          expand: ['total_tax_amounts.tax_rate'],
        })
      ).true;
    });

    it('returns invoice preview', () => {
      sinon.assert.match(result, mockInvoicePreview);
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
      helperStub.getSpecialTaxAmounts.returns(mockSpecialTaxAmounts);

      // Invoice preview with tax doesn't include total_excluding_tax which we need
      const _mockInvoicePreview = {
        ...mockInvoicePreview,
        total_excluding_tax: 10,
      };

      const result = stripeAutomaticTaxConverter.buildReport(
        mockCustomer,
        mockAccount,
        mockSubscription,
        mockProduct,
        mockPlan,
        _mockInvoicePreview
      );

      sinon.assert.match(result, [
        mockCustomer.metadata.userid,
        `"${mockCustomer.email}"`,
        mockProduct.id,
        `"${mockProduct.name}"`,
        mockPlan.id,
        `"${mockPlan.nickname}"`,
        mockPlan.interval_count,
        mockPlan.interval,
        _mockInvoicePreview.total_excluding_tax,
        _mockInvoicePreview.tax,
        mockSpecialTaxAmounts.hst,
        mockSpecialTaxAmounts.gst,
        mockSpecialTaxAmounts.pst,
        mockSpecialTaxAmounts.qst,
        mockSpecialTaxAmounts.rst,
        _mockInvoicePreview.total,
        mockSubscription.current_period_end,
        `"${mockAccount.locale}"`,
      ]);
    });
  });
});

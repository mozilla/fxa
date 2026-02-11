/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import sinon from 'sinon';
import { expect } from 'chai';

import {
  FirestoreSubscription,
  StripeAutomaticTaxConverterHelpers,
} from '../../scripts/convert-customers-to-stripe-automatic-tax/helpers';
import Stripe from 'stripe';

import customer1 from '../local/payments/fixtures/stripe/customer1.json';
import subscription1 from '../local/payments/fixtures/stripe/subscription1.json';

const mockCustomer = customer1 as unknown as Stripe.Customer;
const mockSubscription = subscription1 as unknown as FirestoreSubscription;

describe('StripeAutomaticTaxConverterHelpers', () => {
  let helpers: StripeAutomaticTaxConverterHelpers;

  beforeEach(() => {
    helpers = new StripeAutomaticTaxConverterHelpers();
  });

  describe('processIPAddressList', () => {
    it('converts IP address mapping to internal mapping', () => {
      const result = helpers.processIPAddressList([
        {
          uid: 'example-uid',
          remote_address_chain: '["1.1.1.1"]',
        },
        {
          uid: 'example-uid-2',
          remote_address_chain: '["8.8.8.8"]',
        },
        {
          uid: 'example-uid-3',
          remote_address_chain: '["10.0.0.1", "1.1.1.1"]',
        },
      ]);

      const expected = {
        'example-uid': '1.1.1.1',
        'example-uid-2': '8.8.8.8',
      };

      sinon.assert.match(result, expected);
    });
  });

  describe('getClientIPFromRemoteAddressChain', () => {
    it('returns the first IP address when it is non-local', () => {
      sinon.assert.match(
        helpers.getClientIPFromRemoteAddressChain('["1.1.1.1","8.8.8.8"]'),
        '1.1.1.1'
      );
    });

    it('returns undefined if first IP address is local', () => {
      sinon.assert.match(
        helpers.getClientIPFromRemoteAddressChain('["192.168.1.1", "1.1.1.1"]'),
        undefined
      );
    });

    it('returns undefined if address chain is empty', () => {
      sinon.assert.match(
        helpers.getClientIPFromRemoteAddressChain('[]'),
        undefined
      );
    });
  });

  describe('isLocalIP', () => {
    it('returns true for class A', () => {
      expect(helpers.isLocalIP('10.0.0.1')).true;
    });

    it('returns true for class B', () => {
      expect(helpers.isLocalIP('172.16.0.1')).true;
    });

    it('returns true for class C', () => {
      expect(helpers.isLocalIP('192.168.0.1')).true;
    });

    it('returns false for non-local IP', () => {
      expect(helpers.isLocalIP('1.1.1.1')).false;
    });
  });

  describe('isTaxEligible', () => {
    it('returns true for supported customer', () => {
      const customer = {
        ...mockCustomer,
        tax: {
          ip_address: null,
          location: null,
          automatic_tax: 'supported' as Stripe.Customer.Tax.AutomaticTax,
        },
      };

      const result = helpers.isTaxEligible(customer);

      expect(result).true;
    });

    it('returns true for not_collecting customer', () => {
      const customer = {
        ...mockCustomer,
        tax: {
          ip_address: null,
          location: null,
          automatic_tax: 'not_collecting' as Stripe.Customer.Tax.AutomaticTax,
        },
      };

      const result = helpers.isTaxEligible(customer);

      expect(result).true;
    });

    it('returns false for unrecognized_location customer', () => {
      const customer = {
        ...mockCustomer,
        tax: {
          ip_address: null,
          location: null,
          automatic_tax:
            'unrecognized_location' as Stripe.Customer.Tax.AutomaticTax,
        },
      };

      const result = helpers.isTaxEligible(customer);

      expect(result).false;
    });

    it('returns false for failed customer', () => {
      const customer = {
        ...mockCustomer,
        tax: {
          ip_address: null,
          location: null,
          automatic_tax: 'failed' as Stripe.Customer.Tax.AutomaticTax,
        },
      };

      const result = helpers.isTaxEligible(customer);

      expect(result).false;
    });
  });

  describe('filterEligibleSubscriptions', () => {
    let willBeRenewed: sinon.SinonStub;
    let isStripeTaxDisabled: sinon.SinonStub;
    let isWithinNoticePeriod: sinon.SinonStub;
    let subscriptions: FirestoreSubscription[];
    let result: FirestoreSubscription[];

    beforeEach(() => {
      willBeRenewed = sinon.stub().returns(true);
      helpers.willBeRenewed = willBeRenewed;
      isStripeTaxDisabled = sinon.stub().returns(true);
      helpers.isStripeTaxDisabled = isStripeTaxDisabled;
      isWithinNoticePeriod = sinon.stub().returns(true);
      helpers.isWithinNoticePeriod = isWithinNoticePeriod;

      subscriptions = [mockSubscription];

      result = helpers.filterEligibleSubscriptions(subscriptions);
    });

    it('filters via helper methods', () => {
      expect(willBeRenewed.calledWith(subscription1)).true;
      expect(isStripeTaxDisabled.calledWith(subscription1)).true;
      expect(isWithinNoticePeriod.calledWith(subscription1)).true;
    });

    it('returns filtered results', () => {
      sinon.assert.match(result, subscriptions);
    });
  });

  describe('willBeRenewed', () => {
    it('returns false when subscription is cancelled', () => {
      const result = helpers.willBeRenewed({
        ...mockSubscription,
        cancel_at: 10,
      });

      expect(result).false;
    });

    it('returns false when subscription is cancelled at period end', () => {
      const result = helpers.willBeRenewed({
        ...mockSubscription,
        cancel_at_period_end: true,
      });

      expect(result).false;
    });

    it('returns false when subscription status is not active', () => {
      const result = helpers.willBeRenewed({
        ...mockSubscription,
        status: 'canceled',
      });

      expect(result).false;
    });

    it('returns true when subscription will be renewed', () => {
      const result = helpers.willBeRenewed(mockSubscription);

      expect(result).true;
    });
  });

  describe('isStripeTaxDisabled', () => {
    it('returns true when stripe tax is disabled', () => {
      const result = helpers.isStripeTaxDisabled({
        ...mockSubscription,
        automatic_tax: {
          enabled: false,
          liability: null,
        },
      });

      expect(result).true;
    });

    it('returns false when stripe tax is enabled', () => {
      const result = helpers.isStripeTaxDisabled({
        ...mockSubscription,
        automatic_tax: {
          enabled: true,
          liability: null,
        },
      });

      expect(result).false;
    });
  });

  describe('isWithinNoticePeriod', () => {
    const fakeToday = new Date('2020-01-01');

    const monthlySub = {
      ...mockSubscription,
      items: {
        ...mockSubscription.items,
        data: [
          {
            ...mockSubscription.items.data[0],
            plan: {
              ...mockSubscription.items.data[0].plan,
              interval: 'month' as Stripe.Plan.Interval,
            },
          },
        ],
      },
    };

    const yearlySub = {
      ...mockSubscription,
      items: {
        ...mockSubscription.items,
        data: [
          {
            ...mockSubscription.items.data[0],
            plan: {
              ...mockSubscription.items.data[0].plan,
              interval: 'year' as Stripe.Plan.Interval,
            },
          },
        ],
      },
    };
    let clock: sinon.SinonFakeTimers;

    beforeEach(() => {
      clock = sinon.useFakeTimers(fakeToday.getTime());
    });

    afterEach(() => {
      clock.restore();
    });

    it('returns true for yearly when more than 30 days out', () => {
      const periodEnd = new Date(fakeToday);
      periodEnd.setUTCDate(periodEnd.getUTCDate() + 31);
      yearlySub.current_period_end = periodEnd.getTime() / 1000;

      const result = helpers.isWithinNoticePeriod(yearlySub);

      expect(result).true;
    });

    it('returns false for yearly when less than 30 days out', () => {
      const periodEnd = new Date(fakeToday);
      periodEnd.setUTCDate(periodEnd.getUTCDate() + 29);
      yearlySub.current_period_end = periodEnd.getTime() / 1000;

      const result = helpers.isWithinNoticePeriod(yearlySub);

      expect(result).false;
    });

    it('returns true for monthly when more than 14 days out', () => {
      const periodEnd = new Date(fakeToday);
      periodEnd.setUTCDate(periodEnd.getUTCDate() + 15);
      monthlySub.current_period_end = periodEnd.getTime() / 1000;

      const result = helpers.isWithinNoticePeriod(monthlySub);

      expect(result).true;
    });

    it('returns false for monthly when less than 14 days out', () => {
      const periodEnd = new Date(fakeToday);
      periodEnd.setUTCDate(periodEnd.getUTCDate() + 13);
      monthlySub.current_period_end = periodEnd.getTime() / 1000;

      const result = helpers.isWithinNoticePeriod(monthlySub);

      expect(result).false;
    });
  });

  describe('getSpecialTaxAmounts', () => {
    const getMockTaxAmount = (amount: number, display_name: string) =>
      ({
        amount,
        inclusive: false,
        tax_rate: {
          display_name,
        },
      } as Stripe.Invoice.TotalTaxAmount);

    const mockTaxAmounts = [
      getMockTaxAmount(10, 'HST'),
      getMockTaxAmount(11, 'PST'),
      getMockTaxAmount(12, 'GST'),
      getMockTaxAmount(13, 'QST'),
      getMockTaxAmount(14, 'RST'),
    ];

    it('formats special tax amounts', () => {
      const result = helpers.getSpecialTaxAmounts(mockTaxAmounts);

      sinon.assert.match(result, {
        hst: 10,
        pst: 11,
        gst: 12,
        qst: 13,
        rst: 14,
      });
    });
  });
});

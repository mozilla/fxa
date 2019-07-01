/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const error = require('../error');

const ONE_MONTH = 30 * 24 * 60 * 60 * 1000;

module.exports.buildStubAPI = function buildStubAPI(log, config) {
  const { subhub: { stubs: { plans = [] } = {} } = {} } = config;

  const getPlanById = plan_id =>
    plans.filter(plan => plan.plan_id === plan_id)[0];

  const storage = { subscriptions: {} };
  const subscriptionsKey = (uid, sub_id) => `${uid}|${sub_id}`;

  const customer = {
    payment_type: 'credit',
    last4: '8675',
    exp_month: 8,
    exp_year: 2020,
  };

  return {
    isStubAPI: true,

    async listPlans() {
      return plans;
    },

    async listSubscriptions(uid) {
      return Object.values(storage.subscriptions).filter(
        subscription => subscription.uid === uid
      );
    },

    async createSubscription(uid, pmt_token, plan_id, email) {
      const plan = getPlanById(plan_id);
      if (!plan) {
        throw error.unknownSubscriptionPlan(plan_id);
      }
      const { plan_name } = plan;
      const now = Date.now();
      const subscription_id = `sub${Math.random()}`;
      const key = subscriptionsKey(uid, subscription_id);
      storage.subscriptions[key] = {
        subscription_id,
        plan_id,
        nickname: plan_name,
        status: 'active',
        current_period_start: now,
        current_period_end: now + ONE_MONTH,
      };
      return {
        subscriptions: Object.values(storage.subscriptions),
      };
    },

    async cancelSubscription(uid, sub_id) {
      const key = subscriptionsKey(uid, sub_id);
      /*
      FIXME: since FxA subs can be in the DB but mock subhub subs are in RAM,
      this can throw after a local dev server restart.

      if (! storage.subscriptions[key]) {throw
        error.unknownSubscription(sub_id);
      }
      */
      delete storage.subscriptions[key];
      return {};
    },

    async getCustomer(uid) {
      return {
        ...customer,
        subscriptions: Object.values(storage.subscriptions),
      };
    },

    async updateCustomer(uid, pmt_token) {
      // HACK: Update the payment_type to at least show some change
      customer.payment_type = pmt_token;
      return {};
    },
  };
};

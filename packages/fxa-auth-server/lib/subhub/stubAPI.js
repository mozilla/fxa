/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const error = require('../error');

const ONE_MONTH = 30 * 24 * 60 * 60;

module.exports.buildStubAPI = function buildStubAPI(log, config) {
  const { subhub: { stubs: { plans = [] } = {} } = {} } = config;

  const getPlanById = plan_id => plans.find(plan => plan.plan_id === plan_id);

  const storage = { subscriptions: {}, subscriptionsByUid: {} };
  const subscriptionsKey = (uid, sub_id) => `${uid}|${sub_id}`;

  const customer = {
    payment_type: 'credit',
    last4: '8675',
    exp_month: 8,
    exp_year: 2020,
    brand: 'Visa',
  };

  const _storeSubscription = uid => subscription => {
    const key = subscriptionsKey(uid, subscription.subscription_id);
    storage.subscriptions[key] = subscription;
    if (!storage.subscriptionsByUid[uid]) {
      storage.subscriptionsByUid[uid] = {};
    }
    storage.subscriptionsByUid[uid][
      subscription.subscription_id
    ] = subscription;
    return subscription;
  };

  const _getSubscription = uid => sub_id => {
    const key = subscriptionsKey(uid, sub_id);
    return storage.subscriptions[key];
  };

  const _createSubscription = plan_id => {
    const plan = getPlanById(plan_id);
    if (!plan) {
      throw error.unknownSubscriptionPlan(plan_id);
    }
    const { plan_name } = plan;
    const now = Date.now() / 1000;
    const subscription_id = `sub${Math.random()}`;
    return {
      subscription_id,
      plan_id,
      plan_name,
      status: 'active',
      cancel_at_period_end: false,
      latest_invoice: '628031D-0002',
      current_period_start: now,
      current_period_end: now + ONE_MONTH,
    };
  };

  const _updateSubscription = uid => sub_id => plan_id => {
    const sub = _getSubscription(uid)(sub_id);
    const plan = getPlanById(plan_id);
    const { plan_name } = plan;
    return {
      ...sub,
      plan_id,
      plan_name,
    };
  };

  const _getSubscriptionsByUid = uid =>
    Object.values(storage.subscriptionsByUid[uid] || {});

  return {
    isStubAPI: true,

    async close() {
      return true;
    },

    async listPlans() {
      return plans;
    },

    async listSubscriptions(uid) {
      return {
        subscriptions: _getSubscriptionsByUid(uid),
      };
    },

    async createSubscription(uid, pmt_token, plan_id, display_name, email) {
      _storeSubscription(uid)(_createSubscription(plan_id));
      return {
        subscriptions: Object.values(storage.subscriptions),
      };
    },

    async updateSubscription(uid, sub_id, plan_id) {
      return _storeSubscription(uid)(_updateSubscription(uid)(sub_id)(plan_id));
    },

    async cancelSubscription(uid, sub_id) {
      const key = subscriptionsKey(uid, sub_id);
      const customerSubscription = storage.subscriptions[key];
      customerSubscription.cancel_at_period_end = true;
      return customerSubscription;
    },

    async reactivateSubscription(uid, sub_id) {
      const key = subscriptionsKey(uid, sub_id);
      const customerSubscription = storage.subscriptions[key];
      customerSubscription.cancel_at_period_end = false;
      return {};
    },

    async getCustomer(uid) {
      return {
        ...customer,
        subscriptions: _getSubscriptionsByUid(uid),
      };
    },

    async updateCustomer(uid, pmt_token) {
      // HACK: Update the payment_type to at least show some change
      customer.payment_type = pmt_token;
      return {};
    },

    async deleteCustomer(uid) {
      return {};
    },
  };
};

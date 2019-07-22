/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import Cocktail from 'cocktail';
import FormView from '../form';
import SettingsPanelMixin from '../mixins/settings-panel-mixin';
import Template from 'templates/settings/subscription.mustache';
import PaymentServer from '../../lib/payment-server';

const View = FormView.extend({
  className: 'subscription',
  viewName: 'settings.subscription',

  events: {
    'click button': 'submit',
  },

  initialize(options) {
    this._subscriptionsConfig = {};
    if (options && options.config && options.config.subscriptions) {
      this._subscriptionsConfig = options.config.subscriptions;
    }
  },

  template() {
    return '';
  },

  afterRender() {
    return this._hasActiveSubscriptions().then(hasSubs => {
      if (hasSubs) {
        this.$el.html(this.renderTemplate(Template));
      }
    });
  },

  /**
   * Check to see if the account has any active subscriptions.
   *
   * @returns {Promise} resolves to a bool.
   */
  _hasActiveSubscriptions() {
    return this.getSignedInAccount()
      .fetchActiveSubscriptions()
      .then(subscriptions => subscriptions.length > 0);
  },

  submit() {
    return PaymentServer.navigateToPaymentServer(
      this,
      this._subscriptionsConfig,
      'subscriptions'
    );
  },
});

Cocktail.mixin(View, SettingsPanelMixin);

export default View;

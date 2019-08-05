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
  template: Template,

  events: {
    'click button': 'submit',
  },

  initialize(options) {
    this._subscriptionsConfig = {};
    if (options && options.config && options.config.subscriptions) {
      this._subscriptionsConfig = options.config.subscriptions;
    }
  },

  afterRender() {
    return this.getSignedInAccount().hasSubscriptions();
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

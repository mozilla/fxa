/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import FormView from './form';
import Template from 'templates/subscriptions_redirect.mustache';
import PaymentServer from '../lib/payment-server';

class SubscriptionsProductRedirectView extends FormView {
  mustAuth = true;
  template = Template;

  initialize (options) {
    this._currentPage = options.currentPage;
    this._subscriptionsConfig = {};
    if (options && options.config && options.config.subscriptions) {
      this._subscriptionsConfig = options.config.subscriptions;
    }
  }

  afterRender () {
    const searchQuery = this.window.location.search;
    const productId = this._currentPage.split('/').pop();
    const redirectPath = `products/${productId}${searchQuery}`;
    return PaymentServer.navigateToPaymentServer(this, this._subscriptionsConfig, redirectPath);
  }
}

export default SubscriptionsProductRedirectView;

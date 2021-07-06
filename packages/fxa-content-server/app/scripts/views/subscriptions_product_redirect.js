/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Cocktail from '../lib/cocktail';
import FlowEventsMixin from './mixins/flow-events-mixin';
import FormView from './form';
import Template from 'templates/redirect_loading.mustache';
import PaymentServer from '../lib/payment-server';
import Url from '../lib/url';

class SubscriptionsProductRedirectView extends FormView {
  template = Template;

  initialize(options) {
    this._currentPage = options.currentPage;
    this._productId = this._currentPage.split('/').pop();
    this._queryParams = Url.searchParams(this.window.location.search);
    this.relier.set('subscriptionProductId', this._productId);

    this._subscriptionsConfig = {};
    if (options && options.config && options.config.subscriptions) {
      this._subscriptionsConfig = options.config.subscriptions;
    }

    this.mustAuth =
      !!this._queryParams.signin ||
      !this._subscriptionsConfig.allowUnauthenticatedRedirects;

    // Flow events need to be initialized before the navigation
    // so the flow_id and flow_begin_time are propagated
    this.initializeFlowEvents();
  }

  afterRender() {
    delete this._queryParams.signin;
    const redirectPath = `products/${this._productId}`;
    return PaymentServer.navigateToPaymentServer(
      this,
      this._subscriptionsConfig,
      redirectPath,
      this._queryParams
    );
  }
}

Cocktail.mixin(SubscriptionsProductRedirectView, FlowEventsMixin);

export default SubscriptionsProductRedirectView;

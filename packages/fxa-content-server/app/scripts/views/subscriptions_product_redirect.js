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
    this.relier.set('subscriptionProductId', this._productId);

    this._subscriptionsConfig = {};
    if (options && options.config && options.config.subscriptions) {
      this._subscriptionsConfig = options.config.subscriptions;
    }

    // Flow events need to be initialized before the navigation
    // so the flow_id and flow_begin_time are propagated
    this.initializeFlowEvents();
  }

  render() {
    const account = this.getSignedInAccount();
    return Promise.resolve()
      .then(() => {
        const isSignedInPromise =
          account?.isSignedIn() || Promise.resolve(false);
        return isSignedInPromise.then((isSignedIn) => {
          this._queryParams = Url.searchParams(this.window.location.search);
          const forceSignin = !!this._queryParams.signin;
          this._redirectPath =
            !isSignedIn &&
            this._subscriptionsConfig.allowUnauthenticatedRedirects &&
            !forceSignin
              ? `checkout/${this._productId}`
              : `products/${this._productId}`;
          this.mustAuth = this._redirectPath.startsWith('products');
        });
      })
      .finally(() => FormView.prototype.render.bind(this)());
  }

  afterRender() {
    delete this._queryParams.signin;
    return PaymentServer.navigateToPaymentServer(
      this,
      this._subscriptionsConfig,
      this._redirectPath,
      this._queryParams
    );
  }
}

Cocktail.mixin(SubscriptionsProductRedirectView, FlowEventsMixin);

export default SubscriptionsProductRedirectView;

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// The service-mixin is used in views that know about services, which is mostly
// OAuth services but also Sync.

import BaseView from '../base';
import $ from 'jquery';

// Some clients have a custom logo in their service name
const SERVICE_LOGO = {
  '7377719276ad44ee': 'graphic-client-pocket', // pocket-mobile
  '749818d3f2e7857f': 'graphic-client-pocket', // pocket-web
};

export default {
  afterRender() {
    this.transformLinks();
  },

  setInitialContext(context) {
    const { service, subscriptionProductName, serviceName } = this.relier.pick(
      'service',
      'subscriptionProductName',
      this.translate('serviceName')
    );

    const serviceLogo = SERVICE_LOGO[service];

    context.set({
      service,
      serviceName: subscriptionProductName || serviceName,
      serviceLogo,
      isSync: this.relier.isSync(),
      isOAuthNativeRelay: this.relier.isOAuthNativeRelay(),
    });
  },

  transformLinks() {
    // need to add /oauth to urls, but also maintain the existing query params
    const $linkEls = this.$(
      'a[href^="/signin"],a[href^="/signup"],a[href^="/reset_password"]'
    );
    $linkEls.each((index, el) => {
      const $linkEl = $(el);
      $linkEl.attr('href', this.broker.transformLink($linkEl.attr('href')));
    });
  },

  // override this method so we can fix signup/signin links in errors
  unsafeDisplayError(err) {
    const result = BaseView.prototype.unsafeDisplayError.call(this, err);

    this.transformLinks();

    return result;
  },
};

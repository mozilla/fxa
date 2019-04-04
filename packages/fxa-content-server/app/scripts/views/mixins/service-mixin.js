/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// The service-mixin is used in views that know about services, which is mostly
// OAuth services but also Sync.

'use strict';

import BaseView from '../base';
import $ from 'jquery';

module.exports = {
  afterRender () {
    this.transformLinks();
  },

  setInitialContext (context) {
    context.set(this.relier.pick('service', 'serviceName'));
  },

  transformLinks () {
    // need to add /oauth to urls, but also maintain the existing query params
    const $linkEls = this.$('a[href^="/signin"],a[href^="/signup"],a[href^="/reset_password"]');
    $linkEls.each((index, el) => {
      const $linkEl = $(el);
      $linkEl.attr('href', this.broker.transformLink($linkEl.attr('href')));
    });
  },

  // override this method so we can fix signup/signin links in errors
  unsafeDisplayError (err) {
    const result = BaseView.prototype.unsafeDisplayError.call(this, err);

    this.transformLinks();

    return result;
  }
};

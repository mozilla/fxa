/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Redirect users that browse to `/` to `signup` or `settings`
 * depending on whether the user is authenticated.
 *
 * @module views/index
 */
define(function (require, exports, module) {
  'use strict';

  const BaseView = require('views/base');

  module.exports = BaseView.extend({
    beforeRender () {
      let url;
      if (this.user.getSignedInAccount().get('sessionToken')) {
        url = 'settings';
      } else {
        url = 'signup';
      }

      this.navigate(url, {}, { replace: true, trigger: true });
    }
  });
});

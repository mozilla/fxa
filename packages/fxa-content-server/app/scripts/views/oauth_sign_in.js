/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'views/sign_in',
  'views/mixins/service-mixin'
],
function (_, SignInView, ServiceMixin) {
  var View = SignInView.extend({
    className: 'sign-in oauth-sign-in',

    afterRender: function () {
      this.setupOAuthLinks();
      return SignInView.prototype.afterRender.call(this);
    }
  });

  _.extend(View.prototype, ServiceMixin);

  return View;
});

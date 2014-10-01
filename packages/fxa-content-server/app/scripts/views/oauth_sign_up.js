/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'views/sign_up',
  'views/mixins/service-mixin'
],
function (_, SignUpView, ServiceMixin) {
  var View = SignUpView.extend({
    className: 'sign-up oauth-sign-up',

    afterRender: function () {
      this.setupOAuthLinks();
      return SignUpView.prototype.afterRender.call(this);
    }
  });

  _.extend(View.prototype, ServiceMixin);

  return View;
});

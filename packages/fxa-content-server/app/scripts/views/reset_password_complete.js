/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'underscore',
  'views/base',
  'stache!templates/reset_password_complete',
  'lib/session',
  'lib/xss',
  'lib/url'
],
function (_, BaseView, Template, Session, Xss, Url) {
  var View = BaseView.extend({
    template: Template,
    className: 'reset_password_complete',

    context: function () {
      return {
        email: Session.email,
        service: Url.searchParam('service'),
        isSync: Url.searchParam('service') === 'sync',
        redirectTo: Xss.href(Session.redirectTo)
      };
    }
  });

  return View;
});

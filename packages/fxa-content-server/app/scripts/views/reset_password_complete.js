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
  'lib/strings'
],
function (_, BaseView, Template, Session, Xss, Strings) {
  var View = BaseView.extend({
    template: Template,
    className: 'reset_password_complete',

    context: function () {
      var service = Session.service;

      if (Session.redirectTo) {
        service = Strings.interpolate('<a href="%s" class="no-underline" id="redirectTo">%s</a>', [
          Xss.href(Session.redirectTo), Session.service
        ]);
      }

      return {
        service: service
      };
    }
  });

  return View;
});

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'views/base',
  'stache!templates/confirm',
  'lib/session'
],
function (BaseView, ConfirmTemplate, Session) {
  var ConfirmView = BaseView.extend({
    template: ConfirmTemplate,
    className: 'confirm',

    context: function () {
      return {
        // HTML is written here to simplify the l10n community's job
        email: '<strong id="confirm-email" class="email">' + Session.email + '</strong>'
      };
    }
  });

  return ConfirmView;
});

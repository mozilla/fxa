/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'views/base',
  'stache!templates/pp',
  'lib/session'
],
function (BaseView, Template, Session) {
  var View = BaseView.extend({
    template: Template,
    className: 'pp',

    context: function () {
      return {
        canGoBack: Session.canGoBack
      };
    },

    events: {
      'click #fxa-pp-back': 'back',
      'keyup #fxa-pp-back': 'backOnEnter'
    }
  });

  return View;
});


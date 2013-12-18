/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'views/base',
  'hgn!templates/pp'
],
function (BaseView, PpTemplate) {
  var PpView = BaseView.extend({
    template: PpTemplate,
    className: 'pp',

    events: {
      'click #fxa-pp-back': 'back'
    },

    back: function () {
      window.history.back();
    }

  });

  return PpView;
});


/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'views/base',
  'hgn!templates/tos'
],
function(BaseView, TosTemplate) {
  var TosView = BaseView.extend({
    template: TosTemplate,
    className: 'tos',

    events: {
      'click #fxa-tos-back': 'back'
    },

    back: function(event) {
      window.history.back();
    }

  });

  return TosView;
});


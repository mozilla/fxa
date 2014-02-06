/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'views/base',
  'stache!templates/pp'
],
function (BaseView, PpTemplate) {
  var PpView = BaseView.extend({
    template: PpTemplate,
    className: 'pp',

    events: {
      'click #fxa-pp-back': 'back',
      'keyup #fxa-pp-back': 'backOnEnter'
    },

    afterRender: function () {
      // The user may be scrolled part way down the page
      // on screen transition. Force them to the top of the page.
      window.scrollTo(0, 0);
    }
  });

  return PpView;
});


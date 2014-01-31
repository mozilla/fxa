/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// helper functions for views with passwords. Meant to be mixed into views.

'use strict';

define([
  'views/base'
], function (BaseView) {
  var t = BaseView.t;

  return {
    onPasswordVisibilityChange: function (event) {
      var isVisible = this.$(event.target).is(':checked');
      this.setPasswordVisibility(isVisible);
    },

    setPasswordVisibility: function (isVisible) {
      var type = isVisible ? 'text' : 'password';
      this.$('.password').attr('type', type);
    }
  };
});

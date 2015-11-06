/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var BaseView = require('views/base');
  var FormView = require('views/form');
  var Template = require('stache!templates/openid/start');

  var View = FormView.extend({
    template: Template,
    className: 'openid-start',

    events: {
      'click #fxa-button': BaseView.preventDefaultThen('_goToSignUp')
    },

    _goToSignUp: function () {
      this.navigate('signup');
    },

    submit: function () {
      var form = this.getFormValues();

      this.window.location = '/openid/authenticate?identifier=' +
        encodeURIComponent(form.openid);
      return { halt: true };
    }

  });

  module.exports = View;
});


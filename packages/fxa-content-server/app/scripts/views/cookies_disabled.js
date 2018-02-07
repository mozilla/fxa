/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  const AuthErrors = require('../lib/auth-errors');
  const BackMixin = require('./mixins/back-mixin');
  const BaseView = require('./base');
  const Cocktail = require('cocktail');
  const Storage = require('../lib/storage');
  const Template = require('templates/cookies_disabled.mustache');

  var View = BaseView.extend({
    constructor: function (options) {
      BaseView.call(this, options);

      this._Storage = options.Storage || Storage;
    },

    template: Template,
    className: 'cookies-disabled',

    events: {
      'click #submit-btn': 'backIfLocalStorageEnabled'
    },

    backIfLocalStorageEnabled () {
      if (! this._Storage.isLocalStorageEnabled()) {
        return this.displayError(AuthErrors.toError('COOKIES_STILL_DISABLED'));
      }

      this.back();
    }
  });

  Cocktail.mixin(
    View,
    BackMixin
  );

  module.exports = View;
});

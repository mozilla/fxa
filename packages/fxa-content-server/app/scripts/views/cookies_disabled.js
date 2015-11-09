/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var AuthErrors = require('lib/auth-errors');
  var BackMixin = require('views/mixins/back-mixin');
  var BaseView = require('views/base');
  var Cocktail = require('cocktail');
  var ConfigLoader = require('lib/config-loader');
  var Storage = require('lib/storage');
  var Template = require('stache!templates/cookies_disabled');

  var View = BaseView.extend({
    constructor: function (options) {
      BaseView.call(this, options);

      this._configLoader = new ConfigLoader();
      this._Storage = options.Storage || Storage;
    },

    template: Template,
    className: 'cookies-disabled',

    events: {
      'click #submit-btn': 'backIfLocalStorageEnabled'
    },

    backIfLocalStorageEnabled: function () {
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

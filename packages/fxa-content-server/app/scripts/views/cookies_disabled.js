/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'cocktail',
  'views/base',
  'lib/config-loader',
  'lib/auth-errors',
  'lib/storage',
  'stache!templates/cookies_disabled',
  'views/mixins/back-mixin'
],
function (Cocktail, BaseView, ConfigLoader, AuthErrors, Storage, Template, BackMixin) {
  'use strict';

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

  return View;
});

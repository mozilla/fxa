/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

define([
  'cocktail',
  'views/base',
  'lib/config-loader',
  'lib/auth-errors',
  'stache!templates/cookies_disabled',
  'views/mixins/back-mixin'
],
function (Cocktail, BaseView, ConfigLoader, AuthErrors, Template, BackMixin) {
  var View = BaseView.extend({
    constructor: function (options) {
      BaseView.call(this, options);

      this._configLoader = new ConfigLoader();
    },

    template: Template,
    className: 'cookies-disabled',

    events: {
      'click #submit-btn': 'backIfCookiesEnabled'
    },

    backIfCookiesEnabled: function () {
      var self = this;
      return this._configLoader.areCookiesEnabled(true)
        .then(function (areCookiesEnabled) {
          if (! areCookiesEnabled) {
            var err = AuthErrors.toError('COOKIES_STILL_DISABLED');
            return self.displayError(err);
          }

          self.back();
        });
    }
  });

  Cocktail.mixin(
    View,
    BackMixin
  );

  return View;
});

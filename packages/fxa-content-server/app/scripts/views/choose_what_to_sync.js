/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define(function (require, exports, module) {
  'use strict';

  var _ = require('underscore');
  var BackMixin = require('views/mixins/back-mixin');
  var CheckboxMixin = require('views/mixins/checkbox-mixin');
  var Cocktail = require('cocktail');
  var FormView = require('views/form');
  var p = require('lib/promise');
  var SignUpSuccessMixin = require('views/mixins/signup-success-mixin');
  var Template = require('stache!templates/choose_what_to_sync');

  var View = FormView.extend({
    template: Template,
    className: 'choose-what-to-sync',

    initialize: function () {
      // Account data is passed in from sign up flow.
      this._account = this.user.initAccount(this.model.get('account'));
    },

    getAccount: function () {
      return this._account;
    },

    beforeRender: function () {
      // user cannot proceed if they have not initiated a sign up/in.
      if (! this.getAccount().get('sessionToken')) {
        this.navigate('signup');
        return false;
      }
    },

    context: function () {
      var account = this.getAccount();

      return {
        email: account.get('email'),
        hasBookmarkSupport: this._isEngineSupported('bookmarks'),
        hasDesktopAddonSupport: this._isEngineSupported('desktop-addons'),
        hasDesktopPreferencesSupport: this._isEngineSupported('desktop-preferences'),
        hasHistorySupport: this._isEngineSupported('history'),
        hasPasswordSupport: this._isEngineSupported('passwords'),
        hasTabSupport: this._isEngineSupported('tabs')
      };
    },

    submit: function () {
      var self = this;
      var account = self.getAccount();
      var declinedEngines = self._getDeclinedEngines();

      this._trackUncheckedEngines(declinedEngines);

      account.set('declinedSyncEngines', declinedEngines);
      account.set('customizeSync', true);

      return p().then(function () {
        self.user.setAccount(account);

        return self.onSignUpSuccess(account);
      });
    },

    /**
     * Check whether a Sync engine is supported
     *
     * @param {String} engineName
     * @returns {Boolean}
     * @private
     */
    _isEngineSupported: function (engineName) {
      var supportedEngines =
                this.broker.getCapability('chooseWhatToSyncWebV1').engines;
      return supportedEngines.indexOf(engineName) > -1;
    },


    /**
     * Get sync engines that were declined by unchecked checkboxes
     *
     * @returns {Array}
     * @private
     */
    _getDeclinedEngines: function () {
      var uncheckedEngineEls =
            this.$el.find('input[name=sync-content]').not(':checked');

      return uncheckedEngineEls.map(function () {
        return this.value;
      }).get();
    },

    /**
     * Keep track of what sync engines the user declines
     *
     * @param {Array} declinedEngines
     * @private
     */
    _trackUncheckedEngines: function (declinedEngines) {
      var self = this;

      if (_.isArray(declinedEngines)) {
        declinedEngines.forEach(function (engine) {
          self.logViewEvent('engine-unchecked.' + engine);
        });
      }
    }
  });

  Cocktail.mixin(
    View,
    BackMixin,
    CheckboxMixin,
    SignUpSuccessMixin
  );

  module.exports = View;
});

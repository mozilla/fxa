/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A generic broker used to define behaviors when integrating with Sync.
 * Used as a base class for brokers that communicate with Firefox, and
 * when a user verifies in a 2nd browser.
 */

define(function (require, exports, module) {
  'use strict';

  const _ = require('underscore');
  const BaseAuthenticationBroker = require('models/auth_brokers/base');
  const ConnectAnotherDeviceBehavior = require('views/behaviors/connect-another-device');
  const SyncEngines = require('models/sync-engines');

  const proto = BaseAuthenticationBroker.prototype;

  module.exports = BaseAuthenticationBroker.extend({
    defaultBehaviors: _.extend({}, proto.defaultBehaviors, {
      // Can CAD be displayed after the signup confirmation poll?
      cadAfterSignUpConfirmationPoll: false
    }),

    type: 'fx-sync',

    initialize (options = {}) {
      proto.initialize.call(this, options);

      if (this.hasCapability('chooseWhatToSyncWebV1')) {
        const syncEngines = new SyncEngines(null, { window: this.window });
        this.set('chooseWhatToSyncWebV1Engines', syncEngines);
      }

      if (this.hasCapability('fxaStatus')) {
        this.on('fxa_status', (response) => this.onFxaStatus(response));
      }
    },

    /**
     * Handle a response to the `fxa_status` message.
     *
     * @param {any} [response={}]
     * @private
     */
    onFxaStatus (response = {}) {
      const syncEngines = this.get('chooseWhatToSyncWebV1Engines');
      const additionalEngineIds = response.capabilities && response.capabilities.engines;
      if (syncEngines && additionalEngineIds) {
        this.addAdditionalSyncEngines(additionalEngineIds);
      }
    },

    /**
     * Add `additionalEngineIds` to `chooseWhatToSyncWebV1Engines`.
     *
     * @param {String[]} additionalEngineIds
     */
    addAdditionalSyncEngines (additionalEngineIds) {
      const syncEngines = this.get('chooseWhatToSyncWebV1Engines');
      if (syncEngines) {
        additionalEngineIds.forEach((engineId) => syncEngines.addById(engineId));
      }
    },

    afterSignUpConfirmationPoll (account) {
      return proto.afterSignUpConfirmationPoll.call(this, account)
        .then((defaultBehavior) => {
          if (this.hasCapability('cadAfterSignUpConfirmationPoll')) {
            // This is a hack to allow us to differentiate between users
            // who see CAD in the signup and verification tabs. CAD
            // was added to the verifiation tab first, view names and view
            // events are all unprefixed. In the signup tab, we force add
            // the `signup` view name prefix so that events that contain
            // viewNames have `signup` view name prefix.
            //
            // e.g.:
            // screen.sms <- view the sms screen in the verification tab.
            // screen.signup.sms <- view the sms screen in the signup tab.
            this._metrics.setViewNamePrefix('signup');
            return new ConnectAnotherDeviceBehavior(defaultBehavior);
          }

          return defaultBehavior;
        });
    }
  });
});


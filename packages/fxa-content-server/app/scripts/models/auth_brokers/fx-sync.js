/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A generic broker used to define behaviors when integrating with Sync.
 * Used as a base class for brokers that communicate with Firefox, and
 * when a user verifies in a 2nd browser.
 */

import _ from 'underscore';
import BaseAuthenticationBroker from '../auth_brokers/base';
import ConnectAnotherDeviceBehavior from '../../views/behaviors/connect-another-device';
import SyncEngines from '../sync-engines';

const proto = BaseAuthenticationBroker.prototype;

export default BaseAuthenticationBroker.extend({
  defaultBehaviors: _.extend({}, proto.defaultBehaviors, {
    afterCompleteSignIn: new ConnectAnotherDeviceBehavior(
      proto.defaultBehaviors.afterCompleteSignIn
    ),
    afterCompleteSignUp: new ConnectAnotherDeviceBehavior(
      proto.defaultBehaviors.afterCompleteSignUp
    ),
    // afterForceAuth is not overridden with the ConnectAnotherDevice behavior
    // because force_auth is used to sign in as a particular user to view a particular
    // page, e.g., settings.
    afterSignIn: new ConnectAnotherDeviceBehavior(
      proto.defaultBehaviors.afterSignIn
    ),
  }),

  type: 'fx-sync',

  initialize(options = {}) {
    proto.initialize.call(this, options);

    const syncEngines = new SyncEngines(null, { window: this.window });
    this.set('chooseWhatToSyncWebV1Engines', syncEngines);

    if (this.hasCapability('fxaStatus')) {
      this.on('fxa_status', response => this.onFxaStatus(response));
    }
  },

  /**
   * Handle a response to the `fxa_status` message.
   *
   * @param {any} [response={}]
   * @private
   */
  onFxaStatus(response = {}) {
    const syncEngines = this.get('chooseWhatToSyncWebV1Engines');
    const multiService =
      response.capabilities && response.capabilities.multiService;
    this.relier.set('multiService', multiService);
    this.setCapability(
      'syncOptional',
      multiService && this.relier.get('service') !== 'sync'
    );
    if (multiService) {
      // we get the OAuth client id for the browser
      // in order to replicate the uses of the 'service' param on the backend.
      // See: https://github.com/mozilla/fxa/issues/2396#issuecomment-530662772
      if (!this.relier.has('service')) {
        // the service in the query parameter currently overrides the status message
        // this is due to backwards compatibility
        this.relier.set('service', response.clientId);
        this._metrics.setService(response.clientId);
      }
    }
    const additionalEngineIds =
      response.capabilities && response.capabilities.engines;
    if (syncEngines && additionalEngineIds) {
      this.addAdditionalSyncEngines(additionalEngineIds);
    }
    return proto.onFxaStatus.call(this, response);
  },

  /**
   * Add `additionalEngineIds` to `chooseWhatToSyncWebV1Engines`.
   *
   * @param {String[]} additionalEngineIds
   */
  addAdditionalSyncEngines(additionalEngineIds) {
    const syncEngines = this.get('chooseWhatToSyncWebV1Engines');
    if (syncEngines) {
      additionalEngineIds.forEach(engineId => syncEngines.addById(engineId));
    }
  },

  afterSignInConfirmationPoll(account) {
    return proto.afterSignInConfirmationPoll
      .call(this, account)
      .then(defaultBehavior => {
        if (!this.hasCapability('browserTransitionsAfterEmailVerification')) {
          // This is a hack to allow us to differentiate between users
          // who see CAD in the signin and verification tabs. CAD
          // was added to the verification tab first, view names and view
          // events are all unprefixed. In the signin tab, we force add
          // the `signin` view name prefix so that events that contain
          // viewNames have `signin` view name prefix.
          //
          // e.g.:
          // screen.sms <- view the sms screen in the verification tab.
          // screen.signin.sms <- view the sms screen in the signin tab.
          this._metrics.setViewNamePrefix('signin');
          return new ConnectAnotherDeviceBehavior(defaultBehavior);
        }

        return defaultBehavior;
      });
  },

  afterSignUpConfirmationPoll(account) {
    return proto.afterSignUpConfirmationPoll
      .call(this, account)
      .then(defaultBehavior => {
        if (!this.hasCapability('browserTransitionsAfterEmailVerification')) {
          // This is a hack to allow us to differentiate between users
          // who see CAD in the signup and verification tabs. CAD
          // was added to the verification tab first, view names and view
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
  },
});

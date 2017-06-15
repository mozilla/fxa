/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * This module is not itself an auth broker, instead it encapsulates
 * the decision about which auth broker to instantiate. Essentially
 * it maps context strings to auth broker constructors.
 */

define(function (require, exports, module) {
  'use strict';

  const Constants = require('lib/constants');

  const AUTH_BROKERS = [
    /* eslint-disable sorting/sort-object-props */
    {
      context: Constants.FX_SYNC_CONTEXT,
      Constructor: require('models/auth_brokers/fx-sync')
    },
    {
      context: Constants.FX_DESKTOP_V1_CONTEXT,
      Constructor: require('models/auth_brokers/fx-desktop-v1')
    },
    {
      context: Constants.FX_DESKTOP_V2_CONTEXT,
      Constructor: require('models/auth_brokers/fx-desktop-v2')
    },
    {
      context: Constants.FX_DESKTOP_V3_CONTEXT,
      Constructor: require('models/auth_brokers/fx-desktop-v3')
    },
    {
      context: Constants.FX_FENNEC_V1_CONTEXT,
      Constructor: require('models/auth_brokers/fx-fennec-v1')
    },
    {
      context: Constants.FX_FIRSTRUN_V1_CONTEXT,
      Constructor: require('models/auth_brokers/fx-firstrun-v1')
    },
    {
      context: Constants.FX_FIRSTRUN_V2_CONTEXT,
      Constructor: require('models/auth_brokers/fx-firstrun-v2')
    },
    {
      context: Constants.FX_IOS_V1_CONTEXT,
      Constructor: require('models/auth_brokers/fx-ios-v1')
    },
    {
      context: Constants.MOBILE_ANDROID_V1_CONTEXT,
      Constructor: require('models/auth_brokers/mob-android-v1')
    },
    {
      context: Constants.MOBILE_IOS_V1_CONTEXT,
      Constructor: require('models/auth_brokers/mob-ios-v1')
    },
    {
      context: Constants.OAUTH_CONTEXT,
      Constructor: require('models/auth_brokers/oauth-redirect')
    },
    {
      context: Constants.CONTENT_SERVER_CONTEXT,
      Constructor: require('models/auth_brokers/web')
    }
    /* eslint-enable sorting/sort-object-props */
  ].reduce((authBrokers, authBroker) => {
    authBrokers[authBroker.context] = authBroker.Constructor;
    return authBrokers;
  }, {});

  module.exports = {
    /**
     * Return the appropriate auth broker constructor for the given context.
     *
     * @param {String} context
     * @returns {Function} Constructor
     */
    get (context) {
      return AUTH_BROKERS[context] || require('models/auth_brokers/web');
    }
  };
});

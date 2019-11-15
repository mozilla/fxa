/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * This module is not itself an auth broker, instead it encapsulates
 * the decision about which auth broker to instantiate. Essentially
 * it maps context strings to auth broker constructors.
 */

import Constants from '../../lib/constants';
import FxSyncBroker from '../auth_brokers/fx-sync';
import FxDesktopV3broker from '../auth_brokers/fx-desktop-v3';
import FxFennecV1Broker from '../auth_brokers/fx-fennec-v1';
import FxIosV1Broker from '../auth_brokers/fx-ios-v1';
import OauthRedirectBroker from '../auth_brokers/oauth-redirect';
import OauthWebChannelBroker from '../auth_brokers/oauth-webchannel-v1';
import OauthRedirectChromeAndroidBroker from '../auth_brokers/oauth-redirect-chrome-android';
import WebBroker from '../auth_brokers/web';
import AuthorityBroker from '../auth_brokers/pairing/authority';
import SupplicantBroker from '../auth_brokers/pairing/supplicant';
import SupplicantWebChannelBroker from '../auth_brokers/pairing/supplicant-webchannel';

const AUTH_BROKERS = [
  {
    context: Constants.FX_SYNC_CONTEXT,
    Constructor: FxSyncBroker,
  },
  {
    context: Constants.FX_DESKTOP_V3_CONTEXT,
    Constructor: FxDesktopV3broker,
  },
  {
    context: Constants.FX_FENNEC_V1_CONTEXT,
    Constructor: FxFennecV1Broker,
  },
  {
    context: Constants.FX_IOS_V1_CONTEXT,
    Constructor: FxIosV1Broker,
  },
  {
    context: Constants.OAUTH_CONTEXT,
    Constructor: OauthRedirectBroker,
  },
  {
    context: Constants.OAUTH_WEBCHANNEL_CONTEXT,
    Constructor: OauthWebChannelBroker,
  },
  {
    context: Constants.OAUTH_CHROME_ANDROID_CONTEXT,
    Constructor: OauthRedirectChromeAndroidBroker,
  },
  {
    context: Constants.CONTENT_SERVER_CONTEXT,
    Constructor: WebBroker,
  },
  {
    context: Constants.DEVICE_PAIRING_AUTHORITY_CONTEXT,
    Constructor: AuthorityBroker,
  },
  {
    context: Constants.DEVICE_PAIRING_SUPPLICANT_CONTEXT,
    Constructor: SupplicantBroker,
  },
  {
    context: Constants.DEVICE_PAIRING_WEBCHANNEL_SUPPLICANT_CONTEXT,
    Constructor: SupplicantWebChannelBroker,
  },
].reduce((authBrokers, authBroker) => {
  authBrokers[authBroker.context] = authBroker.Constructor;
  return authBrokers;
}, {});

export default {
  /**
   * Return the appropriate auth broker constructor for the given context.
   *
   * @param {String} context
   * @returns {Function} Constructor
   */
  get(context) {
    return AUTH_BROKERS[context] || WebBroker;
  },
};

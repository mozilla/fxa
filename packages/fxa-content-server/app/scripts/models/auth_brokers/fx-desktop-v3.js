/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A variant of the FxSync broker that speaks "v3" of the protocol.
 *
 * It used to enable syncPreferencesNotification on the verification complete screen.
 * Issue #4250
 */

import _ from 'underscore';
import Cocktail from 'cocktail';
import FxSyncWebChannelAuthenticationBroker from './fx-sync-web-channel';
import UserAgentMixin from 'lib/user-agent-mixin';

const proto = FxSyncWebChannelAuthenticationBroker.prototype;

const FxDesktopV3AuthenticationBroker = FxSyncWebChannelAuthenticationBroker.extend(
  {
    defaultCapabilities: _.extend({}, proto.defaultCapabilities, {
      allowUidChange: true,
      disableLegacySigninSignup: true,
      emailFirst: true,
      openWebmailButtonVisible: true,
      tokenCode: true,
    }),

    type: 'fx-desktop-v3',
  }
);

Cocktail.mixin(FxDesktopV3AuthenticationBroker, UserAgentMixin);

export default FxDesktopV3AuthenticationBroker;

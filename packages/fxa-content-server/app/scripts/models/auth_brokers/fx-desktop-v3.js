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
import FxDesktopV2AuthenticationBroker from './fx-desktop-v2';
import UserAgentMixin from 'lib/user-agent-mixin';

const proto = FxDesktopV2AuthenticationBroker.prototype;

const FxDesktopV3AuthenticationBroker = FxDesktopV2AuthenticationBroker.extend({
  defaultCapabilities: _.extend({}, proto.defaultCapabilities, {
    allowUidChange: true,
    disableLegacySigninSignup: true,
    emailFirst: true,
    tokenCode: true,
  }),

  type: 'fx-desktop-v3',
});

Cocktail.mixin(FxDesktopV3AuthenticationBroker, UserAgentMixin);

export default FxDesktopV3AuthenticationBroker;

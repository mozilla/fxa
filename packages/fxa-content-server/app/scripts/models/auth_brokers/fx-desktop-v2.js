/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A variant of the FxSync broker that speaks "v2" of the protocol.
 * Communication with the browser is done via WebChannels and each
 * command is prefixed with `fxaccounts:`
 */

import _ from 'underscore';
import FxSyncWebChannelAuthenticationBroker from './fx-sync-web-channel';

const proto = FxSyncWebChannelAuthenticationBroker.prototype;

const FxDesktopV2AuthenticationBroker = FxSyncWebChannelAuthenticationBroker.extend(
  {
    defaultCapabilities: _.extend({}, proto.defaultCapabilities, {
      openWebmailButtonVisible: true,
    }),

    type: 'fx-desktop-v2',
  }
);

export default FxDesktopV2AuthenticationBroker;

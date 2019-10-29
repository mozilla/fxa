/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * The auth broker to coordinate authenticating for Sync when
 * embedded in Firefox for Android.
 */

import _ from 'underscore';
import FxSyncWebChannelAuthenticationBroker from '../auth_brokers/fx-sync-web-channel';

const proto = FxSyncWebChannelAuthenticationBroker.prototype;

export default FxSyncWebChannelAuthenticationBroker.extend({
  defaultCapabilities: _.extend({}, proto.defaultCapabilities, {
    browserTransitionsAfterEmailVerification: false,
    emailVerificationMarketingSnippet: false,
  }),

  type: 'fx-fennec-v1',
});

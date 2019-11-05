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
import HaltIfBrowserTransitions from '../../views/behaviors/halt-if-browser-transitions';

const proto = FxSyncWebChannelAuthenticationBroker.prototype;
const defaultBehaviors = proto.defaultBehaviors;

const FxDesktopV2AuthenticationBroker = FxSyncWebChannelAuthenticationBroker.extend(
  {
    defaultBehaviors: _.extend({}, defaultBehaviors, {
      afterForceAuth: new HaltIfBrowserTransitions(
        defaultBehaviors.afterForceAuth
      ),
      afterResetPasswordConfirmationPoll: new HaltIfBrowserTransitions(
        defaultBehaviors.afterResetPasswordConfirmationPoll
      ),
      afterSignIn: new HaltIfBrowserTransitions(defaultBehaviors.afterSignIn),
      afterSignInConfirmationPoll: new HaltIfBrowserTransitions(
        defaultBehaviors.afterSignInConfirmationPoll
      ),
      afterSignUpConfirmationPoll: new HaltIfBrowserTransitions(
        defaultBehaviors.afterSignUpConfirmationPoll
      ),
    }),

    defaultCapabilities: _.extend({}, proto.defaultCapabilities, {
      openWebmailButtonVisible: true,
    }),

    type: 'fx-desktop-v2',

    fetch() {
      return proto.fetch.call(this).then(() => {
        if (! this.environment.isAboutAccounts()) {
          this.setCapability('browserTransitionsAfterEmailVerification', false);
        }
      });
    },
  }
);

export default FxDesktopV2AuthenticationBroker;

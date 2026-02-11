/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import OAuthRedirectBroker from './oauth-redirect';
import NavigateBehavior from '../../views/behaviors/navigate';

/**
 * Chrome for Android will not allow the page to redirect
 * unless its the result of a user action such as a click.
 *
 * Instead of redirecting automatically after confirmation
 * poll, force the user to the /sign(in|up)_complete page
 * where they can click a "continue" button.
 */

class OAuthRedirectChromeAndroidBroker extends OAuthRedirectBroker {
  afterSignInConfirmationPoll(account) {
    return new NavigateBehavior('signin_confirmed', {
      account,
      continueBrokerMethod: 'finishOAuthSignInFlow',
    });
  }

  afterSignUpConfirmationPoll(account) {
    return new NavigateBehavior('signup_confirmed', {
      account,
      continueBrokerMethod: 'finishOAuthSignUpFlow',
    });
  }
}

export default OAuthRedirectChromeAndroidBroker;

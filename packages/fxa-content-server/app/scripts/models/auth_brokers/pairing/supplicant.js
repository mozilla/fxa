/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Cocktail from 'cocktail';
import OAuthRedirectBroker from '../oauth-redirect';
import SupplicantMixin from './mixins/supplicant';
import Url from '../../../lib/url';

/**
 * SupplicantBroker extends OAuthRedirectBroker to provide a redirect behaviour as an OAuth flow
 */
class SupplicantBroker extends OAuthRedirectBroker {
  type = 'supplicant';

  initialize(options = {}) {
    super.initialize(options);
  }

  sendCodeToRelier() {
    return Promise.resolve().then(() => {
      const relier = this.relier;
      const result = {
        action: 'pairing',
        redirect: Url.updateSearchString(
          relier.get('redirectUri'),
          relier.pick('code', 'state')
        ),
      };

      this.sendOAuthResultToRelier(result);
    });
  }
}

Cocktail.mixin(SupplicantBroker, SupplicantMixin);

export default SupplicantBroker;

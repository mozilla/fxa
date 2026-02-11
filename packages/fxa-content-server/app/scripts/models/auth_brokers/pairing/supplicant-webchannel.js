/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Cocktail from 'cocktail';
import OAuthWebChannelBroker from '../oauth-webchannel-v1';
import SupplicantMixin from './mixins/supplicant';

/**
 * SupplicantWebChannelBroker extends OAuthWebChannelBroker to provide a WebChannel flow
 */
class SupplicantWebChannelBroker extends OAuthWebChannelBroker {
  type = 'supplicant-webchannel';

  sendCodeToRelier() {
    return Promise.resolve().then(() => {
      const relier = this.relier;
      const result = {
        action: 'pairing',
        code: relier.get('code'),
        redirect: relier.get('redirectUri'),
        state: relier.get('state'),
      };

      return this.sendOAuthResultToRelier(result);
    });
  }
}

Cocktail.mixin(SupplicantWebChannelBroker, SupplicantMixin);

export default SupplicantWebChannelBroker;

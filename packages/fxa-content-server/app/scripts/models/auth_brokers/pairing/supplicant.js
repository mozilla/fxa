/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import OAuthErrors from '../../../lib/oauth-errors';
import OAuthRedirectBroker from '../oauth-redirect';
import PairingChannelClient from '../../../lib/pairing-channel-client';
import setRemoteMetaData from './remote-metadata';
import SupplicantStateMachine from '../../pairing/supplicant-state-machine';
import Url from '../../../lib/url';

export default class SupplicantBroker extends OAuthRedirectBroker {
  type = 'supplicant';

  initialize(options = {}) {
    super.initialize(options);

    const { config, notifier, relier } = options;

    if (!config.pairingClients.includes(relier.get('clientId'))) {
      // only approved clients may pair
      throw OAuthErrors.toError('INVALID_PAIRING_CLIENT');
    }

    const channelServerUri = config.pairingChannelServerUri;
    const { channelId, channelKey } = relier.toJSON();
    if (channelId && channelKey && channelServerUri) {
      this.pairingChannelClient = new PairingChannelClient(
        {
          channelId,
          channelKey,
          channelServerUri,
        },
        {
          importPairingChannel: options.importPairingChannel,
          notifier,
        }
      );

      this.suppStateMachine = new SupplicantStateMachine(
        {},
        {
          broker: this,
          notifier,
          pairingChannelClient: this.pairingChannelClient,
          relier,
        }
      );

      this.pairingChannelClient.open();
    } else {
      throw new Error('Failed to initialize supplicant');
    }
  }

  afterSupplicantApprove() {
    return Promise.resolve().then(() => {
      this.notifier.trigger('pair:supp:authorize');
    });
  }

  sendCodeToRelier() {
    return Promise.resolve().then(() => {
      const relier = this.relier;
      const result = {
        redirect: Url.updateSearchString(
          relier.get('redirectUri'),
          relier.pick('code', 'state')
        ),
      };

      this.sendOAuthResultToRelier(result);
    });
  }

  setRemoteMetaData = setRemoteMetaData;
}

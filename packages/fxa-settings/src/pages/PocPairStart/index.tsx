/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
 * FXA-13863 — Pairing start placeholder (THROWAWAY).
 *
 * This is where the deep-link flow lands inside Firefox once pairing begins.
 * For now it is a static placeholder. In later versions this page will invoke
 * the pairing channel server and notify the waiting desktop client.
 */

import React, { useState } from 'react';
import AppLayout from '../../components/AppLayout';
import CardHeader from '../../components/CardHeader';
import { usePageViewEvent } from '../../lib/metrics';
import { REACT_ENTRYPOINT } from '../../constants';
import { firefox } from '../../lib/channels/firefox';

export const viewName = 'poc_pair_start';

const PocPairStart = () => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);

  const [status, setStatus] = useState('');

  // Just a little POC test driver to check new web-channel commands. This will be removed shortly!
  const validateWebChannels = async () => {

    // Makes sure user is signed in.
    const user = await firefox.requestSignedInUser(
      'oauth', true, 'sync'
    );
    if (!user) {
      setStatus('No user. Login to sync before testing!')
      return;
    }

    // Resolve the current status.
    const status = await firefox.fxaStatus({
      context: 'oauth',
      service: 'sync',
      isPairing: true
    });
    console.log('!!! status', status)
    if (!status || status.capabilities.pairingVersion !== 2) {
      setStatus('Wrong pairing version set identity.fxaccounts.pairing.version to 2 to test poc.')
      return;
    }
    const clientId = status.clientId;


    try {
      // Start oauth pairing process
      const startResult = await firefox.pairOauthStart({});
      if (startResult == null) {
        throw('Failed to get response for pair oauth start web channel message.');
      }
      console.log('Start Result', startResult);

      // Complete pairing process. In the wild this would happen on the supplicant.
      const finishResult = await firefox.pairOauthFinish({
        client_id: clientId || '',
        state:startResult.state,
        scope:startResult.scope,
        code_challenge: startResult.code_challenge,
      });
      if (finishResult == null) {
        throw('Failed to get response for pair oauth finish web channel message.');
      }
      console.log('Finish Result', finishResult);

      setStatus('Finished oauth process! ' + JSON.stringify({
        code: !!finishResult.code,
        state: !!finishResult.state
      }));

      await firefox.fxaOAuthLogin({
        code: finishResult.code,
        state: finishResult.state,
        redirect: 'urn:ietf:wg:oauth:2.0:oob:oauth-redirect-webchannel',
        action: 'pairing',
      });
      console.log('oauthLogin complete!')

    } catch (err) {
      console.error(err);
      setStatus('Hit error when executing oauth pair start / finish.');
    }
  }

  return (
    <AppLayout>
      <CardHeader
        headingText="Pairing Started"
        headingTextFtlId="poc_pair_start-header"
      />
      <p className="text-sm text-grey-400 mt-2">
        Initiating connection to pairing channel. Click start and check logs for proof of web-channel support!
      </p>
      <br/>
      <a onClick={validateWebChannels}>Start</a>
      <br/><br/>
      <p>{status}</p>
    </AppLayout>
  );
};

export default PocPairStart;

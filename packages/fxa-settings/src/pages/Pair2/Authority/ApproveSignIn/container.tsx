/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect } from 'react';
import { useAccount } from '../../../../models';
import { pairingFlow, plog } from '../../../../lib/channels/pairing-flow';
import { navigateWithQuery } from '../../../../lib/utilities';
import firefox from '../../../../lib/channels/firefox';
import { RemoteMetadata } from '../../../../lib/types';
import ApproveSignIn from '.';

/**
 * Authority approval container (FXA-13865 + FXA-13867 authority halves).
 *
 * Renders the supplicant's device details from the stored `pair:supp:request`.
 * On approve it waits for the supplicant's `pair:supp:authorize`, then runs the
 * REAL `fxaccounts:pair_oauth_finish` web-channel command, relays the resulting
 * `{code,state}` over the channel as `pair:auth:authorize`, and advances to
 * continue_on_mobile.
 */
const ApproveSignInContainer = () => {
  const account = useAccount();
  const req = pairingFlow.supplicantRequest;
  const remoteMetadata: RemoteMetadata = pairingFlow.remoteMetadata ?? {
    deviceFamily: 'Mobile',
    deviceOS: '',
    ipAddress: '',
  };

  // If we landed here without a stored request the flow is out of sync; send the
  // user back to the QR rather than showing an empty approval.
  useEffect(() => {
    if (!req) {
      navigateWithQuery('/pair/authority/scan_qr');
    }
  }, [req]);

  const onApprove = () => {
    plog('auth onApprove; have req?', !!req);
    if (!req) return;

    // Record local confirmation; the supplicant must also confirm before we mint.
    let remoteConfirmed = false;
    const offAuthorize = pairingFlow.on('remote:pair:supp:authorize', () => {
      remoteConfirmed = true;
    });

    (async () => {
      try {
        // Wait briefly for the supplicant's authorize signal if it hasn't arrived.
        for (let i = 0; i < 60 && !remoteConfirmed; i++) {
          await new Promise((r) => setTimeout(r, 250));
        }
        plog('auth remoteConfirmed =', remoteConfirmed);
        if (!remoteConfirmed) return;

        const finished = await firefox.pairOauthFinish({
          client_id: req.client_id,
          state: req.state,
          scope: req.scope,
          code_challenge: req.code_challenge,
          keys_jwk: req.keys_jwk,
        });
        plog('auth pairOauthFinish ->', finished ? 'code' : 'undefined');
        if (!finished) return;

        // Attach the completion listener BEFORE sending the code, so the
        // supplicant's pair:supp:complete cannot arrive before we are listening.
        // It lives on the shared channel client, so it survives the navigation
        // to continue_on_mobile.
        const offComplete = pairingFlow.on('remote:pair:supp:complete', () => {
          offComplete();
          // Mark done so the channel close that follows is not read as an abort.
          pairingFlow.completing = true;
          navigateWithQuery('/pair/authority/sync_success');
        });

        await pairingFlow.send('pair:auth:authorize', {
          code: finished.code,
          state: finished.state,
        });
        // Hand off to continue_on_mobile, which waits for the supplicant to
        // finish the OAuth exchange (pair:supp:complete) before showing success.
        navigateWithQuery('/pair/authority/continue_on_mobile');
      } finally {
        offAuthorize();
      }
    })();
  };

  const onChangePassword = () => {
    navigateWithQuery('/settings/change_password');
  };

  return (
    <ApproveSignIn
      email={account.email}
      remoteMetadata={remoteMetadata}
      onApprove={onApprove}
      onChangePassword={onChangePassword}
    />
  );
};

export default ApproveSignInContainer;

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { pairingFlow, plog } from '../../../../lib/channels/pairing-flow';
import { navigateWithQuery } from '../../../../lib/utilities';
import firefox from '../../../../lib/channels/firefox';
import ConnectThisDevice from '.';

// Matches the v1 supplicant hand-off (pairing-supplicant-integration.ts).
const PAIR_OAUTH_REDIRECT =
  'urn:ietf:wg:oauth:2.0:oob:oauth-redirect-webchannel';

type AuthAuthorizeDetail = { code?: string; state?: string };

/**
 * Supplicant connect container (FXA-13867 supplicant half).
 *
 * Shows who is asking, and on confirm signals `pair:supp:authorize`, waits for
 * the authority's `pair:auth:authorize`, validates the returned state against
 * the one this device generated, completes the OAuth login via
 * `fxaccounts:oauth_login`, and lands on sync success.
 */
const ConnectThisDeviceContainer = () => {
  const authorityMetadata = pairingFlow.authorityMetadata;

  const onConnect = () => {
    const onAuthorize = (event: Event) => {
      const detail = (event as CustomEvent<AuthAuthorizeDetail>).detail;
      plog('supp got pair:auth:authorize; code?', !!detail?.code);
      if (!detail?.code || !detail?.state) return;

      // The state must echo what this device generated in pair_oauth_start, or
      // the grant is for someone else — abort.
      if (detail.state !== pairingFlow.supplicantOAuth?.state) {
        plog('supp state mismatch; abort');
        off();
        pairingFlow.reset();
        navigateWithQuery(
          '/pair/supplicant/timeout_and_cancel?reason=canceled'
        );
        return;
      }

      off();
      plog('supp calling oauth_login');
      firefox.fxaOAuthLogin({
        action: 'pairing',
        code: detail.code,
        state: detail.state,
        redirect: PAIR_OAUTH_REDIRECT,
      });
      // Mark done so the post-success channel close is not read as an abort.
      pairingFlow.completing = true;
      // Tell the authority we finished so its continue_on_mobile can advance to
      // success. Await delivery before showing success so the signal is not
      // dropped by an early teardown.
      pairingFlow
        .send('pair:supp:complete')
        .catch(() => {
          // Best effort; the supplicant is done regardless.
        })
        .finally(() => {
          navigateWithQuery('/pair/supplicant/sync_success');
        });
    };

    plog('supp onConnect: sending pair:supp:authorize');
    const off = pairingFlow.on('remote:pair:auth:authorize', onAuthorize);
    pairingFlow.send('pair:supp:authorize').catch(() => {
      // FXA-13869 owns the error surface.
    });
  };

  const onCancel = () => {
    // Closing the channel signals the authority to abort too.
    pairingFlow.reset();
    navigateWithQuery('/pair/supplicant/timeout_and_cancel?reason=canceled');
  };

  return (
    <ConnectThisDevice
      email={authorityMetadata?.email}
      remoteMetadata={pairingFlow.remoteMetadata}
      {...{ onConnect, onCancel }}
    />
  );
};

export default ConnectThisDeviceContainer;

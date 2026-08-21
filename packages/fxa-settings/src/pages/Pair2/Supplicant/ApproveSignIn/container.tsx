/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect } from 'react';
import { useConfig } from '../../../../models';
import {
  pairingFlow,
  plog,
  toRemoteMetadata,
} from '../../../../lib/channels/pairing-flow';
import { PairingChannelRemoteMetadata } from '../../../../lib/channels/pairing-channel';
import { navigateWithQuery } from '../../../../lib/utilities';
import firefox from '../../../../lib/channels/firefox';
import { Constants } from '../../../../lib/constants';
import ApproveSignIn from '.';

// Registered pairing client ids, mirroring `config.pairing.clients` in the
// content server. Firefox desktop reports its own id over fxa_status, so only
// the mobile supplicants need to be named here.
const FENIX_CLIENT_ID = 'a2270f727f45f648';
const FIREFOX_IOS_CLIENT_ID = '1b1a3e44c54fbb58';

/**
 * The pairing client id for the mobile browser we are running in.
 *
 * Firefox for Android and Firefox for iOS do not report `clientId` over
 * fxa_status the way desktop does, so the v2 native-camera entry has no client
 * id to hand the authority. Returns '' on any other browser rather than
 * guessing, so the caller sends nothing instead of the wrong relier.
 */
function mobilePairingClientId(): string {
  const ua = navigator.userAgent;
  if (/FxiOS/i.test(ua)) {
    return FIREFOX_IOS_CLIENT_ID;
  }
  if (/Android/i.test(ua)) {
    return FENIX_CLIENT_ID;
  }
  return '';
}

type AuthMetadataDetail = {
  email?: string;
  displayName?: string;
  avatar?: string;
  deviceName?: string;
  remoteMetaData: PairingChannelRemoteMetadata;
};

/**
 * Supplicant approval container (FXA-13865 supplicant half).
 *
 * The native camera opens `/pair#channel_id=..&channel_key=..&v=2`, which
 * forwards here. This joins the channel, asks Firefox for OAuth params via
 * `fxaccounts:pair_oauth_start`, sends them to the authority as
 * `pair:supp:request`, and on the authority's `pair:auth:metadata` advances to
 * the connect screen showing who is asking.
 */
const ApproveSignInContainer = () => {
  const config = useConfig();

  useEffect(() => {
    let cancelled = false;

    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const channelId = params.get('channel_id');
    const channelKey = params.get('channel_key');
    // OAuth params live in the query when Firefox mobile (app-services) opened
    // /pair/supp and did OAuth-start itself; they are absent for a native scan
    // that opened /pair#..v=2 with only a fragment.
    const query = new URLSearchParams(window.location.search);

    const onAuthMetadata = (event: Event) => {
      const detail = (event as CustomEvent<AuthMetadataDetail>).detail;
      if (!detail || cancelled) return;
      pairingFlow.authorityMetadata = {
        email: detail.email ?? '',
        displayName: detail.displayName,
        avatar: detail.avatar,
        deviceName: detail.deviceName,
      };
      pairingFlow.remoteMetadata = toRemoteMetadata(
        detail.remoteMetaData,
        detail.deviceName
      );
      navigateWithQuery('/pair/supplicant/connect_this_device');
    };

    const off = pairingFlow.on('remote:pair:auth:metadata', onAuthMetadata);

    (async () => {
      try {
        plog('supp ApproveSignIn mount; channel?', !!channelId);
        if (!channelId || !channelKey) return;
        if (!pairingFlow.isConnected) {
          await pairingFlow.joinChannel(
            config.pairing.serverBaseUri,
            channelId,
            channelKey
          );
        }
        if (cancelled) return;
        // An unexpected channel close (authority cancelled or connection
        // dropped) sends the supplicant to the timeout screen.
        pairingFlow.wireAbort(() =>
          navigateWithQuery('/pair/supplicant/timeout_and_cancel')
        );

        // Firefox mobile (app-services) already ran OAuth-start and passed the
        // params in the query; prefer them so the code the authority mints is
        // bound to app-services' own code_verifier. Otherwise ask chrome to run
        // pair_oauth_start (desktop supplicant and the true-v2 webchannel path).
        let clientId = query.get('client_id') ?? '';
        let oauth = {
          state: query.get('state') ?? '',
          // Scopes are space separated. The `/pair/supp` -> v2 forward round-trips
          // the query through the router, which turns the URL-encoded spaces into
          // literal `+`; restore them (OAuth scope tokens never contain `+`).
          scope: (query.get('scope') ?? '').replace(/\+/g, ' '),
          code_challenge: query.get('code_challenge') ?? '',
          keys_jwk: query.get('keys_jwk') ?? '',
        };
        const codeChallengeMethod =
          query.get('code_challenge_method') ?? 'S256';

        const haveUrlOAuth =
          clientId &&
          oauth.state &&
          oauth.scope &&
          oauth.code_challenge &&
          oauth.keys_jwk;

        plog('supp oauth source =', haveUrlOAuth ? 'url' : 'pair_oauth_start');
        if (!haveUrlOAuth) {
          const start = await firefox.pairOauthStart({});
          if (!start || cancelled) return;
          oauth = {
            state: start.state,
            scope: start.scope,
            code_challenge: start.code_challenge,
            keys_jwk: start.keys_jwk,
          };
          // The supplicant's own client id comes from the browser status.
          const status = await firefox.fxaStatus({
            context: Constants.OAUTH_WEBCHANNEL_CONTEXT,
            service: Constants.SYNC_SERVICE,
            isPairing: true,
          });
          // Firefox desktop reports clientId; Firefox for Android does not, so
          // a native-camera scan would otherwise send an empty client_id and the
          // authority would mint a code bound to no relier.
          clientId = status?.clientId || mobilePairingClientId();
        }
        if (cancelled) return;

        pairingFlow.supplicantOAuth = oauth;
        plog('supp sending pair:supp:request; client_id?', !!clientId);
        plog('supp scope value =', JSON.stringify(oauth.scope));

        await pairingFlow.send('pair:supp:request', {
          client_id: clientId,
          state: oauth.state,
          scope: oauth.scope,
          code_challenge: oauth.code_challenge,
          code_challenge_method: codeChallengeMethod,
          keys_jwk: oauth.keys_jwk,
        });
      } catch {
        // FXA-13869 owns the error surface.
      }
    })();

    return () => {
      cancelled = true;
      off();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.pairing.serverBaseUri]);

  const onCancel = () => {
    // Closing the channel signals the authority to abort too.
    pairingFlow.reset();
    navigateWithQuery('/pair/supplicant/timeout_and_cancel');
  };

  return (
    <ApproveSignIn
      remoteMetadata={pairingFlow.remoteMetadata}
      {...{ onCancel }}
    />
  );
};

export default ApproveSignInContainer;

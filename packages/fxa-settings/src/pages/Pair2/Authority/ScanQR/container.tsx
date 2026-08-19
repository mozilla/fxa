/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useState } from 'react';
import { Integration, useAccount, useConfig } from '../../../../models';
import {
  pairingFlow,
  toRemoteMetadata,
  SupplicantOAuthRequest,
} from '../../../../lib/channels/pairing-flow';
import { PairingChannelRemoteMetadata } from '../../../../lib/channels/pairing-channel';
import { navigateWithQuery } from '../../../../lib/utilities';
import ScanQR from '.';

type SuppRequestDetail = SupplicantOAuthRequest & {
  remoteMetaData: PairingChannelRemoteMetadata;
  deviceName?: string;
};

// How long to show the QR before giving up if no device scans it.
const SCAN_QR_TIMEOUT_MS = 2 * 60 * 1000;

/**
 * Authority container for the v2 pairing QR (FXA-13868 + FXA-13865 authority
 * half). Mints the channel, renders the QR, and on the supplicant's
 * `pair:supp:request` stores the OAuth params, replies with `pair:auth:metadata`,
 * and advances to the approval screen. The channel lives on `pairingFlow`, so it
 * survives that navigation.
 */
const ScanQRContainer = ({ integration }: { integration?: Integration }) => {
  const config = useConfig();
  const account = useAccount();
  const [qrCodeValue, setQrCodeValue] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    let inactivityTimer: ReturnType<typeof setTimeout> | undefined;

    const onSuppRequest = (event: Event) => {
      const detail = (event as CustomEvent<SuppRequestDetail>).detail;
      if (!detail) return;
      // A device scanned; stop the no-scan timeout.
      if (inactivityTimer) clearTimeout(inactivityTimer);

      pairingFlow.supplicantRequest = {
        client_id: detail.client_id,
        state: detail.state,
        scope: detail.scope,
        code_challenge: detail.code_challenge,
        keys_jwk: detail.keys_jwk,
      };
      pairingFlow.remoteMetadata = toRemoteMetadata(
        detail.remoteMetaData,
        detail.deviceName
      );

      pairingFlow
        .send('pair:auth:metadata', {
          email: account.email,
          displayName: account.displayName ?? undefined,
          avatar: account.avatar?.url ?? undefined,
          deviceName: undefined,
        })
        .then(() => {
          if (!cancelled) {
            navigateWithQuery('/pair/authority/approve_signin');
          }
        })
        .catch(() => {
          // FXA-13869 owns the error surface.
        });
    };

    const off = pairingFlow.on('remote:pair:supp:request', onSuppRequest);

    (async () => {
      try {
        if (!pairingFlow.isConnected) {
          const { channelId, channelKey } = await pairingFlow.createChannel(
            config.pairing.serverBaseUri
          );
          if (cancelled) return;
          // Once the channel is up, an unexpected close (supplicant cancelled or
          // the connection dropped) sends the authority to the timeout screen.
          pairingFlow.wireAbort(() =>
            navigateWithQuery('/pair/authority/timeout_and_cancel')
          );
          inactivityTimer = setTimeout(() => {
            if (!cancelled) {
              navigateWithQuery('/pair/authority/timeout_and_cancel');
            }
          }, SCAN_QR_TIMEOUT_MS);
          setQrCodeValue(
            `${window.location.origin}/pair#channel_id=${channelId}&channel_key=${channelKey}&v=2`
          );
        } else if (pairingFlow.channelId && pairingFlow.channelKey) {
          setQrCodeValue(
            `${window.location.origin}/pair#channel_id=${pairingFlow.channelId}&channel_key=${pairingFlow.channelKey}&v=2`
          );
        }
      } catch {
        // FXA-13869 owns the timeout/error surface; leave the QR loading.
      }
    })();

    // Do NOT close the channel here: it must outlive this page for the rest of
    // the flow. `pairingFlow.reset()` is called when the flow ends.
    return () => {
      cancelled = true;
      if (inactivityTimer) clearTimeout(inactivityTimer);
      off();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.pairing.serverBaseUri]);

  return <ScanQR {...{ qrCodeValue, integration }} />;
};

export default ScanQRContainer;

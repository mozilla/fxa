/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useState } from 'react';
import * as Sentry from '@sentry/react';
import ScanQR from '.';
import {
  AuthorityState,
  Integration,
  PairingAuthorityIntegration,
} from '../../../../models';
import { useNavigateWithQuery } from '../../../../lib/hooks';

/**
 * Owns the pairing channel for the authority. Mints a channel on mount so the
 * QR always scans to one that exists on the channel server. The channel then
 * outlives this page — the authority moves on while the supplicant is still
 * joining — so it is only torn down when creation itself fails.
 */
const ScanQRContainer = ({ integration }: { integration: Integration }) => {
  const navigateWithQuery = useNavigateWithQuery();
  const [qrCodeValue, setQrCodeValue] = useState('');

  if (!(integration instanceof PairingAuthorityIntegration)) {
    throw new Error(
      'Invalid integration type. Expected PairingAuthorityIntegration.'
    );
  }
  if (integration.isFirefoxMobileClient()) {
    throw new Error('Mobile to desktop not supported!');
  }

  useEffect(() => {
    integration.onStateChange = (state: AuthorityState) => {
      switch (state) {
        case AuthorityState.WaitingForAuthorizations:
          navigateWithQuery('/pair/authority/continue_on_mobile');
          break;
        case AuthorityState.Failed:
          navigateWithQuery('/pair/authority/timeout_and_cancel');
          break;
        default:
          // Connecting and WaitingForMetadata both resolve on this page.
          break;
      }
    };

    (async () => {
      try {
        await integration.createChannel();
        setQrCodeValue(integration.getPairUrl('2'));
      } catch (err) {
        setQrCodeValue('');
        Sentry.captureException(err);
        // A half-created channel is unusable downstream, so this is the one
        // path that closes it. Guarded because effect code cannot let the
        // rejection escape.
        await integration.destroy().catch((e) => Sentry.captureException(e));
      }
    })();

    return () => {
      // Unsubscribe only — the channel outlives this page for continue_on_mobile.
      integration.onStateChange = null;
    };
  }, [integration, navigateWithQuery]);

  return <ScanQR {...{ qrCodeValue }} />;
};

export default ScanQRContainer;

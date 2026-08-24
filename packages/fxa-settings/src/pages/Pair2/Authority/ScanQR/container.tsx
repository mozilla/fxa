/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useState } from 'react';
import * as Sentry from '@sentry/react';
import { useNavigate } from 'react-router';
import ScanQR from '.';
import { plog } from '../../../../lib/channels/pairing-flow';
import {
  AuthorityState,
  Integration,
  PairingAuthorityIntegration,
} from '../../../../models';

/**
 * Owns the pairing channel for the authority. Mints a channel on mount so the
 * QR always scans to one that exists on the channel server, and closes it on
 * unmount so leaving the page cannot leak a socket.
 */
const ScanQRContainer = ({ integration }: { integration: Integration }) => {
  const navigate = useNavigate();
  const [qrCodeValue, setQrCodeValue] = useState('');

  // The rebuild is not synchronous with the route change, so the first render
  // can still hold the previous page's integration. Throwing on that would kill
  // the page before the right one arrives; wait for it instead.
  const authority =
    integration instanceof PairingAuthorityIntegration ? integration : null;

  if (authority?.isFirefoxMobileClient()) {
    throw new Error('Mobile to desktop not supported!');
  }

  useEffect(() => {
    if (!authority) {
      return;
    }
    authority.onStateChange = (state: AuthorityState) => {
      switch (state) {
        case AuthorityState.WaitingForAuthorizations:
          navigate('/pair/authority/approve_signin');
          break;
        case AuthorityState.Failed:
          navigate('/pair/authority/timeout_and_cancel');
          break;
        default:
          // Connecting and WaitingForMetadata both resolve on this page.
          break;
      }
    };

    (async () => {
      try {
        await authority.createChannel();
        const pairUrl = authority.getPairUrl('2');
        plog('auth QR minted', pairUrl.split('#')[1] ?? '');
        setQrCodeValue(pairUrl);
      } catch (err) {
        setQrCodeValue('');
        Sentry.captureException(err);
      }
    })();

    return () => {
      // No `destroy()`: the channel outlives this page. Tearing down here also
      // loses it under StrictMode, whose double-invoked effect resolves the
      // async destroy after the remount's createChannel() has returned early,
      // leaving a QR for a closed channel. Terminal screens own teardown.
      authority.onStateChange = null;
    };
  }, [authority, navigate]);

  return <ScanQR {...{ qrCodeValue }} />;
};

export default ScanQRContainer;

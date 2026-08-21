/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useState } from 'react';
import * as Sentry from '@sentry/react';
import { useNavigate } from 'react-router';
import ScanQR from '.';
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
        await integration.createChannel();
        setQrCodeValue(integration.getPairUrl('2'));
      } catch (err) {
        setQrCodeValue('');
        Sentry.captureException(err);
      }
    })();

    return () => {
      // `destroy` is async and effect cleanup cannot await it; catch so a
      // failed socket close does not surface as an unhandled rejection.
      integration.destroy().catch((err) => Sentry.captureException(err));
    };
  }, [integration, navigate]);

  return <ScanQR {...{ qrCodeValue }} />;
};

export default ScanQRContainer;

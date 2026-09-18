/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useState } from 'react';
import * as Sentry from '@sentry/browser';
import { RemoteMetadata } from '../../../../lib/types';
import { useLocation } from 'react-router';
import {
  Integration,
  PairingSupplicantIntegration,
  SupplicantState,
} from '../../../../models';
import config from '../../../../lib/config';
import AppLayout from '../../../../components/AppLayout';
import ConnectThisDevice from '.';
import { navigateWithQuery } from '../../../../lib/utilities';

// The integration's fail() emits Failed, and the state handler routes to the
// timeout screen from there. Only errors that bypass fail(), such as a missing
// channel, are routed here so a failure never navigates twice.
const leaveOnError = (
  integration: PairingSupplicantIntegration,
  err: unknown
) => {
  Sentry.captureException(err);
  if (integration.state !== SupplicantState.Failed) {
    navigateWithQuery(
      '/pair/supplicant/timeout_and_cancel',
      { state: { reason: 'timeout' } },
      true
    );
  }
};

export const ConnectThisDeviceContainer = ({
  integration,
}: {
  integration?: Integration | PairingSupplicantIntegration;
}) => {
  const location = useLocation();
  const [remoteMetadata, setRemoteMetadata] = useState<RemoteMetadata | null>(
    null
  );
  const [email, setEmail] = useState<string | undefined>();
  const [ready, setReady] = useState<boolean>(false);

  if (!(integration instanceof PairingSupplicantIntegration)) {
    throw new Error(
      'Invalid integration. Expecting instance of PairingSupplicantIntegration'
    );
  }
  if (location.state?.version !== '2') {
    throw new Error('Invalid location state. Expecting version of 2.');
  }

  useEffect(() => {
    integration.onStateChange = (state: SupplicantState) => {
      switch (state) {
        case SupplicantState.WaitingForAuthorizations:
          // The following data should have been relayed over the pairing channel
          // and stored on the integration just prior to this state change.
          setEmail(integration.email);
          setRemoteMetadata({
            ipAddress: integration.remoteMetadata?.ipAddress || 'Unknown',
            city: integration.remoteMetadata?.city || 'Unknown',
            country: integration.remoteMetadata?.country || 'Unknown',
            deviceFamily: integration.remoteMetadata?.deviceFamily || 'Unknown',
            deviceName: integration.remoteMetadata?.deviceName || 'Unknown',
            deviceOS: integration.remoteMetadata?.deviceOS || 'Unknown',
            region: integration.remoteMetadata?.region || 'Unknown',
          });
          break;
        case SupplicantState.WaitingForAuthority:
          navigateWithQuery('/pair/supplicant/approve_signin', {}, true);
          break;
        case SupplicantState.Failed:
          navigateWithQuery(
            '/pair/supplicant/timeout_and_cancel',
            {
              state: {
                reason: integration.canceledByAuthority
                  ? 'canceled'
                  : 'timeout',
              },
            },
            true
          );
          break;
        default:
          console.warn('Unexpected state change: ' + state);
          break;
      }
    };

    (async () => {
      await integration.openChannel(
        config.pairing?.serverBaseUri,
        location.state.channelId,
        location.state.channelKey,
        2
      );
      setReady(true);
    })().catch((err) => leaveOnError(integration, err));

    return () => {
      // Unsubscribe only — the channel outlives this page for approve_signin.
      integration.onStateChange = null;
    };
  }, [integration, location]);

  // Leave even if the channel will not close; the user asked to stop. The
  // reason rides along so the dead-end screen says "Canceled" rather than
  // blaming a timeout the user never waited out.
  const onCancel = async () => {
    try {
      await integration.destroy();
    } catch (err) {
      Sentry.captureException(err);
    }
    navigateWithQuery(
      '/pair/supplicant/timeout_and_cancel',
      { state: { reason: 'canceled' } },
      true
    );
  };

  // Approving moves the integration to WaitingForAuthority, and the state
  // handler above routes to approve_signin from there. Navigating here as well
  // would push a second history entry for the same screen.
  const onConnect = () => {
    integration
      .supplicantApprove()
      .catch((err) => leaveOnError(integration, err));
  };

  if (!ready || !remoteMetadata) {
    // Rendered through AppLayout rather than a bare spinner so the wait for the
    // channel keeps the page chrome and centering of the card that follows it.
    return <AppLayout loading />;
  }

  return (
    <ConnectThisDevice {...{ remoteMetadata, email, onCancel, onConnect }} />
  );
};

export default ConnectThisDeviceContainer;

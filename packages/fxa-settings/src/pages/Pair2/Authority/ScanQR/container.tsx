/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import * as Sentry from '@sentry/react';
import ScanQR from '.';
import {
  AuthorityState,
  Integration,
  PairingAuthorityIntegration,
} from '../../../../models';
import {
  UseFxAStatusResult,
  useNavigateWithQuery,
} from '../../../../lib/hooks';
import GleanMetrics from '../../../../lib/glean';
import firefox from '../../../../lib/channels/firefox';
import { Constants } from '../../../../lib/constants';
import { hardNavigate } from 'fxa-react/lib/utils';

export const SIGNED_IN_POLL_MS = 1_000;

/**
 * Owns the pairing channel for the authority. Mints a channel on mount so the
 * QR always scans to one that exists on the channel server. The channel then
 * outlives this page — the authority moves on while the supplicant is still
 * joining — so it is only torn down when creation itself fails or the user
 * skips pairing.
 */
const ScanQRContainer = ({
  integration,
  fxaStatusResult,
}: {
  integration: Integration;
  fxaStatusResult: UseFxAStatusResult;
}) => {
  const navigateWithQuery = useNavigateWithQuery();
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

  // Approving a sign-in needs a signed-in browser, and Firefox does not tell
  // the page when the user signs out of sync. A reload, or the retry from the
  // timeout page, is where that shows up, so the channel waits on fxa_status.
  const { fxaStatusState } = fxaStatusResult;
  const signedInUser = fxaStatusResult.fxaStatus?.signedInUser;
  const isSignedIn = !!(signedInUser?.sessionToken && signedInUser.verified);

  useEffect(() => {
    if (fxaStatusState === 'pending') {
      return;
    }
    if (!isSignedIn) {
      // /pair owns the signed-out desktop: it starts the sync sign-in and
      // comes back here once the browser has an account again. Full reload,
      // because `useIntegration` is not keyed on location.
      hardNavigate('/pair', {}, true);
      return;
    }

    // This exit ends the flow, so the channel goes with it. Leave either way:
    // a channel that will not close must not strand the user here.
    const giveUp = async () => {
      try {
        await integration.destroy();
      } catch (err) {
        Sentry.captureException(err);
      }
      navigateWithQuery('/pair/authority/timeout_and_cancel', {
        state: { reason: 'timeout' },
      });
    };

    integration.onStateChange = (state: AuthorityState) => {
      switch (state) {
        case AuthorityState.WaitingForAuthorizations:
          navigateWithQuery('/pair/authority/continue_on_mobile');
          break;
        case AuthorityState.Failed:
          giveUp();
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
  }, [integration, navigateWithQuery, fxaStatusState, isSignedIn]);


  useEffect(() => {
    if (!isSignedIn) {
      return;
    }
    // Firefox sends nothing to the page on a sync sign-out, so a QR already on
    // screen only learns of one by asking again.
    const timer = window.setInterval(async () => {
      const status = await firefox.fxaStatus({
        context: Constants.OAUTH_CONTEXT,
        isPairing: true,
        service: Constants.SYNC_SERVICE,
      });
      // Silence counts as signed out: a sign-out resets Firefox's FxA root
      // pref, so a page on a non-production FxA loses its channel entirely.
      const user = status?.signedInUser;
      if (user?.sessionToken && user.verified) {
        return;
      }
      window.clearInterval(timer);
      // Nobody is left to approve a scan of this QR, so the channel goes too.
      integration.destroy().catch((err) => Sentry.captureException(err));
      hardNavigate('/pair', {}, true);
    }, SIGNED_IN_POLL_MS);
    return () => window.clearInterval(timer);
  }, [integration, isSignedIn]);

  const onSkip = () => {
    GleanMetrics.dtmDesktop.qrSkip();
    // Skipping ends the flow, so the channel goes with it. `destroy()` drops
    // the state handler first, so the close cannot route to the timeout page.
    // Not awaited: a channel that will not close must not hold the user here.
    integration.destroy().catch((err) => Sentry.captureException(err));
    // Settings is the exit from every pairing promo, so the pairing query
    // parameters stop here rather than following the user there.
    navigate('/settings');
  };

  return <ScanQR {...{ qrCodeValue, onSkip }} />;
};

export default ScanQRContainer;

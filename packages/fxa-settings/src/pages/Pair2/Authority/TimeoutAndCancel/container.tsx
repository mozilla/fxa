/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect } from 'react';
import TimeoutAndCancel from '.';
import { useLocation, useNavigate } from 'react-router';
import * as Sentry from '@sentry/browser';
import firefox from '../../../../lib/channels/firefox';
import { Integration, PairingAuthorityIntegration } from '../../../../models';

export type TimeoutAndCancelContainerProps = {
  integration?: Integration;
}

/**
 * The desktop screen shown once pairing stops without succeeding — either it
 * timed out or someone canceled it. Both reasons offer "Try again"; the
 * secondary action differs, because a timeout leaves the user mid-flow with
 * something to abandon while a cancel has already ended it.
 */
const TimeoutAndCancelContainer = ({
  integration,
}: TimeoutAndCancelContainerProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Not every route here closes the channel first, and closing twice is
  // harmless, so this is what guarantees none outlives the flow.
  useEffect(() => {
    if (!(integration instanceof PairingAuthorityIntegration)) {
      return;
    }
    // Already-closed is the common case, so swallow the rejection.
    integration.destroy().catch((err) => Sentry.captureException(err));
  }, [integration]);

  const onTryAgain = () => {
    navigate('/pair/authority/scan_qr');
  }

  const onCancel = () => {
    navigate('/')
  }

  const onSyncSettings = () => {
    firefox.fxaOpenSyncPreferences()
  }

  return (
    <TimeoutAndCancel {...{reason:location.state?.reason || 'timeout', onTryAgain, onCancel, onSyncSettings}} />
  );
};

export default TimeoutAndCancelContainer;

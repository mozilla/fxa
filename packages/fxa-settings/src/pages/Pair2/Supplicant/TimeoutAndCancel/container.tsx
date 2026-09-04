/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect } from 'react';
import { useLocation } from 'react-router';
import * as Sentry from '@sentry/browser';
import TimeoutAndCancel, { PairingInterruptionReason } from '.';
import { Integration, PairingSupplicantIntegration } from '../../../../models';

export type TimeoutAndCancelContainerProps = {
  integration?: Integration;
};

/**
 * The mobile dead-end screen shown once pairing stops without succeeding.
 *
 * The card has no actions, so this only reads why the flow ended and closes the
 * channel. Not every route here closes it first, so this guarantees none
 * outlives the flow.
 *
 * The reason travels in router state, not the URL: changing the search string
 * mid-flow rebuilds the integration, handing back a different instance than the
 * one holding this channel.
 */
const TimeoutAndCancelContainer = ({
  integration,
}: TimeoutAndCancelContainerProps) => {
  const location = useLocation();
  // Anything but an explicit cancel is a timeout, including no state at all.
  const reason: PairingInterruptionReason =
    location.state?.reason === 'canceled' ? 'canceled' : 'timeout';

  useEffect(() => {
    if (!(integration instanceof PairingSupplicantIntegration)) {
      return;
    }
    // Already-closed is the common case, so swallow the rejection.
    integration.destroy().catch((err) => Sentry.captureException(err));
  }, [integration]);

  return <TimeoutAndCancel {...{ reason }} />;
};

export default TimeoutAndCancelContainer;

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { useLocation } from 'react-router';
import TimeoutAndCancel, { PairingInterruptionReason } from '.';

/**
 * Supplicant timeout/cancel container (FXA-13869). The mobile dead-end screen
 * has no actions, so the container only reads why the flow ended (the caller
 * sets `?reason=timeout` on a disconnect and `?reason=canceled` on cancel) and
 * passes it to the card. Anything but an explicit cancel falls back to `timeout`.
 */
const TimeoutAndCancelContainer = () => {
  const raw = new URLSearchParams(useLocation().search).get('reason');
  const reason: PairingInterruptionReason =
    raw === 'canceled' ? 'canceled' : 'timeout';

  return <TimeoutAndCancel {...{ reason }} />;
};

export default TimeoutAndCancelContainer;

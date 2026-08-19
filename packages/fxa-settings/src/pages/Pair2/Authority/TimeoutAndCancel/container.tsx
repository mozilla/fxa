/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { useLocation } from 'react-router';
import { pairingFlow } from '../../../../lib/channels/pairing-flow';
import { navigateWithQuery } from '../../../../lib/utilities';
import TimeoutAndCancel, { TimeoutAndCancelReason } from '.';

/**
 * Authority timeout/cancel container (FXA-13869). The dead-end screen after a
 * pairing attempt ends without connecting. The caller sets `?reason=timeout` on
 * a disconnect and `?reason=canceled` on cancel; anything but an explicit cancel
 * falls back to `timeout`. "Try again" resets the flow and re-mints from scan_qr.
 */
const TimeoutAndCancelContainer = () => {
  const raw = new URLSearchParams(useLocation().search).get('reason');
  const reason: TimeoutAndCancelReason =
    raw === 'canceled' ? 'canceled' : 'timeout';

  const onTryAgain = () => {
    pairingFlow.reset();
    navigateWithQuery('/pair/authority/scan_qr');
  };
  const onSyncSettings = () => navigateWithQuery('/settings');
  const onCancel = () => navigateWithQuery('/settings');

  return (
    <TimeoutAndCancel {...{ reason, onTryAgain, onSyncSettings, onCancel }} />
  );
};

export default TimeoutAndCancelContainer;

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import TimeoutAndCancel from '.';
import { useLocation, useNavigate } from 'react-router';
import firefox from '../../../../lib/channels/firefox';

export type TimeoutAndCancelContainerProps = {}

/**
 * The desktop screen shown once pairing stops without succeeding — either it
 * timed out or someone canceled it. Both reasons offer "Try again"; the
 * secondary action differs, because a timeout leaves the user mid-flow with
 * something to abandon while a cancel has already ended it.
 */
const TimeoutAndCancelContainer = (_props: TimeoutAndCancelContainerProps) => {
  const navigate = useNavigate();
  const location = useLocation();

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

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import * as Sentry from '@sentry/react';
import {
  Integration,
  PairingAuthorityIntegration,
} from '../../../../models';
import { navigateWithQuery } from '../../../../lib/utilities';
import TimeoutAndCancel from '.';

/**
 * Authority timeout/cancel container (FXA-13869). The dead-end screen after a
 * pairing attempt ends without connecting. "Try again" resets the flow and
 * re-mints a channel from scan_qr.
 */
const TimeoutAndCancelContainer = ({
  integration,
}: {
  integration: Integration;
}) => {
  const onTryAgain = () => {
    if (integration instanceof PairingAuthorityIntegration) {
      // Ends the flow, so close the channel. `destroy` is async and nothing
      // awaits it here; catch so a failed close is not an unhandled rejection.
      integration.destroy().catch((err) => Sentry.captureException(err));
    }
    navigateWithQuery('/pair/authority/scan_qr');
  };
  const onSyncSettings = () => navigateWithQuery('/settings');
  const onCancel = () => navigateWithQuery('/settings');

  return <TimeoutAndCancel {...{ onTryAgain, onSyncSettings, onCancel }} />;
};

export default TimeoutAndCancelContainer;

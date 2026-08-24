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
import ContinueOnMobile from '.';

/**
 * Authority "continue on mobile" container (FXA-13867 authority half).
 *
 * Reached after the authority grants the code. The advance to sync success is
 * driven by the pair:supp:complete listener attached in the ApproveSignIn
 * container before the code was sent (so the signal cannot be missed during this
 * navigation). This screen just shows the waiting state and offers cancel.
 */
const ContinueOnMobileContainer = ({
  integration,
}: {
  integration: Integration;
}) => {
  const onCancel = () => {
    if (integration instanceof PairingAuthorityIntegration) {
      // Ends the flow, so close the channel. `destroy` is async and nothing
      // awaits it here; catch so a failed close is not an unhandled rejection.
      integration.destroy().catch((err) => Sentry.captureException(err));
    }
    navigateWithQuery('/pair/authority/timeout_and_cancel');
  };

  return <ContinueOnMobile {...{ onCancel }} />;
};

export default ContinueOnMobileContainer;

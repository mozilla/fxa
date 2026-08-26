/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useEffect } from "react";
import * as Sentry from "@sentry/browser";
import ApproveSignIn from ".";
import { Integration, PairingSupplicantIntegration, SupplicantState } from "../../../../models";
import { navigateWithQuery } from "../../../../lib/utilities";


export const ApproveSignInContainer = ({integration}:{integration:Integration|PairingSupplicantIntegration}) => {
  if (!(integration instanceof PairingSupplicantIntegration)) {
     throw new Error('Invalid integration. Expecting instance of PairingSupplicantIntegration');
  }
  if (!integration.remoteMetadata) {
    throw new Error('Invalid integration state. Remote meta data should be populated.');
  }

  useEffect(() => {
    integration.onStateChange = (state) => {
      switch(state) {
        case SupplicantState.Complete:
          navigateWithQuery('/pair/supplicant/sync_success', {}, true);
          break;
        case SupplicantState.Failed:
          console.warn('SupplicantState failed', { tags: { state } })
          navigateWithQuery('/pair/supplicant/timeout_and_cancel', {}, true);
          break;
        default:
          console.warn('Unexpected state change: ' + state);
          break;
      }
    }

    return () => {
      // Unsubscribe only — the channel outlives this page for sync_success.
      integration.onStateChange = null;
    };
  },[integration])

  const onCancel = () => {
    integration.destroy()
      .then(() => {
        navigateWithQuery('/pair/supplicant/timeout_and_cancel', {}, true)
      }).catch((err) => {
        Sentry.captureException(err);
        navigateWithQuery('/pair/supplicant/timeout_and_cancel', {}, true)
      });
  }

  return <ApproveSignIn {...{ remoteMetadata:integration.remoteMetadata, onCancel }}/>
}

export default ApproveSignInContainer

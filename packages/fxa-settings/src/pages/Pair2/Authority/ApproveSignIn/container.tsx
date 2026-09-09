/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useRef, useState } from 'react';
import { RemoteMetadata } from '../../../../lib/types';
import { AuthorityState, Integration, PairingAuthorityIntegration, useAccount } from '../../../../models';
import { useNavigate } from 'react-router';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import ApproveSignIn from '.';
import { navigateWithQuery } from '../../../../lib/utilities';
import * as Sentry from '@sentry/browser';

export const ApproveSignInContainer = ({
  integration
}: { integration?: Integration|PairingAuthorityIntegration }) => {
  if (!(integration instanceof PairingAuthorityIntegration)) {
    throw new Error('Invalid integration type.');
  }
  if (!integration.hasChannel()) {
    throw new Error('Pairing channel missing!')
  }

  const navigate = useNavigate();
  const account = useAccount();
  const [remoteMetadata, setRemoteMetadata] = useState<RemoteMetadata|null>(integration.remoteMetadata);

  useEffect(() => {
    integration.onStateChange = (state:AuthorityState) => {
      switch (state) {
        case AuthorityState.WaitingForAuthorizations:
          setRemoteMetadata(integration.remoteMetadata);
          break;
        case AuthorityState.Complete:
          navigateWithQuery('/pair/authority/sync_success', {}, true)
          break;
        case AuthorityState.Failed:
          navigateWithQuery('/pair/authority/timeout_and_cancel', {}, true);
          break;
        default:
          console.warn('Unexpected state change: ' + state);
          break;
      }
    };

    return () => {
      // Unsubscribe only — the channel outlives this page for sync_success.
      integration.onStateChange = null;
    };
  }, [integration]);

  // A second click would mint a second OAuth code and send another
  // `pair:auth:authorize`, the latter after the flow has already completed.
  const approving = useRef(false);
  const onApprove = () => {
    if (approving.current) {
      return;
    }
    approving.current = true;
    // `authorize()` routes the failures it expects through `fail()`, which lands
    // on the Failed case above. This catch is the backstop so nothing here
    // becomes an unhandled rejection.
    integration.authorize().catch((err) => {
      Sentry.captureException(err);
      navigateWithQuery('/pair/authority/timeout_and_cancel', {}, true);
    });
  }

  const onChangePassword = () => {
    navigate('/settings/change_password');
  }

  if (!remoteMetadata) {
    return <LoadingSpinner />
  }

  return <ApproveSignIn {...{remoteMetadata, email:account.email, onApprove, onChangePassword }} />
};

export default ApproveSignInContainer;

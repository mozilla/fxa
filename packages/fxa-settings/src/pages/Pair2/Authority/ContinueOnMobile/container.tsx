/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import * as Sentry from '@sentry/browser';
import { AuthorityState, Integration, PairingAuthorityIntegration } from '../../../../models';
import ContinueOnMobile from '.';
import { navigateWithQuery } from '../../../../lib/utilities';

export type ContinueOnMobileContainerProps = {
  integration?: Integration|PairingAuthorityIntegration
};

const ContinueOnMobileContainer = ({ integration }: ContinueOnMobileContainerProps) => {
  if (!(integration instanceof PairingAuthorityIntegration)) {
    throw new Error('Invalid integration. Expecting instance of PairingAuthorityIntegration.');
  }

  const navigate = useNavigate();

  useEffect(() => {
    integration.onStateChange = (state:AuthorityState) => {
      switch (state) {
        case AuthorityState.WaitingForAuthority:
          navigateWithQuery('/pair/authority/approve_signin', {}, true);
          break;
        case AuthorityState.Failed:
          // The pairing request is dead — cancelled or timed out — so the
          // authority must not be shown a sign-in to approve for it.
          navigateWithQuery('/pair/authority/timeout_and_cancel', {}, true);
          break;
        default:
          console.warn('Unexpected state change: ' + state);
          break;
      }
    }

    return () => {
      // Unsubscribe only — the channel outlives this page for approve_signin.
      integration.onStateChange = null;
    };
  }, [integration]);

  const onCancel = () => {
    integration.destroy()
      .then(() => {
        navigate('/pair/authority/timeout_and_cancel')
      })
      .catch((err) => {
        Sentry.captureException(err);
        navigate('/pair/authority/timeout_and_cancel');
      });
  };

  return <ContinueOnMobile {...{onCancel}}/>
};

export default ContinueOnMobileContainer;

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useRef } from 'react';
import {
  AuthorityState,
  Integration,
  PairingAuthorityIntegration,
} from '../../../../models';
import AuthTotp from '../../../Pair/AuthTotp';
import { MozServices } from '../../../../lib/types';
import { navigateWithQuery } from '../../../../lib/utilities';

export type EnterTotpContainerProps = {
  integration?: Integration | PairingAuthorityIntegration;
};

/**
 * The desktop's TOTP re-prompt, shown between the phone confirming and the
 * approval screen when the account has two-step authentication enabled. A
 * verified code returns to approve_signin with `totpComplete` set so the check
 * is not repeated.
 */
const EnterTotpContainer = ({ integration }: EnterTotpContainerProps) => {
  if (!(integration instanceof PairingAuthorityIntegration)) {
    throw new Error('Invalid integration type.');
  }
  if (!integration.hasChannel()) {
    throw new Error('Pairing channel missing!');
  }

  // Set once the pairing fails so a code verified after that cannot send the
  // user on to an approval screen whose channel is already gone.
  const failed = useRef(false);

  useEffect(() => {
    integration.onStateChange = (state: AuthorityState) => {
      switch (state) {
        case AuthorityState.Failed:
          // The phone cancelled or the channel died while the code was being
          // typed; there is no longer a sign-in to approve.
          failed.current = true;
          navigateWithQuery('/pair/authority/timeout_and_cancel', {}, true);
          break;
        default:
          console.warn('Unexpected state change: ' + state);
          break;
      }
    };

    return () => {
      // Unsubscribe only — the channel outlives this page for approve_signin.
      integration.onStateChange = null;
    };
  }, [integration]);

  const onVerified = () => {
    if (failed.current || !integration.hasChannel()) {
      return;
    }
    navigateWithQuery('/pair/authority/approve_signin', {
      replace: true,
      state: { totpComplete: true, totpVerifiedAt: Date.now() },
    });
  };

  return <AuthTotp serviceName={MozServices.FirefoxSync} {...{ onVerified }} />;
};

export default EnterTotpContainer;

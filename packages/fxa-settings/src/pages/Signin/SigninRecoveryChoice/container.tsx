/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useState, useEffect } from 'react';
import { RouteComponentProps, useLocation } from '@reach/router';
import SigninRecoveryChoice from '.';
import { useAuthClient } from '../../../models';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import { SigninLocationState } from '../interfaces';
import { getSigninState } from '../utils';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import {
  AuthUiErrorNos,
  AuthUiErrors,
} from '../../../lib/auth-errors/auth-errors';

export const SigninRecoveryChoiceContainer = (_: RouteComponentProps) => {
  const authClient = useAuthClient();
  const location = useLocation() as ReturnType<typeof useLocation> & {
    state: SigninLocationState;
  };
  const navigateWithQuery = useNavigateWithQuery();
  const signinState = getSigninState(location.state);

  const [numBackupCodes, setNumBackupCodes] = useState<number>(0);
  const [lastFourPhoneDigits, setLastFourPhoneDigits] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!signinState || !signinState.sessionToken) {
      navigateWithQuery('/signin');
      return;
    }

    const fetchData = async () => {
      try {
        const { count } = await authClient.getRecoveryCodesExist(
          signinState.sessionToken
        );
        count && setNumBackupCodes(count);

        const { phoneNumber } = await authClient.recoveryPhoneGet(
          signinState.sessionToken
        );
        // TODO verify that recoveryPhoneGet returns a masked phone number (last four digits only)
        phoneNumber && setLastFourPhoneDigits(phoneNumber.slice(-4));

        // whether or not the user has backup authentication codes,
        // go directly to the backup authentication codes page if they don't have a phone number
        // do not render the choice screen
        if (!phoneNumber) {
          navigateWithQuery('/signin_recovery_code', {
            state: { signinState },
            // ensure back button on signin_recovery_code page skips choice page and returns to signin_totp_code
            replace: true,
          });
          return;
        }

        if (phoneNumber && (!count || count === 0)) {
          navigateWithQuery('/signin_recovery_phone', {
            state: { signinState, lastFourPhoneDigits },
            // ensure back button on signin_recovery_code page skips choice page and returns to signin_totp_code
            replace: true,
          });
        }
        return;
      } catch (err) {
        if (err.errno === AuthUiErrors.INVALID_TOKEN.errno) {
          navigateWithQuery('/signin');
          return;
        }
        // if there was another error fetching available recovery methods, go to backup authentication codes page
        navigateWithQuery('/signin_recovery_code', {
          state: { signinState },
          // ensure back button on signin_recovery_code page skips choice page and returns to signin_totp_code
          replace: true,
        });
        return;
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [authClient, lastFourPhoneDigits, signinState, navigateWithQuery]);

  const handlePhoneChoice = async () => {
    if (!signinState) {
      return;
    }
    try {
      await authClient.recoveryPhoneSigninSendCode(signinState.sessionToken);
      return;
    } catch (err) {
      if (err.errno && AuthUiErrorNos[err.errno]) {
        if (err.errno === AuthUiErrors.INVALID_TOKEN.errno) {
          navigateWithQuery('/signin');
          return;
        }
        return err;
      }
      return AuthUiErrors.UNEXPECTED_ERROR;
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!signinState || !lastFourPhoneDigits) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SigninRecoveryChoice
      {...{
        handlePhoneChoice,
        lastFourPhoneDigits,
        numBackupCodes,
        signinState,
      }}
    />
  );
};

export default SigninRecoveryChoiceContainer;

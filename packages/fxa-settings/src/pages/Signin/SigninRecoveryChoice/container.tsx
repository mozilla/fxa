/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useState, useEffect } from 'react';
import { RouteComponentProps, useLocation } from '@reach/router';
import SigninRecoveryChoice from '.';
import { useAuthClient, useFtlMsgResolver } from '../../../models';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import { SigninLocationState } from '../interfaces';
import { getSigninState } from '../utils';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import {
  AuthUiErrorNos,
  AuthUiErrors,
} from '../../../lib/auth-errors/auth-errors';
import { formatPhoneNumber } from '../../../lib/recovery-phone-utils';
import { getHandledError, HandledError } from '../../../lib/error-utils';

export const SigninRecoveryChoiceContainer = (_: RouteComponentProps) => {
  const authClient = useAuthClient();
  const location = useLocation() as ReturnType<typeof useLocation> & {
    state: SigninLocationState;
  };
  const navigateWithQuery = useNavigateWithQuery();
  const ftlMsgResolver = useFtlMsgResolver();
  const signinState = getSigninState(location.state);

  const [numBackupCodes, setNumBackupCodes] = useState<number>(0);
  const [phoneData, setPhoneData] = useState({
    phoneNumber: '',
    nationalFormat: '',
    maskedPhoneNumber: '',
    lastFourPhoneDigits: '',
  });
  const [loading, setLoading] = useState(true);
  const [dataFetchError, setDataFetchError] = useState<HandledError>();

  useEffect(() => {
    if (!signinState || !signinState.sessionToken) {
      return;
    }

    const fetchData = async () => {
      try {
        const { count } = await authClient.getRecoveryCodesExist(
          signinState.sessionToken
        );
        count && setNumBackupCodes(count);

        const { phoneNumber, nationalFormat } =
          await authClient.recoveryPhoneGet(signinState.sessionToken);

        const { maskedPhoneNumber, lastFourPhoneDigits } = formatPhoneNumber({
          phoneNumber,
          nationalFormat,
          ftlMsgResolver,
        });
        setPhoneData({
          phoneNumber,
          nationalFormat,
          maskedPhoneNumber,
          lastFourPhoneDigits,
        });
        return;
      } catch (err) {
        const handledError = getHandledError(err);
        setDataFetchError(handledError.error);
        return;
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // excluding ftlMsgResolver as it is causing re-renders
    // but should be stable and not changing at runtime
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authClient, signinState]);

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

  if (!signinState || !signinState.sessionToken) {
    navigateWithQuery('/signin');
    return;
  }

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (dataFetchError) {
    if (dataFetchError.errno === AuthUiErrors.INVALID_TOKEN.errno) {
      navigateWithQuery('/signin');
      return;
    }
    // if there was another error fetching available recovery methods, go to backup authentication codes page
    navigateWithQuery('/signin_recovery_code', {
      state: { signinState },
      // ensure back button on signin_recovery_code page skips choice page and returns to signin_totp_code
      replace: true,
    });
  }
  if (!phoneData.phoneNumber) {
    navigateWithQuery('/signin_recovery_code', {
      state: { signinState },
      // ensure back button on signin_recovery_code page skips choice page and returns to signin_totp_code
      replace: true,
    });
    return;
  } else if (!numBackupCodes || numBackupCodes === 0) {
    navigateWithQuery('/signin_recovery_phone', {
      state: {
        signinState,
        lastFourPhoneDigits: phoneData.lastFourPhoneDigits,
      },
      // ensure back button on signin_recovery_code page skips choice page and returns to signin_totp_code
      replace: true,
    });
  }

  return (
    <SigninRecoveryChoice
      maskedPhoneNumber={phoneData.maskedPhoneNumber}
      lastFourPhoneDigits={phoneData.lastFourPhoneDigits}
      {...{
        handlePhoneChoice,
        numBackupCodes,
        signinState,
      }}
    />
  );
};

export default SigninRecoveryChoiceContainer;

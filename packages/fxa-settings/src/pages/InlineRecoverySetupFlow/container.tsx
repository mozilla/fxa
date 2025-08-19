/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useMutation, useQuery } from '@apollo/client';
import { RouteComponentProps, useLocation } from '@reach/router';
import { useNavigateWithQuery } from '../../lib/hooks/useNavigateWithQuery';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { useCallback, useEffect, useState } from 'react';
import {
  useFinishOAuthFlowHandler,
  useOAuthKeysCheck,
} from '../../lib/oauth/hooks';
import { getCode } from '../../lib/totp';
import { MozServices } from '../../lib/types';
import {
  Integration,
  useAccount,
  useAuthClient,
  useConfig,
  useFtlMsgResolver,
  useSensitiveDataClient,
} from '../../models';
import { VERIFY_TOTP_MUTATION } from './gql';
import InlineRecoverySetupFlow from './index';
import { hardNavigate } from 'fxa-react/lib/utils';
import { SigninRecoveryLocationState } from './interfaces';
import { TotpStatusResponse } from '../Signin/SigninTokenCode/interfaces';
import { GET_TOTP_STATUS } from '../../components/App/gql';
import OAuthDataError from '../../components/OAuthDataError';
import { isFirefoxService } from '../../models/integrations/utils';
import { SensitiveData } from '../../lib/sensitive-data-client';
import { Choice } from '../../components/FormChoice';
import { totpUtils } from '../../lib/totp-utils';
import { getErrorFtlId, getHandledError } from '../../lib/error-utils';
import { AuthUiErrors } from '../../lib/auth-errors/auth-errors';

export const InlineRecoverySetupFlowContainer = ({
  isSignedIn,
  integration,
  serviceName,
}: {
  isSignedIn: boolean;
  integration: Integration;
  serviceName: MozServices;
} & RouteComponentProps) => {
  const config = useConfig();
  const account = useAccount();
  const [loadingAccount, setLoadingAccount] = useState<boolean>(true);

  useEffect(() => {
    async function acctRefresh() {
      try {
        // can't just put an expression here so a function call it is
        (() => account.recoveryPhone)();
      } catch {
        await account.refresh('account');
      } finally {
        setLoadingAccount(false);
      }
    }
    acctRefresh();
  }, [account]);

  const navigateWithQuery = useNavigateWithQuery();

  const authClient = useAuthClient();
  const { finishOAuthFlowHandler, oAuthDataError } = useFinishOAuthFlowHandler(
    authClient,
    integration
  );

  const location = useLocation() as ReturnType<typeof useLocation> & {
    state?: SigninRecoveryLocationState;
  };

  const ftlMsgResolver = useFtlMsgResolver();
  const localizedIncorrectBackupCodeError = ftlMsgResolver.getMsg(
    'tfa-incorrect-recovery-code-1',
    'Incorrect backup authentication code'
  );

  const [currentStep, setCurrentStep] = useState<number>(1);
  const navigateForward = useCallback(() => {
    setCurrentStep(currentStep + 1);
  }, [currentStep]);
  const navigateBackward = useCallback(() => {
    setCurrentStep(currentStep - 1);
  }, [currentStep]);

  const signinRecoveryLocationState = location.state;
  const { totp, ...signinLocationState } = signinRecoveryLocationState || {};
  const sensitiveDataClient = useSensitiveDataClient();
  const { keyFetchToken, unwrapBKey } =
    sensitiveDataClient.getDataType(SensitiveData.Key.Auth) || {};

  const { oAuthKeysCheckError } = useOAuthKeysCheck(
    integration,
    keyFetchToken,
    unwrapBKey
  );

  const [backupMethod, setBackupMethod] = useState<Choice | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [generatingCodes, setGeneratingCodes] = useState(false);
  const [backupCodeError, setBackupCodeError] = useState<string>('');

  const createRecoveryCodes = useCallback(async () => {
    if (backupCodes.length || generatingCodes) return;
    setGeneratingCodes(true);
    const codes: string[] = await totpUtils.generateRecoveryCodes(
      config.recoveryCodes.count,
      config.recoveryCodes.length
    );
    setBackupCodes(codes);
    setGeneratingCodes(false);
  }, [backupCodes, config.recoveryCodes, generatingCodes]);

  // Always generate codes early; they will only be persisted if the user confirms them
  useEffect(() => {
    createRecoveryCodes();
  }, [createRecoveryCodes]);

  const backupChoiceCb = useCallback(
    async (choice: Choice) => {
      setBackupMethod(choice);
      navigateForward();
    },
    [navigateForward]
  );

  const [verifyTotp] = useMutation<{ verifyTotp: { success: boolean } }>(
    VERIFY_TOTP_MUTATION
  );
  const verifyTotpHandler = useCallback(async () => {
    const code = await getCode(totp!.secret);
    const service = integration.getService();
    const clientId = integration.getClientId();

    const result = await verifyTotp({
      variables: {
        input: {
          code,
          ...(isFirefoxService(service) ? { service } : { service: clientId }),
        },
      },
    });
    return result.data!.verifyTotp.success;
  }, [integration, totp, verifyTotp]);

  const [phoneData, setPhoneData] = useState<{
    phoneNumber: string;
    nationalFormat: string | undefined;
  }>({ phoneNumber: '', nationalFormat: '' });
  const verifyPhoneNumber = useCallback(
    async (phoneNumberInput: string) => {
      const { nationalFormat } =
        await account.addRecoveryPhone(phoneNumberInput);
      setPhoneData({
        phoneNumber: phoneNumberInput,
        nationalFormat,
      });
    },
    [account]
  );
  const sendSmsCode = useCallback(async () => {
    await account.addRecoveryPhone(phoneData.phoneNumber);
    return;
  }, [account, phoneData.phoneNumber]);

  const verifySmsCode = useCallback(
    async (code: string) => {
      await account.confirmRecoveryPhone(code, phoneData.phoneNumber, true);
      await verifyTotpHandler();
    },
    [account, phoneData.phoneNumber, verifyTotpHandler]
  );

  const completeBackupCodeSetup = useCallback(
    async (code: string) => {
      if (!backupCodes.includes(code.trim())) {
        setBackupCodeError(localizedIncorrectBackupCodeError);
        return;
      }

      try {
        await account.setRecoveryCodes(backupCodes);
        const success = await verifyTotpHandler();

        if (success) {
          setBackupCodeError('');
          navigateForward();
        } else {
          // Some server side error occurred. Generic error message in catch
          // block.
          throw new Error('cannot enable TOTP');
        }
      } catch (err) {
        const { error } = getHandledError(err);
        if (error.errno === AuthUiErrors.TOTP_TOKEN_NOT_FOUND.errno) {
          setBackupCodeError(
            ftlMsgResolver.getMsg(
              getErrorFtlId(error),
              AuthUiErrors.TOTP_TOKEN_NOT_FOUND.message
            )
          );
        } else if (error.errno === AuthUiErrors.INVALID_OTP_CODE.errno) {
        } else {
          setBackupCodeError(
            ftlMsgResolver.getMsg(
              'tfa-cannot-verify-code-4',
              'There was a problem confirming your backup authentication code'
            )
          );
        }
      }
    },
    [
      backupCodes,
      localizedIncorrectBackupCodeError,
      account,
      verifyTotpHandler,
      navigateForward,
      ftlMsgResolver,
    ]
  );

  const { data: totpStatus, loading: totpStatusLoading } =
    useQuery<TotpStatusResponse>(GET_TOTP_STATUS);

  const successfulSetupHandler = useCallback(async () => {
    // When this is called, we know signinRecoveryLocationState exists.
    const { redirect } = await finishOAuthFlowHandler(
      signinRecoveryLocationState!.uid,
      signinRecoveryLocationState!.sessionToken,
      keyFetchToken,
      unwrapBKey
    );
    hardNavigate(redirect!);
  }, [
    signinRecoveryLocationState,
    finishOAuthFlowHandler,
    keyFetchToken,
    unwrapBKey,
  ]);

  if (currentStep === 0) {
    navigateWithQuery('/inline_totp_setup', { state: signinLocationState });
    return;
  }

  // Some basic sanity checks
  if (!isSignedIn || !signinRecoveryLocationState?.email || !totp) {
    navigateWithQuery('/signup');
    return <LoadingSpinner fullScreen />;
  }

  if (totpStatus?.account?.totp.verified) {
    navigateWithQuery('/signin_totp_code', {
      state: signinLocationState,
    });
    return <LoadingSpinner fullScreen />;
  }

  // !recoveryCodes check should happen after checking !totp
  if (totpStatusLoading || loadingAccount) {
    return <LoadingSpinner fullScreen />;
  }

  if (oAuthDataError) {
    return <OAuthDataError error={oAuthDataError} />;
  }
  // Note that we don't currently need this check on this page right now since AMO is the only
  // RP requiring 2FA and it doesn't require keys. However it's here for consistency.
  if (oAuthKeysCheckError) {
    return <OAuthDataError error={oAuthKeysCheckError} />;
  }

  return (
    <InlineRecoverySetupFlow
      {...{
        flowHasPhoneChoice: account.recoveryPhone.available,
        serviceName,
        email: signinRecoveryLocationState.email,
        currentStep,
        backupMethod,
        backupCodes,
        generatingCodes,
        phoneData,
        navigateForward,
        navigateBackward,
        backupChoiceCb,
        backupCodeError,
        setBackupCodeError,
        sendSmsCode,
        verifyPhoneNumber,
        verifySmsCode,
        completeBackupCodeSetup,
        successfulSetupHandler,
      }}
    />
  );
};

export default InlineRecoverySetupFlowContainer;

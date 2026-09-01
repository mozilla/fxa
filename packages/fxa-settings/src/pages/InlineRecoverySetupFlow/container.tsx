/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useLocation } from 'react-router';
import { useNavigateWithQuery } from '../../lib/hooks';
import { useCallback, useEffect, useState, useRef } from 'react';
import {
  useFinishOAuthFlowHandler,
  useOAuthKeysCheck,
} from '../../lib/oauth/hooks';
import AppLayout from '../../components/AppLayout';
import { MfaReason, MozServices } from '../../lib/types';
import {
  Integration,
  useAccount,
  useAuthClient,
  useConfig,
  useFtlMsgResolver,
  useSensitiveDataClient,
} from '../../models';
import { MfaGuardCore } from '../../components/Settings/MfaGuard/MfaGuardCore';
import { JwtTokenCache } from '../../lib/cache';
import { clearMfaAndJwtCacheOnInvalidJwt } from '../../lib/mfa-guard-utils';
import InlineRecoverySetup from './index';
import { hardNavigate } from 'fxa-react/lib/utils';
import { SigninRecoveryLocationState } from './interfaces';
import OAuthDataError from '../../components/OAuthDataError';
import { SensitiveData } from '../../lib/sensitive-data-client';
import { Choice } from '../../components/FormChoice';
import { totpUtils } from '../../lib/totp-utils';
import { getErrorFtlId, getHandledError } from '../../lib/error-utils';
import { AuthUiErrors } from '../../lib/auth-errors/auth-errors';

export const InlineRecoverySetupContainer = ({
  isSignedIn,
  integration,
  serviceName,
}: {
  isSignedIn: boolean;
  integration: Integration;
  serviceName: MozServices;
}) => {
  const config = useConfig();
  const account = useAccount();
  const [loadingAccount, setLoadingAccount] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    async function acctRefresh() {
      try {
        // Refresh to get recoveryPhone.available (not populated during sign-in)
        await account.refresh('account');
      } catch {
        // Fall through — read whatever localStorage already has.
      }
      if (!cancelled) {
        setLoadingAccount(false);
      }
    }
    acctRefresh();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const [totpStatus, setTotpStatus] = useState<
    { exists: boolean; verified: boolean } | undefined
  >(undefined);
  const [totpStatusLoading, setTotpStatusLoading] = useState(true);
  const isTotpStatusChecked = useRef(false);

  useEffect(() => {
    if (
      isTotpStatusChecked.current ||
      !signinRecoveryLocationState?.sessionToken
    ) {
      return;
    }
    isTotpStatusChecked.current = true;

    (async () => {
      try {
        const status = await authClient.checkTotpTokenExists(
          signinRecoveryLocationState.sessionToken
        );
        setTotpStatus(status);
      } catch (error) {
        // If there's an error checking TOTP status, assume it doesn't exist
        setTotpStatus({ exists: false, verified: false });
      } finally {
        setTotpStatusLoading(false);
      }
    })();
  }, [authClient, signinRecoveryLocationState?.sessionToken]);

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

  const verifyTotpHandler = useCallback(async () => {
    try {
      // Completing TOTP setup requires the MFA email-OTP proof (JWT), not just
      // the session token (FXA-14311).
      const jwt = JwtTokenCache.getToken(
        signinRecoveryLocationState!.sessionToken,
        '2fa'
      );
      await authClient.completeTotpSetupWithJwt(jwt, {
        // Send the protocol service value (e.g. `sync`), not the `serviceName`
        // display label — the server's `service` validator rejects spaces and
        // strings over 16 chars, which most display names are (FXA-14311).
        service: integration.getService(),
      });
      return true;
    } catch (err) {
      // The short-lived mfa:2fa JWT can expire during the (multi-step) recovery
      // setup. On a stale/invalid JWT, drop it so MfaGuardCore re-prompts for a
      // fresh email OTP rather than dead-ending on a generic error.
      clearMfaAndJwtCacheOnInvalidJwt(
        err,
        '2fa',
        signinRecoveryLocationState!.sessionToken
      );
      // todo handle this error better
      // auth-server may return more specific errors (including throttling)
      return false;
    }
  }, [authClient, signinRecoveryLocationState, integration]);

  const [phoneData, setPhoneData] = useState<{
    phoneNumber: string;
    nationalFormat: string | undefined;
  }>({ phoneNumber: '', nationalFormat: '' });
  // confirmRecoveryPhone consumes a one-time SMS code and finalizes the phone.
  // If TOTP completion then fails (e.g. a stale MFA JWT triggers a guard
  // re-prompt), the user retries on the same step — but the code is already
  // spent. Track that the phone was confirmed so the retry skips
  // confirmRecoveryPhone and only re-runs the TOTP completion.
  const phoneConfirmedRef = useRef(false);
  const verifyPhoneNumber = useCallback(
    async (phoneNumberInput: string) => {
      const { nationalFormat } =
        await account.addRecoveryPhone(phoneNumberInput);
      // A newly entered phone must be re-confirmed.
      phoneConfirmedRef.current = false;
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
      // Skip on retry — the SMS code is single-use and the phone is already
      // finalized (see phoneConfirmedRef).
      if (!phoneConfirmedRef.current) {
        await account.confirmRecoveryPhone(code, phoneData.phoneNumber);
        phoneConfirmedRef.current = true;
      }
      const success = await verifyTotpHandler();
      if (!success) {
        // Completing TOTP failed — don't advance to the success screen with 2FA
        // still disabled. On a stale MFA JWT the guard re-prompts (the JWT was
        // cleared); retrying re-runs only verifyTotpHandler with the fresh JWT.
        throw new Error('cannot enable TOTP');
      }
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

  // The three ways to leave this page, in priority order. They run from the
  // effect below rather than during render, where the navigation would race
  // the commit.
  const shouldRedirectToTotpSetup = currentStep === 0;
  // Some basic sanity checks
  const shouldRedirectToSignup =
    !shouldRedirectToTotpSetup &&
    (!isSignedIn || !signinRecoveryLocationState?.email || !totp);
  // we only care about "verified" here, not "exists"
  // because "exists" only tells us that totp setup was started.
  // Prior to using Redis during setup, tokens were directly stored in the database,
  // but may never be marked as enabled/verified if setup is aborted or unsuccessful.
  const shouldRedirectToTotpCode =
    !shouldRedirectToTotpSetup &&
    !shouldRedirectToSignup &&
    !!totpStatus?.verified;
  useEffect(() => {
    if (shouldRedirectToTotpSetup) {
      navigateWithQuery('/inline_totp_setup', { state: signinLocationState });
    } else if (shouldRedirectToSignup) {
      navigateWithQuery('/signup');
    } else if (shouldRedirectToTotpCode) {
      navigateWithQuery('/signin_totp_code', { state: signinLocationState });
    }
  }, [
    shouldRedirectToTotpSetup,
    shouldRedirectToSignup,
    shouldRedirectToTotpCode,
    signinLocationState,
    navigateWithQuery,
  ]);

  if (shouldRedirectToTotpSetup || shouldRedirectToSignup) {
    return <AppLayout cmsInfo={integration.getCmsInfo()} loading />;
  }

  if (shouldRedirectToTotpCode) {
    return <AppLayout cmsInfo={integration.getCmsInfo()} loading />;
  }

  // !recoveryCodes check should happen after checking !totp
  // TODO: pass in cmsInfo when InlineRecoverySetup supports CMS
  if (totpStatusLoading || loadingAccount) {
    return <AppLayout loading />;
  }

  if (oAuthDataError) {
    return <OAuthDataError error={oAuthDataError} />;
  }
  // Note that we don't currently need this check on this page right now since AMO is the only
  // RP requiring 2FA and it doesn't require keys. However it's here for consistency.
  if (oAuthKeysCheckError) {
    return <OAuthDataError error={oAuthKeysCheckError} />;
  }

  // Gate completing TOTP setup behind an MFA email-OTP so a hijacked session
  // cannot finalize a second factor (FXA-14311).
  return (
    <MfaGuardCore
      requiredScope="2fa"
      reason={MfaReason.createTotp}
      email={signinRecoveryLocationState.email}
      sessionToken={signinRecoveryLocationState.sessionToken}
      onDismiss={() => navigateWithQuery('/signin')}
      onSessionInvalid={() => navigateWithQuery('/signin')}
      onFatalError={() => navigateWithQuery('/signin')}
    >
      <InlineRecoverySetup
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
    </MfaGuardCore>
  );
};

export default InlineRecoverySetupContainer;

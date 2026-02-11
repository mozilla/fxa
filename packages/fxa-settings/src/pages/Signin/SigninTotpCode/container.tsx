/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps, useLocation } from '@reach/router';
import { useValidatedQueryParams } from '../../../lib/hooks/useValidate';
import { SigninQueryParams } from '../../../models/pages/signin';
import { SigninTotpCode } from './index';
import { MozServices } from '../../../lib/types';
import VerificationMethods from '../../../constants/verification-methods';
import { getSigninState } from '../utils';
import { SigninLocationState } from '../interfaces';
import {
  Integration,
  isWebIntegration,
  useAuthClient,
  useSensitiveDataClient,
  useSession,
} from '../../../models';
import {
  useFinishOAuthFlowHandler,
  useOAuthKeysCheck,
} from '../../../lib/oauth/hooks';
import OAuthDataError from '../../../components/OAuthDataError';
import { getHandledError, HandledError } from '../../../lib/error-utils';
import { useWebRedirect } from '../../../lib/hooks/useWebRedirect';
import { SensitiveData } from '../../../lib/sensitive-data-client';
import { tryFinalizeUpgrade } from '../../../lib/auth-key-stretch-upgrade';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import AppLayout from '../../../components/AppLayout';

export type SigninTotpCodeContainerProps = {
  integration: Integration;
  serviceName: MozServices;
  setCurrentSplitLayout?: (value: boolean) => void;
};

export const SigninTotpCodeContainer = ({
  integration,
  serviceName,
  setCurrentSplitLayout,
}: SigninTotpCodeContainerProps & RouteComponentProps) => {
  const authClient = useAuthClient();
  const session = useSession();

  const { finishOAuthFlowHandler, oAuthDataError } = useFinishOAuthFlowHandler(
    authClient,
    integration
  );
  // TODO: FXA-9177, consider using localStorage instead of location state
  const location = useLocation() as ReturnType<typeof useLocation> & {
    state: SigninLocationState;
  };
  const signinState = getSigninState(location.state);

  const sensitiveDataClient = useSensitiveDataClient();
  const { keyFetchToken, unwrapBKey } =
    sensitiveDataClient.getDataType(SensitiveData.Key.Auth) || {};

  const { queryParamModel } = useValidatedQueryParams(SigninQueryParams);
  const { service } = queryParamModel;
  const navigateWithQuery = useNavigateWithQuery();

  const webRedirectCheck = useWebRedirect(integration.data.redirectTo);

  const { oAuthKeysCheckError } = useOAuthKeysCheck(
    integration,
    keyFetchToken,
    unwrapBKey,
    signinState?.isSignInWithThirdPartyAuth
  );

  const redirectTo =
    isWebIntegration(integration) && webRedirectCheck?.isValid
      ? integration.data.redirectTo
      : '';

  const submitTotpCode = async (code: string) => {
    try {
      const sessionToken = signinState?.sessionToken;
      if (!sessionToken) {
        return { error: AuthUiErrors.INVALID_TOKEN as HandledError };
      }

      // Verify TOTP code using auth-client
      const result = await authClient.verifyTotpCode(sessionToken, code, {
        service,
      });

      // Check authentication
      if (!result.success) {
        return { error: AuthUiErrors.INVALID_TOTP_CODE as HandledError };
      }

      // Attempt to finish any pending key stretching upgrade. We cannot finalize
      // a key stretching upgrade until the session is verified, which the process
      // can only be finished after the account has been verified on accounts that
      // require totp.
      // Users accessing this page because they need a session token AAL upgrade will
      // not upgrade key stretching since they were redirected and didn't enter a password.
      if (
        !signinState?.isSessionAALUpgrade &&
        (await session.isSessionVerified())
      ) {
        await tryFinalizeUpgrade(
          sessionToken,
          sensitiveDataClient,
          'signin-totp',
          authClient
        );
      }
      return { error: undefined };
    } catch (error) {
      return { error: getHandledError(error).error as HandledError };
    }
  };

  if (oAuthDataError) {
    return <OAuthDataError error={oAuthDataError} />;
  }

  if (oAuthKeysCheckError) {
    return <OAuthDataError error={oAuthKeysCheckError} />;
  }

  const cmsInfo = integration.getCmsInfo();
  const splitLayout = cmsInfo?.SigninTotpCodePage?.splitLayout;

  if (
    !signinState ||
    (signinState.isSessionAALUpgrade !== true &&
      signinState.verificationMethod &&
      signinState.verificationMethod !== VerificationMethods.TOTP_2FA)
  ) {
    navigateWithQuery('/');
    return (
      <AppLayout
        {...{ cmsInfo, loading: true, splitLayout, setCurrentSplitLayout }}
      />
    );
  }

  return (
    <SigninTotpCode
      {...{
        finishOAuthFlowHandler,
        integration,
        redirectTo,
        signinState,
        submitTotpCode,
        serviceName,
        keyFetchToken,
        unwrapBKey,
        setCurrentSplitLayout,
      }}
    />
  );
};

export default SigninTotpCodeContainer;

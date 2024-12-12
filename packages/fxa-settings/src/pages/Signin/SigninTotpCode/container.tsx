/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps, useLocation } from '@reach/router';
import { useValidatedQueryParams } from '../../../lib/hooks/useValidate';
import { SigninQueryParams } from '../../../models/pages/signin';
import { SigninTotpCode } from './index';
import { useMutation } from '@apollo/client';
import { MozServices } from '../../../lib/types';
import VerificationMethods from '../../../constants/verification-methods';
import { VERIFY_TOTP_CODE_MUTATION } from './gql';
import { getSigninState } from '../utils';
import {
  CredentialStatusResponse,
  GetAccountKeysResponse,
  PasswordChangeFinishResponse,
  PasswordChangeStartResponse,
  SigninLocationState,
} from '../interfaces';
import {
  Integration,
  isWebIntegration,
  useAuthClient,
  useSensitiveDataClient,
} from '../../../models';
import {
  useFinishOAuthFlowHandler,
  useOAuthKeysCheck,
} from '../../../lib/oauth/hooks';
import { hardNavigate } from 'fxa-react/lib/utils';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import OAuthDataError from '../../../components/OAuthDataError';
import { getHandledError, HandledError } from '../../../lib/error-utils';
import { useWebRedirect } from '../../../lib/hooks/useWebRedirect';
import { SensitiveData } from '../../../lib/sensitive-data-client';
import { GET_LOCAL_SIGNED_IN_STATUS } from '../../../components/App/gql';
import {
  CREDENTIAL_STATUS_MUTATION,
  GET_ACCOUNT_KEYS_MUTATION,
  PASSWORD_CHANGE_FINISH_MUTATION,
  PASSWORD_CHANGE_START_MUTATION,
} from '../gql';
import { tryFinalizeUpgrade } from '../../../lib/gql-key-stretch-upgrade';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';

export type SigninTotpCodeContainerProps = {
  integration: Integration;
  serviceName: MozServices;
};

export const SigninTotpCodeContainer = ({
  integration,
  serviceName,
}: SigninTotpCodeContainerProps & RouteComponentProps) => {
  const authClient = useAuthClient();
  const { finishOAuthFlowHandler, oAuthDataError } = useFinishOAuthFlowHandler(
    authClient,
    integration
  );
  // TODO: FXA-9177, likely use Apollo cache here instead of location state
  const location = useLocation() as ReturnType<typeof useLocation> & {
    state: SigninLocationState;
  };
  const signinState = getSigninState(location.state);
  const sensitiveDataClient = useSensitiveDataClient();
  const { keyFetchToken, unwrapBKey } =
    sensitiveDataClient.getDataType(SensitiveData.Key.Auth) || {};

  const { queryParamModel } = useValidatedQueryParams(SigninQueryParams);
  const { service } = queryParamModel;

  const webRedirectCheck = useWebRedirect(integration.data.redirectTo);

  const { oAuthKeysCheckError } = useOAuthKeysCheck(
    integration,
    keyFetchToken,
    unwrapBKey
  );

  const redirectTo =
    isWebIntegration(integration) && webRedirectCheck?.isValid
      ? integration.data.redirectTo
      : '';

  const [verifyTotpCode] = useMutation(VERIFY_TOTP_CODE_MUTATION);
  const [passwordChangeStart] = useMutation<PasswordChangeStartResponse>(
    PASSWORD_CHANGE_START_MUTATION
  );
  const [credentialStatus] = useMutation<CredentialStatusResponse>(
    CREDENTIAL_STATUS_MUTATION
  );
  const [getWrappedKeys] = useMutation<GetAccountKeysResponse>(
    GET_ACCOUNT_KEYS_MUTATION
  );
  const [passwordChangeFinish] = useMutation<PasswordChangeFinishResponse>(
    PASSWORD_CHANGE_FINISH_MUTATION
  );

  const submitTotpCode = async (code: string) => {
    try {
      const result = await verifyTotpCode({
        variables: {
          input: {
            code,
            service,
          },
        },
        update: (cache, { data }) => {
          if (data?.verifyTotp.success) {
            // Update the Apollo cache with the new signed in status
            const cacheData = cache.readQuery({
              query: GET_LOCAL_SIGNED_IN_STATUS,
            });
            if (cacheData) {
              cache.writeQuery({
                query: GET_LOCAL_SIGNED_IN_STATUS,
                data: { isSignedIn: true },
              });
            }
          }
        },
      });

      // Check authentication
      if (!result.data?.verifyTotp.success) {
        return { error: AuthUiErrors.INVALID_TOTP_CODE as HandledError };
      }

      // Attempt to finish any pending key stretching upgrade. We cannot finalize
      // a key stretching upgrade until the session is verified, which the process
      // can only be finished after the account has been verified on accounts that
      // require totp.
      if (signinState?.sessionToken) {
        await tryFinalizeUpgrade(
          signinState?.sessionToken,
          sensitiveDataClient,
          'signin-totp',
          credentialStatus,
          getWrappedKeys,
          passwordChangeStart,
          passwordChangeFinish
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

  if (
    !signinState ||
    (signinState.verificationMethod &&
      signinState.verificationMethod !== VerificationMethods.TOTP_2FA)
  ) {
    hardNavigate('/', {}, true);
    return <LoadingSpinner fullScreen />;
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
      }}
    />
  );
};

export default SigninTotpCodeContainer;

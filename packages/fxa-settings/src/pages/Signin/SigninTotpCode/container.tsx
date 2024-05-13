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
import { getSigninState, getHandledError } from '../utils';
import {
  CredentialStatusResponse,
  GetAccountKeysResponse,
  PasswordChangeFinishResponse,
  PasswordChangeStartResponse,
  SigninLocationState,
} from '../interfaces';
import { Integration, useAuthClient, useConfig } from '../../../models';
import { useFinishOAuthFlowHandler } from '../../../lib/oauth/hooks';
import { hardNavigate } from 'fxa-react/lib/utils';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import OAuthDataError from '../../../components/OAuthDataError';
import {
  CREDENTIAL_STATUS_MUTATION,
  GET_ACCOUNT_KEYS_MUTATION,
  PASSWORD_CHANGE_FINISH_MUTATION,
  PASSWORD_CHANGE_START_MUTATION,
} from '../gql';
import { tryKeyStretchingUpgrade } from '../container';
import { KeyStretchExperiment } from '../../../models/experiments';

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
  const config = useConfig();

  const { email, password } = location.state || {};

  const signinState = getSigninState(location.state);

  const { queryParamModel } = useValidatedQueryParams(SigninQueryParams);
  const keyStretchExp = useValidatedQueryParams(KeyStretchExperiment);
  const { redirectTo, service } = queryParamModel;

  const [verifyTotpCode] = useMutation(VERIFY_TOTP_CODE_MUTATION);

  const [credentialStatus] = useMutation<CredentialStatusResponse>(
    CREDENTIAL_STATUS_MUTATION
  );

  const [passwordChangeStart] = useMutation<PasswordChangeStartResponse>(
    PASSWORD_CHANGE_START_MUTATION
  );

  const [passwordChangeFinish] = useMutation<PasswordChangeFinishResponse>(
    PASSWORD_CHANGE_FINISH_MUTATION
  );

  const [getWrappedKeys] = useMutation<GetAccountKeysResponse>(
    GET_ACCOUNT_KEYS_MUTATION
  );

  const tryKeyStretching = async () => {
    if (!password) {
      return;
    }
    await tryKeyStretchingUpgrade(
      email,
      password,
      keyStretchExp.queryParamModel.isV2(config),
      credentialStatus,
      passwordChangeStart,
      getWrappedKeys,
      passwordChangeFinish
    );
  };

  const submitTotpCode = async (code: string) => {
    try {
      const result = await verifyTotpCode({
        variables: {
          input: {
            code,
            service,
          },
        },
      });

      let status = false;
      // Check authentication code
      if (result.data?.verifyTotp.success === true) {
        status = true;
      }

      return { status };
    } catch (error) {
      return { error: getHandledError(error).error, status: false };
    }
  };

  if (oAuthDataError) {
    return <OAuthDataError error={oAuthDataError} />;
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
        tryKeyStretching,
      }}
    />
  );
};

export default SigninTotpCodeContainer;

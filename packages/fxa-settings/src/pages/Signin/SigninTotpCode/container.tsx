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
import { SigninLocationState } from '../interfaces';
import { Integration, isWebIntegration, useAuthClient } from '../../../models';
import { useFinishOAuthFlowHandler } from '../../../lib/oauth/hooks';
import { hardNavigate } from 'fxa-react/lib/utils';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import OAuthDataError from '../../../components/OAuthDataError';
import { getHandledError } from '../../../lib/error-utils';
import { useWebRedirect } from '../../../lib/hooks/useWebRedirect';

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

  const { queryParamModel } = useValidatedQueryParams(SigninQueryParams);
  const { service } = queryParamModel;

  const webRedirectCheck = useWebRedirect(integration.data.redirectTo);

  const redirectTo =
    isWebIntegration(integration) && webRedirectCheck.isValid()
      ? integration.data.redirectTo
      : '';

  const [verifyTotpCode] = useMutation(VERIFY_TOTP_CODE_MUTATION);

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

      // Check authentication code
      if (result.data?.verifyTotp.success === true) {
        return { status: true };
      }

      return { status: false };
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
      }}
    />
  );
};

export default SigninTotpCodeContainer;

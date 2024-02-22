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
import { getStoredAccountInfo, handleGQLError } from '../utils';
import { SigninLocationState } from '../interfaces';
import { Integration, useAuthClient } from '../../../models';
import { useFinishOAuthFlowHandler } from '../../../lib/oauth/hooks';
import AppLayout from '../../../components/AppLayout';
import CardHeader from '../../../components/CardHeader';
import { hardNavigateToContentServer } from 'fxa-react/lib/utils';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';

export const viewName = 'signin-totp-code';

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

  const signinLocationState =
    location.state && Object.keys(location.state).length > 0
      ? location.state
      : getStoredAccountInfo();

  const { queryParamModel } = useValidatedQueryParams(SigninQueryParams);
  const { redirectTo, service } = queryParamModel;

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
      const gqlError = handleGQLError(error);
      return { error: gqlError.error, status: false };
    }
  };

  // TODO: UX for this, FXA-8106
  if (oAuthDataError) {
    return (
      <AppLayout>
        <CardHeader
          headingText="Unexpected error"
          headingTextFtlId="auth-error-999"
        />
      </AppLayout>
    );
  }

  if (
    !(Object.keys(signinLocationState).length > 0) ||
    (signinLocationState.verificationMethod &&
      signinLocationState.verificationMethod !== VerificationMethods.TOTP_2FA)
  ) {
    hardNavigateToContentServer(`/${location.search ? location.search : ''}`);
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SigninTotpCode
      {...{
        finishOAuthFlowHandler,
        integration,
        redirectTo,
        signinLocationState,
        submitTotpCode,
        serviceName,
      }}
    />
  );
};

export default SigninTotpCodeContainer;

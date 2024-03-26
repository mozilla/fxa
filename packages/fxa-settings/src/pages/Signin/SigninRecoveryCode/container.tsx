/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps, useLocation } from '@reach/router';
import { hardNavigateToContentServer } from 'fxa-react/lib/utils';
import { MozServices } from '../../../lib/types';
import SigninRecoveryCode from '.';
import { Integration, useAuthClient } from '../../../models';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { useMutation } from '@apollo/client';
import { CONSUME_RECOVERY_CODE_MUTATION } from './gql';
import { useCallback } from 'react';
import { getStoredAccountInfo, handleGQLError } from '../utils';
import { SigninLocationState } from '../interfaces';
import { useFinishOAuthFlowHandler } from '../../../lib/oauth/hooks';
import { useValidatedQueryParams } from '../../../lib/hooks/useValidate';
import { SigninQueryParams } from '../../../models/pages/signin';
import { ConsumeRecoveryCodeResponse, SubmitRecoveryCode } from './interfaces';
import AppLayout from '../../../components/AppLayout';
import CardHeader from '../../../components/CardHeader';

export type SigninRecoveryCodeContainerProps = {
  integration: Integration;
  serviceName: MozServices;
};

export const SigninRecoveryCodeContainer = ({
  integration,
  serviceName,
}: SigninRecoveryCodeContainerProps & RouteComponentProps) => {
  const authClient = useAuthClient();
  const { finishOAuthFlowHandler, oAuthDataError } = useFinishOAuthFlowHandler(
    authClient,
    integration
  );
  // TODO: FXA-9177, likely use Apollo cache here instead of location state
  const location = useLocation() as ReturnType<typeof useLocation> & {
    state: SigninLocationState;
  };
  const { queryParamModel } = useValidatedQueryParams(SigninQueryParams);
  const { redirectTo } = queryParamModel;

  const signinLocationState =
    location.state && location.state.sessionToken
      ? location.state
      : getStoredAccountInfo();

  const { sessionToken } = signinLocationState;

  const [consumeRecoveryCode] = useMutation<ConsumeRecoveryCodeResponse>(
    CONSUME_RECOVERY_CODE_MUTATION
  );

  const submitRecoveryCode: SubmitRecoveryCode = useCallback(
    async (recoveryCode: string) => {
      try {
        // this mutation returns the number of remaining codes,
        // but we're not currently using that value client-side
        // may want to see if we need it for /settings (display number of remaining backup codes?)
        const { data } = await consumeRecoveryCode({
          variables: { input: { code: recoveryCode } },
        });

        return { data };
      } catch (error) {
        return handleGQLError(error);
      }
    },
    [consumeRecoveryCode]
  );

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

  if (!sessionToken) {
    hardNavigateToContentServer(`/${location.search}`);
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SigninRecoveryCode
      {...{
        finishOAuthFlowHandler,
        integration,
        redirectTo,
        serviceName,
        signinLocationState,
        submitRecoveryCode,
      }}
    />
  );
};

export default SigninRecoveryCodeContainer;

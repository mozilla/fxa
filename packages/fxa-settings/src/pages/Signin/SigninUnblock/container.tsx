/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useMutation } from '@apollo/client';
import { RouteComponentProps, useLocation } from '@reach/router';

import LoadingSpinner from 'fxa-react/components/LoadingSpinner';

import VerificationMethods from '../../../constants/verification-methods';
import { getLocalizedErrorMessage } from '../../../lib/auth-errors/auth-errors';
import {
  Integration,
  isOAuthIntegration,
  useAuthClient,
  useFtlMsgResolver,
} from '../../../models';

// using default signin handlers
import { BEGIN_SIGNIN_MUTATION } from '../gql';
import { BeginSigninResponse } from '../interfaces';

import SigninUnblock from '.';
import {
  BeginSigninWithUnblockCodeHandler,
  ResendUnblockCodeHandler,
  SigninUnblockLocationState,
} from './interfaces';
import { getHandledError } from '../utils';
import { hardNavigate } from 'fxa-react/lib/utils';
import { useFinishOAuthFlowHandler } from '../../../lib/oauth/hooks';
import { MozServices } from '../../../lib/types';
import { QueryParams } from '../../..';
import { queryParamsToMetricsContext } from '../../../lib/metrics';
import OAuthDataError from '../../../components/OAuthDataError';

const SigninUnblockContainer = ({
  integration,
  flowQueryParams,
}: {
  integration: Integration;
  flowQueryParams: QueryParams;
} & RouteComponentProps) => {
  const authClient = useAuthClient();
  const ftlMsgResolver = useFtlMsgResolver();

  const location = useLocation() as ReturnType<typeof useLocation> & {
    state: SigninUnblockLocationState;
  };
  const { email, authPW, hasLinkedAccount, hasPassword } = location.state || {};

  const wantsTwoStepAuthentication =
    isOAuthIntegration(integration) && integration.wantsTwoStepAuthentication();

  const { finishOAuthFlowHandler, oAuthDataError } = useFinishOAuthFlowHandler(
    authClient,
    integration
  );

  const [beginSignin] = useMutation<BeginSigninResponse>(BEGIN_SIGNIN_MUTATION);

  const signinWithUnblockCode: BeginSigninWithUnblockCodeHandler = async (
    unblockCode: string
  ) => {
    const service = integration.getService();
    const options = {
      verificationMethod: VerificationMethods.EMAIL_OTP,
      keys: integration.wantsKeys(),
      ...(service !== MozServices.Default && { service }),
      unblockCode,
      metricsContext: queryParamsToMetricsContext(
        flowQueryParams as unknown as Record<string, string>
      ),
    };

    try {
      return await beginSignin({
        variables: {
          input: {
            email,
            authPW,
            options,
          },
        },
      });
    } catch (error) {
      return getHandledError(error);
    }
  };

  const resendUnblockCodeHandler: ResendUnblockCodeHandler = async () => {
    try {
      await authClient.sendUnblockCode(email, {
        metricsContext: queryParamsToMetricsContext(
          flowQueryParams as unknown as Record<string, string>
        ),
      });
      return { success: true };
    } catch (error) {
      const localizedErrorMessage = getLocalizedErrorMessage(
        ftlMsgResolver,
        error
      );
      return { success: false, localizedErrorMessage };
    }
  };

  if (oAuthDataError) {
    return <OAuthDataError error={oAuthDataError} />;
  }

  if (!email || !authPW) {
    hardNavigate('/', {}, true);
    return <LoadingSpinner fullScreen />;
  }
  return (
    <SigninUnblock
      {...{
        integration,
        email,
        hasLinkedAccount,
        hasPassword,
        signinWithUnblockCode,
        resendUnblockCodeHandler,
        wantsTwoStepAuthentication,
        finishOAuthFlowHandler,
      }}
    />
  );
};

export default SigninUnblockContainer;

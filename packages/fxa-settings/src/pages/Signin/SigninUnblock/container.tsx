/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useMutation } from '@apollo/client';
import { RouteComponentProps, useLocation } from '@reach/router';

import { getCredentials } from 'fxa-auth-client/browser';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';

import VerificationMethods from '../../../constants/verification-methods';
import { getLocalizedErrorMessage } from '../../../lib/auth-errors/auth-errors';
import {
  isOAuthIntegration,
  useAuthClient,
  useFtlMsgResolver,
} from '../../../models';

// using default signin handlers
import { BEGIN_SIGNIN_MUTATION } from '../gql';
import { BeginSigninResponse, SigninContainerIntegration } from '../interfaces';

import SigninUnblock from '.';
import {
  BeginSigninWithUnblockCodeHandler,
  ResendUnblockCodeHandler,
  SigninUnblockLocationState,
} from './interfaces';
import { handleGQLError } from '../utils';
import { hardNavigateToContentServer } from 'fxa-react/lib/utils';

const SigninUnblockContainer = ({
  integration,
}: { integration: SigninContainerIntegration } & RouteComponentProps) => {
  const authClient = useAuthClient();
  const ftlMsgResolver = useFtlMsgResolver();

  const location = useLocation() as ReturnType<typeof useLocation> & {
    state: SigninUnblockLocationState;
  };
  const { email, hasLinkedAccount, hasPassword, password } =
    location.state || {};

  const wantsTwoStepAuthentication =
    isOAuthIntegration(integration) && integration.wantsTwoStepAuthentication();

  const [beginSignin] = useMutation<BeginSigninResponse>(BEGIN_SIGNIN_MUTATION);

  const signinWithUnblockCode: BeginSigninWithUnblockCodeHandler = async (
    unblockCode: string
  ) => {
    // TODO in FXA-6518 oauth ticket
    // const service = integration.getService();
    const options = {
      verificationMethod: VerificationMethods.EMAIL_OTP,
      unblockCode,
    };
    // TODO in FXA-6518 oauth ticket
    //   // keys must be true to receive keyFetchToken for oAuth and syncDesktop
    //   keys: isOAuth || isSyncDesktopV3,
    //   service: service !== MozServices.Default ? service : undefined,
    // };
    try {
      const { authPW } = await getCredentials(email, password);
      const { data } = await beginSignin({
        variables: {
          input: {
            email,
            authPW,
            options,
          },
        },
      });
      return { data };
    } catch (error) {
      // TODO consider additional error handling - any non-gql errors will return an unexpected error
      return handleGQLError(error);
    }
  };

  const resendUnblockCodeHandler: ResendUnblockCodeHandler = async () => {
    try {
      await authClient.sendUnblockCode(email);
      return { success: true };
    } catch (error) {
      const localizedErrorMessage = getLocalizedErrorMessage(
        ftlMsgResolver,
        error
      );
      return { success: false, localizedErrorMessage };
    }
  };

  if (!email || !password) {
    hardNavigateToContentServer('/');
    return <LoadingSpinner fullScreen />;
  }
  return (
    <SigninUnblock
      {...{
        email,
        hasLinkedAccount,
        hasPassword,
        signinWithUnblockCode,
        resendUnblockCodeHandler,
        wantsTwoStepAuthentication,
      }}
    />
  );
};

export default SigninUnblockContainer;

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps, useLocation } from '@reach/router';
import { useNavigateWithQuery } from '../../lib/hooks/useNavigateWithQuery';
import { useAuthClient, useConfig } from '../../models';
import { Signup } from '.';
import { useValidatedQueryParams } from '../../lib/hooks/useValidate';
import { SignupQueryParams } from '../../models/pages/signup';
import { useMutation } from '@apollo/client';
import {
  BeginSignUpOptions,
  BeginSignupHandler,
  BeginSignupResponse,
  SignupIntegration,
} from './interfaces';
import { BEGIN_SIGNUP_MUTATION } from './gql';
import { useCallback, useEffect } from 'react';
import {
  getCredentials,
  getCredentialsV2,
  getKeysV2,
} from 'fxa-auth-client/lib/crypto';
import { LoadingSpinner } from 'fxa-react/components/LoadingSpinner';
import { createSaltV2 } from 'fxa-auth-client/lib/salt';
import { KeyStretchExperiment } from '../../models/experiments/key-stretch-experiment';
import { handleGQLError } from './utils';
import VerificationMethods from '../../constants/verification-methods';
import { queryParamsToMetricsContext } from '../../lib/metrics';
import { QueryParams } from '../..';
import { isFirefoxService } from '../../models/integrations/utils';
import useSyncEngines from '../../lib/hooks/useSyncEngines';

/*
 * In content-server, the `email` param is optional. If it's provided, we
 * check against it to see if the account exists and if it does, we redirect
 * users to `/signin`.
 *
 * In the React version, we're temporarily always passing the `email` param over
 * from the Backbone index page until the index page is converted over, in which case
 * we can pass the param with router state. Since we already perform this account exists
 * check on the Backbone index page, which is rate limited since it doesn't require a
 * session token, we also temporarily pass `emailStatusChecked=true` to signal not to perform
 * the check again. If this param is not passed and `email` is, we perform the check and
 * redirect existing user emails to `/signin` to match content-server functionality.
 *
 * If the account exists when signup is attempted, the user will be shown an "Account
 * already exists" error message. In content-server, we attempt to redirect users that are
 * on `/signup` with an account that already exists to where they need to go (Settings or
 * RP redirect) if for example, a user begins signup in one tab and then begins and
 * completes it in another tab. The "Account already exists" error message is only shown
 * when we can't automatically redirect, e.g. if they sign up on another browser or device.
 * If we want to mimic this functionality we can once index is converted.
 */

type LocationState = {
  emailStatusChecked?: boolean;
  email?: string;
};

const SignupContainer = ({
  integration,
  flowQueryParams,
}: {
  integration: SignupIntegration;
  flowQueryParams: QueryParams;
} & RouteComponentProps) => {
  const authClient = useAuthClient();
  const keyStretchExp = useValidatedQueryParams(KeyStretchExperiment);
  const navigateWithQuery = useNavigateWithQuery();
  const config = useConfig();
  const location = useLocation() as ReturnType<typeof useLocation> & {
    state: LocationState;
  };

  const { queryParamModel, validationError } =
    useValidatedQueryParams(SignupQueryParams);
  // emailStatusChecked is passed as a query param when coming from Backbone
  // email-first, but location state when coming from React email-first.
  // We can remove the query param bits once we're confidently at 100% roll out
  // for React.
  // emailStatusChecked can also be passed from React Signin when users hit /signin
  // with an email query param that we already determined doesn't exist.
  const emailStatusChecked =
    queryParamModel.emailStatusChecked || location.state?.emailStatusChecked;
  const email = queryParamModel.email || location.state?.email;

  const wantsKeys = integration.wantsKeys();

  // TODO: in PostVerify/SetPassword we call this and handle web channel messaging
  // in the container component, but here we handle web channel messaging in the
  // presentation component and we should be consistent. Calling this here allows for
  // some easier mocking, especially until we can upgrade to Storybook 8.
  const useSyncEnginesResult = useSyncEngines(integration);

  useEffect(() => {
    (async () => {
      if (!validationError && !emailStatusChecked) {
        const { exists, hasLinkedAccount, hasPassword } =
          await authClient.accountStatusByEmail(queryParamModel.email, {
            thirdPartyAuthStatus: true,
          });
        if (exists) {
          const signInPath = location.pathname.startsWith('/oauth')
            ? '/oauth/signin'
            : '/signin';
          navigateWithQuery(signInPath, {
            replace: true,
            state: {
              email,
              hasLinkedAccount,
              hasPassword,
            },
          });
        }
      }
    })();
  });

  const [beginSignup] = useMutation<BeginSignupResponse>(BEGIN_SIGNUP_MUTATION);

  const beginSignupHandler: BeginSignupHandler = useCallback(
    async (email, password) => {
      const service = integration.getService();
      const clientId = integration.getClientId();

      const options: BeginSignUpOptions = {
        verificationMethod: VerificationMethods.EMAIL_OTP,
        keys: wantsKeys,
        // See oauth_client_info in the auth-server for details on service/clientId
        // Sending up the clientId when the user is not signing in to the browser
        // is used to show the correct service name in emails
        ...(isFirefoxService(service) ? { service } : { service: clientId }),
        metricsContext: queryParamsToMetricsContext(
          flowQueryParams as unknown as Record<string, string>
        ),
      };
      try {
        const credentialsV1 = await getCredentials(email, password);

        // If enabled, add in V2 key stretching support
        let credentialsV2 = undefined;
        let passwordV2 = undefined;
        if (keyStretchExp.queryParamModel.isV2(config)) {
          credentialsV2 = await getCredentialsV2({
            password,
            clientSalt: await createSaltV2(),
          });
          const { wrapKb, wrapKbVersion2 } = await getKeysV2({
            v1: credentialsV1,
            v2: credentialsV2,
          });

          passwordV2 = {
            wrapKb,
            wrapKbVersion2,
            authPWVersion2: credentialsV2.authPW,
            clientSalt: credentialsV2.clientSalt,
          };
        }

        const authPW = credentialsV1.authPW;
        const input =
          passwordV2 != null
            ? {
                email,
                authPW,
                passwordV2,
                options,
              }
            : {
                email,
                authPW,
                options,
              };
        const { data } = await beginSignup({
          variables: {
            input,
          },
        });

        if (data) {
          return {
            data: {
              ...data,
              ...(wantsKeys && {
                unwrapBKey: credentialsV2
                  ? credentialsV2.unwrapBKey
                  : credentialsV1.unwrapBKey,
              }),
            },
          };
        } else return { data: undefined };
      } catch (error) {
        // TODO tweak this if we ever use auth-client here, any
        // non-gql errors will return an unexpected error
        return handleGQLError(error);
      }
    },
    [
      integration,
      wantsKeys,
      flowQueryParams,
      keyStretchExp.queryParamModel,
      config,
      beginSignup,
    ]
  );

  // TODO: probably a better way to read this?
  if (window.document.cookie.indexOf('tooyoung') > -1) {
    navigateWithQuery('/cannot_create_account');
  }

  if (validationError || !email) {
    navigateWithQuery('/');
    return <LoadingSpinner fullScreen />;
  }

  return (
    <Signup
      {...{
        integration,
        email,
        beginSignupHandler,
        useSyncEnginesResult,
      }}
    />
  );
};

export default SignupContainer;

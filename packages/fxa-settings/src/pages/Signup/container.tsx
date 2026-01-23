/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps, useLocation } from '@reach/router';
import { useNavigateWithQuery } from '../../lib/hooks/useNavigateWithQuery';
import { useAuthClient, useConfig } from '../../models';
import { Signup } from '.';
import { useValidatedQueryParams } from '../../lib/hooks/useValidate';
import { SignupQueryParams } from '../../models/pages/signup';
import { BeginSignupHandler, SignupIntegration } from './interfaces';
import { useCallback, useEffect } from 'react';
import {
  getCredentials,
  getCredentialsV2,
  getKeysV2,
} from 'fxa-auth-client/lib/crypto';
import { createSaltV2 } from 'fxa-auth-client/lib/salt';
import { SignUpOptions } from 'fxa-auth-client/lib/client';
import { KeyStretchExperiment } from '../../models/experiments/key-stretch-experiment';
import { handleAuthClientError } from './utils';
import VerificationMethods from '../../constants/verification-methods';
import { queryParamsToMetricsContext } from '../../lib/metrics';
import { QueryParams } from '../..';
import { isFirefoxService } from '../../models/integrations/utils';
import { UseFxAStatusResult } from '../../lib/hooks/useFxAStatus';
import { isMobileDevice } from '../../lib/utilities';
import AppLayout from '../../components/AppLayout';

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
  useFxAStatusResult,
  setCurrentSplitLayout,
}: {
  integration: SignupIntegration;
  flowQueryParams: QueryParams;
  useFxAStatusResult: UseFxAStatusResult;
  setCurrentSplitLayout?: (value: boolean) => void;
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

  useEffect(() => {
    (async () => {
      if (!validationError && !emailStatusChecked) {
        const { exists, hasLinkedAccount, hasPassword, passwordlessSupported } =
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
        } else if (passwordlessSupported && !wantsKeys) {
          // New account can use passwordless signup (non-Sync RPs only)
          navigateWithQuery('/signin_passwordless_code', {
            replace: true,
            state: {
              email,
              service: integration.getService(),
              isSignup: true,
            },
          });
        }
      }
    })();
  });

  const beginSignupHandler: BeginSignupHandler = useCallback(
    async (email, password) => {
      const service = integration.getService();
      const clientId = integration.getClientId();

      const options: SignUpOptions = {
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

        let credentialsV2 = undefined;
        let v2Payload: {
          wrapKb: string;
          authPWVersion2: string;
          wrapKbVersion2: string;
          clientSalt: string;
        } | {} = {};

        if (keyStretchExp.queryParamModel.isV2(config)) {
          credentialsV2 = await getCredentialsV2({
            password,
            clientSalt: createSaltV2(),
          });
          const { wrapKb, wrapKbVersion2 } = await getKeysV2({
            v1: credentialsV1,
            v2: credentialsV2,
          });

          v2Payload = {
            wrapKb,
            wrapKbVersion2,
            authPWVersion2: credentialsV2.authPW,
            clientSalt: credentialsV2.clientSalt,
          };
        }

        const result = await authClient.signUpWithAuthPW(
          email,
          credentialsV1.authPW,
          v2Payload,
          options
        );

        return {
          data: {
            signUp: {
              uid: result.uid,
              sessionToken: result.sessionToken,
              authAt: result.authAt,
              keyFetchToken: result.keyFetchToken,
            },
            ...(wantsKeys && {
              unwrapBKey: credentialsV2
                ? credentialsV2.unwrapBKey
                : credentialsV1.unwrapBKey,
            }),
          },
        };
      } catch (error) {
        return handleAuthClientError(error);
      }
    },
    [authClient, integration, wantsKeys, flowQueryParams, keyStretchExp.queryParamModel, config]
  );

  const cmsInfo = integration.getCmsInfo();
  const splitLayout = cmsInfo?.SignupSetPasswordPage?.splitLayout;

  if (validationError || !email) {
    navigateWithQuery('/');
    return (
      <AppLayout
        {...{ cmsInfo, loading: true, splitLayout, setCurrentSplitLayout }}
      />
    );
  }

  const deeplink = queryParamModel.deeplink;
  const isMobile = isMobileDevice();

  return (
    <Signup
      {...{
        integration,
        email,
        beginSignupHandler,
        useFxAStatusResult,
        deeplink,
        flowQueryParams,
        isMobile,
        setCurrentSplitLayout,
      }}
    />
  );
};

export default SignupContainer;

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps, useLocation, useNavigate } from '@reach/router';
import {
  Integration,
  isOAuthIntegration,
  useAuthClient,
  useFtlMsgResolver,
} from '../../models';
import Signup from '.';
import { useValidatedQueryParams } from '../../lib/hooks/useValidate';
import { SignupQueryParams } from '../../models/pages/signup';
import { hardNavigateToContentServer } from 'fxa-react/lib/utils';
import { useMutation } from '@apollo/client';
import { BeginSignupHandler, BeginSignupResponse } from './interfaces';
import { BEGIN_SIGNUP_MUTATION } from './gql';
import { useCallback, useEffect, useState } from 'react';
import { getCredentials } from 'fxa-auth-client/lib/crypto';
import { getLocalizedErrorMessage } from '../../lib/auth-errors/auth-errors';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';

/*
 * In content-server, the `email` param is optional. If it's provided, we
 * check against it to see if the account exists and if it does, we redirect
 * users to `/signin`.
 *
 * In the React version, we're temporarily always passing the `email` param over
 * from the Backbone index page until the index page is converted over, in which case
 * we can pass the param with router state. Since we already perform this account exists
 * check on the Backbone index page, which is rate limited since it doesn't require a
 * session token, we also temporarily pass `emailFromContent=true` to signal not to perform
 * the check again. If this param is not passed and `email` is, we perform the check and
 * redirect existing user emails to `/signin` to match content-server functionality.
 *
 * If the account exists when signup is attempted, the user will be shown an "Account
 * already exists" error message. In content-server, we attempt to redirect users that are
 * on `/signup` with an account that already exists to where they need to go (Settings or
 * RP redirect) if for example, a user begins signup in one tab and then begins and
 * completes it in another tab. The "Account already exists" error message is only shown
 * when we can't automatically redirect, e.g. if they sign up on another browser or device.
 * If we want to mimic this functionality we can once index is converted. [TODO: file issue]
 */

const SignupContainer = ({
  integration,
}: {
  integration: Integration;
} & RouteComponentProps) => {
  const location = useLocation();
  const authClient = useAuthClient();
  const ftlMsgResolver = useFtlMsgResolver();
  const navigate = useNavigate();

  // TODO: Not sure why this 'exists' check can run more than once.
  // If you remove the deps from the array, it runs once.
  const [accountExistsCheck, setAccountExistsCheck] = useState(false);

  // TODO: this hook, once class-validator is merged
  const { queryParams } = useValidatedQueryParams(SignupQueryParams);
  useEffect(() => {
    // assume queryParams are valid due to queryParams.isValid check on first render
    (async () => {
      // Remove this once index is converted to React
      if (!queryParams.emailFromContent && !accountExistsCheck) {
        const { exists } = await authClient.accountStatusByEmail(
          queryParams.email
        );
        setAccountExistsCheck(true);
        if (exists) {
          hardNavigateToContentServer(`/signin?email=${queryParams.email}`);
        }
      }
    })();
  }, [authClient, location.search, queryParams, accountExistsCheck]);

  const [beginSignup] = useMutation<BeginSignupResponse>(BEGIN_SIGNUP_MUTATION);

  const beginSignupHandler: BeginSignupHandler = useCallback(
    async (email, password, options) => {
      options.verificationMethod = 'email-otp';
      options.keys = isOAuthIntegration(integration);
      try {
        const { authPW, unwrapBKey } = await getCredentials(email, password);
        const { data } = await beginSignup({
          variables: {
            input: {
              email,
              authPW,
              options,
            },
          },
        });
        return { data: { ...data, unwrapBKey } };
      } catch (error) {
        const localizedErrorMessage = getLocalizedErrorMessage(
          ftlMsgResolver,
          error
        );
        return localizedErrorMessage;
      }
    },
    [beginSignup, ftlMsgResolver, integration]
  );

  // TODO: probably a better way to read this?
  if (window.document.cookie.indexOf('tooyoung') > -1) {
    navigate('/cannot_create_account');
  }

  if (!queryParams.isValid()) {
    hardNavigateToContentServer('/');
    // return a spinner until nav is completed, else Signup errors since
    // it requires queryParams.email. We can probably improve this when
    // we implement the useValidate hook properly.
    return (
      <LoadingSpinner className="bg-grey-20 flex items-center flex-col justify-center h-screen select-none" />
    );
  }

  return <Signup {...{ integration, queryParams, beginSignupHandler }} />;
};

export default SignupContainer;

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect } from 'react';
import { Link, RouteComponentProps, useLocation } from '@reach/router';
import { FtlMsg, hardNavigate } from 'fxa-react/lib/utils';
import { useAuthClient } from '../../../models';
import { PushAuthImage } from '../../../components/images';
import CardHeader from '../../../components/CardHeader';
import { MozServices } from '../../../lib/types';
import AppLayout from '../../../components/AppLayout';

import { SigninIntegration, SigninLocationState } from '../interfaces';
import { handleNavigation } from '../utils';
import { FinishOAuthFlowHandler } from '../../../lib/oauth/hooks';

import { BeginSigninError } from '../../../lib/error-utils';

export type SigninPushCodeProps = {
  finishOAuthFlowHandler: FinishOAuthFlowHandler;
  integration: SigninIntegration;
  redirectTo?: string;
  signinState: SigninLocationState;
  serviceName?: MozServices;
};

export const viewName = 'signin-push-code';

export const SigninPushCode = ({
  finishOAuthFlowHandler,
  integration,
  redirectTo,
  signinState,
  serviceName,
}: SigninPushCodeProps & RouteComponentProps) => {
  console.log('HI');
  const location = useLocation();

  const {
    email,
    uid,
    sessionToken,
    verificationReason,
    keyFetchToken,
    unwrapBKey,
  } = signinState;

  console.log('signinState', signinState);
  const authClient = useAuthClient();

  useEffect(() => {
    const sendLoginPushNotification = async () => {
      await authClient.sendLoginPushRequest(
        signinState.sessionToken,
        signinState.sessionToken
      );
    };
    sendLoginPushNotification();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await authClient.sessionStatus(
          signinState.sessionToken
        );
        console.log('response', response);
        if (response.state === 'verified') {
          const navigationOptions = {
            email,
            signinData: {
              uid,
              sessionToken,
              verificationReason,
              verified: true,
              keyFetchToken,
            },
            unwrapBKey,
            integration,
            finishOAuthFlowHandler,
            queryParams: location.search,
            redirectTo,
          };
          await handleNavigation(navigationOptions);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    const intervalId = setInterval(fetchData, 2000); // Poll every 2 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  return (
    <AppLayout>
      <CardHeader
        headingWithDefaultServiceFtlId="signin-totp-code-heading-w-default-service-v3"
        headingWithCustomServiceFtlId="signin-totp-code-heading-w-custom-service-v3"
        headingText="Verify this login"
        {...{ serviceName }}
      />

      <div className="flex justify-center mx-auto">
        <PushAuthImage />
      </div>

      <FtlMsg id="signin-totp-code-instruction-v3">
        <p id="totp-code-instruction" className="my-5 text-sm">
          Please approve this login from your Firefox mobile browser.
        </p>
      </FtlMsg>

      <div className="mt-5 text-grey-500 text-xs inline-flex gap-1">
        <p>Did not receive a push notification?</p>
        <Link
          to={`/signin_token_code${location.search}`}
          state={signinState}
          className="link-blue"
        >
          Email code
        </Link>
      </div>
    </AppLayout>
  );
};

export default SigninPushCode;

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Link, RouteComponentProps, useLocation } from '@reach/router';
import { FtlMsg } from 'fxa-react/lib/utils';
import { useEffect } from 'react';
import AppLayout from '../../../components/AppLayout';
import CardHeader from '../../../components/CardHeader';
import { PushAuthImage } from '../../../components/images';

import { SigninPushCodeProps } from './interfaces';

export const viewName = 'signin-push-code';

const POLL_INTERVAL = 2000; // Poll every 2 seconds
const MAX_POLL_TIME = 300000; // 5 minutes

export const SigninPushCode = ({
  signinState,
  serviceName,
  sendLoginPushNotification,
  pollSessionStatus,
}: SigninPushCodeProps & RouteComponentProps) => {
  const location = useLocation();

  useEffect(() => {
    sendLoginPushNotification();

    const intervalId = setInterval(pollSessionStatus, POLL_INTERVAL);
    const timeoutId = setTimeout(
      () => clearInterval(intervalId),
      MAX_POLL_TIME
    );

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  });

  return (
    <AppLayout>
      <CardHeader
        headingWithDefaultServiceFtlId="signin-push-code-heading-w-default-service"
        headingWithCustomServiceFtlId="signin-push-code-heading-w-custom-service"
        headingText="Verify this login"
        {...{ serviceName }}
      />

      <div className="flex justify-center mx-auto">
        <PushAuthImage />
      </div>

      <FtlMsg id="signin-push-code-instruction">
        <p className="my-5 text-sm">
          Please check your other devices and approve this login from your
          Firefox browser.
        </p>
      </FtlMsg>

      <div className="mt-5 text-grey-500 text-xs inline-flex gap-1">
        <FtlMsg id="signin-push-code-did-not-recieve">
          <p>Didn’t receive the notification?</p>
        </FtlMsg>
        <FtlMsg id="signin-push-code-send-email-link">
          <Link
            to={`/signin_token_code${location.search}`}
            state={signinState}
            className="link-blue"
          >
            Email code
          </Link>
        </FtlMsg>
      </div>
    </AppLayout>
  );
};

export default SigninPushCode;

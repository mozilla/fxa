/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { useLocation } from '@reach/router';
import { FtlMsg } from 'fxa-react/lib/utils';
import CardHeader from '../CardHeader';
import AppLayout from '../AppLayout';
import { useAccount } from '../../models';
import Banner, { BannerType } from '../Banner';
import { FIREFOX_NOREPLY_EMAIL } from '../../constants';
import { ResendStatus } from '../../lib/types';

type LocationState = { email: string };

const displaySuccessBanner = () => {
  <Banner type={BannerType.success}>
    <FtlMsg
      id="link-expired-resent-link-success-message"
      vars={{ accountsEmail: FIREFOX_NOREPLY_EMAIL }}
    >
      {`Email resent. Add ${FIREFOX_NOREPLY_EMAIL} to your contacts to ensure a
      smooth delivery.`}
    </FtlMsg>
  </Banner>;
};

const displayErrorBanner = () => {
  <Banner type={BannerType.error}>
    <FtlMsg id="link-expired-resent-link-error-message">
      Something went wrong. A new link could not be sent.
    </FtlMsg>
  </Banner>;
};

export const ResetPasswordLinkExpired = () => {
  // TODO : Metric event(s) for expired link

  const account = useAccount();
  const location = useLocation() as ReturnType<typeof useLocation> & {
    state: LocationState;
  };
  const [resendStatus, setResendStatus] = useState<ResendStatus>(
    ResendStatus['not sent']
  );

  const resendResetPasswordLink = async () => {
    try {
      await account.resendResetPassword(location.state.email);
      setResendStatus(ResendStatus['sent']);
    } catch (e) {
      setResendStatus(ResendStatus['error']);
    }
  };

  return (
    <AppLayout>
      <CardHeader
        headingText="Reset password link expired"
        headingTextFtlId="reset-pwd-link-expired-header"
      />

      {resendStatus === ResendStatus['sent'] && displaySuccessBanner()}
      {resendStatus === ResendStatus['error'] && displayErrorBanner()}

      <FtlMsg id="reset-pwd-link-expired-message">
        <p className="mt-4 text-sm">
          The link you clicked to reset your password is expired.
        </p>
      </FtlMsg>
      {/* TODO Extract for reuse into ButtonResendResetPasswordLink */}
      <FtlMsg id="resend-link">
        <button onClick={resendResetPasswordLink} className="link-blue mt-4">
          Receive new link
        </button>
      </FtlMsg>
    </AppLayout>
  );
};

export const SigninLinkExpired = () => {
  // TODO : Metric event(s) for expired link

  // const account = useAccount();
  // const location = useLocation() as ReturnType<typeof useLocation> & {
  //   state: LocationState;
  // };
  const [resendStatus, setResendStatus] = useState<ResendStatus>(
    ResendStatus['not sent']
  );

  const resendSigninLink = () => {
    try {
      // TODO hook up functionality to resend a new signin confirmation link
      // method below does not exist and needs to be mapped to equivalent function in content-server
      // await account.resendSigninConfirmationLink(location.state.email);
      setResendStatus(ResendStatus['sent']);
    } catch (e) {
      setResendStatus(ResendStatus['error']);
    }
  };

  return (
    <AppLayout>
      <CardHeader
        headingText="Confirmation link expired"
        headingTextFtlId="signin-link-expired-header"
      />

      {resendStatus === ResendStatus['sent'] && displaySuccessBanner()}
      {resendStatus === ResendStatus['error'] && displayErrorBanner()}

      <FtlMsg id="signin-link-expired-message">
        <p className="mt-4 text-sm">
          The link you clicked to confirm your email is expired.
        </p>
      </FtlMsg>
      <FtlMsg id="resend-link">
        <button onClick={resendSigninLink} className="link-blue mt-4">
          Receive new link
        </button>
      </FtlMsg>
    </AppLayout>
  );
};

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { ReactElement, useEffect, useState } from 'react';
import { Link, RouteComponentProps } from '@reach/router';
import { RemoteMetadata } from '../../../lib/types';
import { BannerType } from '../../../components/Banner';
import AppLayout from '../../../components/AppLayout';
import DeviceInfoBlock from '../../../components/DeviceInfoBlock';
import { useAuthClient } from '../../../models';
import ProductPromo from '../../../components/Settings/ProductPromo';

type SigninPushCodeConfirmProps = {
  authDeviceInfo: RemoteMetadata;
  email: string;
};

const SigninPushCodeConfirm = ({
  authDeviceInfo,
  email,
}: SigninPushCodeConfirmProps & RouteComponentProps) => {
  const authClient = useAuthClient();
  const query = new URLSearchParams(window.location.search);

  const [sessionVerified, setSessionVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Function to handle the session verification process
  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await authClient.verifyLoginPushRequest(
        query.get('email')!,
        query.get('uid')!,
        query.get('tokenVerificationId')!,
        query.get('code')!
      );
      setSessionVerified(true);
    } catch (error) {
      console.error('Failed to verify session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      {!sessionVerified ? (
        <>
          <h1 className="card-header">Confirm Your Login</h1>
          <p className="my-5 text-sm">
            We detected a login attempt from the following device. If this was
            you, please approve the login.
          </p>
          <DeviceInfoBlock remoteMetadata={authDeviceInfo} />
          <div className="flex flex-col justify-center mt-6">
            <button
              className="cta-primary cta-xl w-full"
              onClick={handleSubmit}
            >
              {isLoading ? 'Verifying...' : 'Approve Login'}
            </button>

            <Link to="/report_signin" className="link-grey mt-4 text-sm">
              This wasn't me
            </Link>
          </div>
        </>
      ) : (
        <>
          <div className="text-center mt-4">
            <p className="my-5 text-sm">
              Your login has been approved. Please close this window.
            </p>
          </div>
        </>
      )}
    </AppLayout>
  );
};

export default SigninPushCodeConfirm;

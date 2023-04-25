/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect } from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import { RouteComponentProps, useNavigate } from '@reach/router';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import AppLayout from '../../../components/AppLayout';
import Storage from '../../../lib/storage';

const ThirdPartyAuthCallback = (_: RouteComponentProps) => {
  const navigate = useNavigate();

  function handleOauthResponse() {
    try {
      // To finish the oauth flow, we will need to stash away the response from
      // 3rd party auth provider (contains state and code) and redirect back to the original FxA login page.
      const searchParams = new URLSearchParams(window.location.search);
      const redirectUrl = decodeURIComponent(searchParams.get('state') || '');
      const url = new URL(redirectUrl);

      if (url.origin === window.location.origin) {
        Storage.factory('localStorage', window).set('fxa_third_party_params', searchParams);

        navigate(redirectUrl, { replace: true });
      }
    } catch (e) {
      // noop. navigate to home below.
    }

    navigate('/', { replace: true });
  }

  useEffect(() => {
    handleOauthResponse();
  }, []);

  return (
    <AppLayout>
      <div className="flex flex-col">
        <FtlMsg id="third-party-auth-callback-message">
          Please wait, you are being redirected to the authorized application.
        </FtlMsg>
        <LoadingSpinner className="flex items-center flex-col justify-center mt-4 select-none" />
      </div>
    </AppLayout>
  );
};

export default ThirdPartyAuthCallback;

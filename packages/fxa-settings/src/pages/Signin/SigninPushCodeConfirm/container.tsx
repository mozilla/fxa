/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { RouteComponentProps } from '@reach/router';
import { useAuthClient } from '../../../models';
import SigninPushCodeConfirm from './index';
import { useValidatedQueryParams } from '../../../lib/hooks/useValidate';
import { PushSigninQueryParams } from '../../../models/pages/signin/push-signin-query-params';
import { FtlMsg } from '../../../../../fxa-react/lib/utils';
import { sessionToken } from '../../../lib/cache';

export const SigninPushCodeConfirmContainer = (props: RouteComponentProps) => {
  const authClient = useAuthClient();
  const { queryParamModel, validationError } = useValidatedQueryParams(
    PushSigninQueryParams
  );
  const { tokenVerificationId, code, remoteMetaData } = queryParamModel;
  const remoteMetaDataParsed = JSON.parse(decodeURIComponent(remoteMetaData));
  const [sessionVerified, setSessionVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (validationError) {
    return (
      <div className="text-center mt-4">
        <FtlMsg id="signin-push-code-confirm-link-error">
          <p className="my-5 text-sm">Link is damaged. Please try again.</p>
        </FtlMsg>
      </div>
    );
  }

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await authClient.verifyLoginPushRequest(
        sessionToken()!,
        tokenVerificationId,
        code
      );
      setSessionVerified(true);
    } catch (error) {
      setErrorMessage('Error verifying login push request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SigninPushCodeConfirm
      {...{
        authDeviceInfo: remoteMetaDataParsed,
        handleSubmit,
        sessionVerified,
        isLoading,
        errorMessage,
      }}
    />
  );
};

export default SigninPushCodeConfirmContainer;

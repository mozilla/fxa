/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from '@reach/router';
import { hardNavigate } from 'fxa-react/lib/utils';
import { useValidatedQueryParams } from '../../../lib/hooks/useValidate';
import { CompleteSigninQueryParams } from '../../../models/pages/signin';
import { SigninLinkDamaged } from '../../../components/LinkDamaged';
import { useAuthClient, useFtlMsgResolver } from '../../../models';
import {
  AuthUiErrorNos,
  AuthUiErrors,
} from '../../../lib/auth-errors/auth-errors';
import { LinkExpired } from '../../../components/LinkExpired';
import CompleteSignin from '.';
import { getLocalizedErrorMessage } from '../../../lib/error-utils';

export const viewName = 'complete-signin';

const CompleteSigninContainer = (_: RouteComponentProps) => {
  // TODO in FXA-9132 - Add metrics event
  // Backbone had 'verification.clicked' view event

  const { queryParamModel, validationError } = useValidatedQueryParams(
    CompleteSigninQueryParams
  );

  const authClient = useAuthClient();
  const ftlMsgResolver = useFtlMsgResolver();

  const [errorMessage, setErrorMessage] = useState<string>();
  const [linkExpired, setLinkExpired] = useState(false);

  useEffect(() => {
    (async () => {
      if (!validationError) {
        const { uid, code } = queryParamModel;

        try {
          await authClient.verifyCode(uid, code);
          reportSuccessAndNavigate();
        } catch (err) {
          // if we have a localized error message
          if (err.errno && AuthUiErrorNos[err.errno]) {
            // if the param format is valid, this error likely occurs because the code expired
            // or has already been used
            if (
              err.errno === AuthUiErrors.INVALID_VERIFICATION_CODE.errno ||
              err.message.includes('Invalid parameter')
            ) {
              setLinkExpired(true);
            } else {
              const localizedErrorMessage = getLocalizedErrorMessage(
                ftlMsgResolver,
                err
              );
              setErrorMessage(localizedErrorMessage);
            }
          } else {
            const localizedErrorMessage = getLocalizedErrorMessage(
              ftlMsgResolver,
              AuthUiErrors.UNEXPECTED_ERROR
            );
            setErrorMessage(localizedErrorMessage);
          }
        }
      }
    })();
  });

  const reportSuccessAndNavigate = () => {
    // TODO in FXA-9132 - Add metrics event
    // Backbone had 'verification.success' and 'signin.success';

    hardNavigate('/connect_another_device', {}, true);
  };

  if (validationError) {
    return <SigninLinkDamaged />;
  }
  if (linkExpired) {
    return (
      // do not include option to resend link for signin
      // this can only be triggered by going through the sign in flow again
      <LinkExpired
        headingText="Confirmation link expired"
        headingTextFtlId="signin-link-expired-header"
        messageText="The link you clicked has expired or has already been used."
        messageFtlId="signin-link-expired-message-2"
      />
    );
  }
  return <CompleteSignin {...{ errorMessage }} />;
};

export default CompleteSigninContainer;

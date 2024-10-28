/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { RouteComponentProps } from '@reach/router';
import { FtlMsg } from 'fxa-react/lib/utils';
import { useFtlMsgResolver } from '../../../models';
import { usePageViewEvent } from '../../../lib/metrics';
// import { useAlertBar } from '../../models';
import { TwoFactorAuthImage } from '../../../components/images';
import CardHeader from '../../../components/CardHeader';
import FormVerifyCode, {
  FormAttributes,
} from '../../../components/FormVerifyCode';
import { MozServices } from '../../../lib/types';
import { REACT_ENTRYPOINT } from '../../../constants';

// --serviceName-- is the relying party

export type AuthTotpProps = {
  email: string;
  serviceName?: MozServices;
};

export const viewName = 'pair.auth.totp';

const AuthTotp = ({
  email,
  serviceName,
}: AuthTotpProps & RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);

  const [codeErrorMessage, setCodeErrorMessage] = useState<string>('');
  // const ftlMsgResolver = useFtlMsgResolver();

  const ftlMsgResolver = useFtlMsgResolver();
  const localizedCustomCodeRequiredMessage = ftlMsgResolver.getMsg(
    'auth-totp-code-required-error',
    'Authentication code required'
  );

  // These ftlids match those in `SigninTotpCode`
  const formAttributes: FormAttributes = {
    inputFtlId: 'auth-totp-input-label',
    inputLabelText: 'Enter 6-digit code',
    pattern: '[0-9]{6}',
    maxLength: 6,
    submitButtonFtlId: 'auth-totp-confirm-button',
    submitButtonText: 'Confirm',
  };

  const onSubmit = async () => {
    try {
      // Check authentication code
      // logViewEvent('flow', `${viewName}.submit`, ENTRYPOINT_REACT);
      // redirect to /pair/auth/allow
    } catch (e) {
      // TODO: error handling, error message confirmation
      // this should use auth-errors and place the errors in a tooltip or banner
    }
  };

  return (
    // TODO: redirect to force_auth or signin if user has not initiated sign in
    <>
      <CardHeader
        headingWithDefaultServiceFtlId="auth-totp-heading-w-default-service"
        headingWithCustomServiceFtlId="auth-totp-heading-w-custom-service"
        headingText="Enter authentication code"
        {...{ serviceName }}
      />
      <main>
        <div className="flex justify-center mx-auto">
          <TwoFactorAuthImage className="w-3/5" />
        </div>

        <FtlMsg id="auth-totp-instruction">
          <p id="totp-code-instruction" className="my-5 text-sm">
            Open your authentication app and enter the authentication code it
            provides.
          </p>
        </FtlMsg>

        <FormVerifyCode
          {...{
            formAttributes,
            viewName,
            verifyCode: onSubmit,
            localizedCustomCodeRequiredMessage,
            codeErrorMessage,
            setCodeErrorMessage,
          }}
        />
      </main>
    </>
  );
};

export default AuthTotp;

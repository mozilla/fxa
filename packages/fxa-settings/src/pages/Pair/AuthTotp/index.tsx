/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { RouteComponentProps } from '@reach/router';
import { FtlMsg } from 'fxa-react/lib/utils';
// import { useFtlMsgResolver } from '../../../models/hooks';
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

  const [code, setCode] = useState<string>('');
  const [codeErrorMessage, setCodeErrorMessage] = useState<string>('');
  // const ftlMsgResolver = useFtlMsgResolver();

  // These ftlids match those in `SigninTotpCode`
  const formAttributes: FormAttributes = {
    inputFtlId: 'signin-totp-code-input-label-v2',
    inputLabelText: 'Enter 6-digit code',
    pattern: '[0-9]{6}',
    maxLength: 6,
    submitButtonFtlId: 'signin-totp-code-confirm-button',
    submitButtonText: 'Confirm',
  };

  const onSubmit = () => {
    if (!code) {
      // TODO: Add l10n for this string
      // Holding on l10n pending product decision
      // Current string vs "Security code required" vs other
      // See FXA-6422, and discussion on PR-14744
      setCodeErrorMessage('Two-step authentication code required');
    }
    try {
      // Check security code
      // logViewEvent('flow', `${viewName}.submit`, ENTRYPOINT_REACT);
      // redirect to /pair/auth/allow
    } catch (e) {
      // TODO: error handling, error message confirmation
      //
      // const errorAuthTotp = ftlMsgResolver.getMsg(
      //   'signin-totp-code-error-general',
      //   'Invalid confirmation code'
      // );
      // put the error into a <Banner /> element
    }
  };

  return (
    // TODO: redirect to force_auth or signin if user has not initiated sign in
    <>
      {/* Ftl ids match those in signin-totp-code because it uses those strings. */}
      <CardHeader
        headingWithDefaultServiceFtlId="signin-totp-code-heading-w-default-service"
        headingWithCustomServiceFtlId="signin-totp-code-heading-w-custom-service"
        headingText="Enter security code"
        {...{ serviceName }}
      />

      <main>
        <div className="flex justify-center mx-auto">
          <TwoFactorAuthImage className="w-3/5" />
        </div>

        <FtlMsg id="signin-totp-code-instruction">
          <p id="totp-code-instruction" className="my-5 text-sm">
            Open your authentication app and enter the security code it
            provides.
          </p>
        </FtlMsg>

        <FormVerifyCode
          {...{
            formAttributes,
            viewName,
            email,
            onSubmit,
            code,
            setCode,
            codeErrorMessage,
            setCodeErrorMessage,
          }}
        />
      </main>
    </>
  );
};

export default AuthTotp;

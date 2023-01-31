/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { Link, RouteComponentProps } from '@reach/router';
import { FtlMsg } from 'fxa-react/lib/utils';
// import { useFtlMsgResolver } from '../../../models/hooks';
import { usePageViewEvent } from '../../../lib/metrics';
// import { useAlertBar } from '../../models';
import { ReactComponent as TwoFactorImg } from './graphic_two_factor_auth.svg';
import CardHeader from '../../../components/CardHeader';
import FormVerifyCode, {
  FormAttributes,
} from '../../../components/FormVerifyCode';
import { MozServices } from '../../../lib/types';

// --serviceName-- is the relying party

export type SigninTotpCodeProps = { email: string, serviceName?: MozServices };

const SigninTotpCode = ({
  email,
  serviceName,
}: SigninTotpCodeProps & RouteComponentProps) => {
  const viewName = 'signin-totp-code';
  usePageViewEvent(viewName, {
    entrypoint_variation: 'react',
  });

  const [code, setCode] = useState<string>('');
  const [codeErrorMessage, setCodeErrorMessage] = useState<string>('');
  // const alertBar = useAlertBar();
  // const ftlMsgResolver = useFtlMsgResolver();

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
      // logViewEvent('flow', signin-totp-code.submit, {
      //   entrypoint_variation: 'react',
      //  });
      // Check if isForcePasswordChange
    } catch (e) {
      // TODO: error handling, error message confirmation
      //       - decide if alertBar or error div
      // const errorSigninTotpCode = ftlMsgResolver.getMsg(
      //   'signin-totp-code-error-general',
      //   'Invalid confirmation code'
      // );
      // alertBar.error(errorSigninTotpCode);
    }
  };

  return (
    // TODO: redirect to force_auth or signin if user has not initiated sign in
    <>
      <CardHeader
        headingWithDefaultServiceFtlId="signin-totp-code-heading-w-default-service"
        headingWithCustomServiceFtlId="signin-totp-code-heading-w-custom-service"
        headingText="Enter security code"
        {...{ serviceName }}
      />

      <main>
        <div className="flex justify-center mx-auto">
          <FtlMsg id="signin-totp-code-image-label">
            <TwoFactorImg
              className="w-3/5"
              role="img"
              aria-label="A device with a hidden 6-digit code."
            />
          </FtlMsg>
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

        <div className="mt-5 link-blue text-sm flex justify-between">
          <FtlMsg id="signin-totp-code-other-account-link">
            <Link to="/signin" className="text-start">
              Use a different account
            </Link>
          </FtlMsg>
          <FtlMsg id="signin-totp-code-recovery-code-link">
            <Link to="/signin_recovery_code" className="text-end">
              Trouble entering code?
            </Link>
          </FtlMsg>
        </div>
      </main>
    </>
  );
};

export default SigninTotpCode;

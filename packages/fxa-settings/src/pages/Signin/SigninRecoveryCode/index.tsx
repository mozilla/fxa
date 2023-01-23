/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { Link, RouteComponentProps } from '@reach/router';
import { FtlMsg } from 'fxa-react/lib/utils';
import { useFtlMsgResolver } from '../../../models/hooks';
import { usePageViewEvent } from '../../../lib/metrics';
// import { useAlertBar } from '../../models';
import { ReactComponent as RecoveryCodesImg } from './graphic_recovery_codes.svg';
import CardHeader from '../../../components/CardHeader';
import LinkExternal from 'fxa-react/components/LinkExternal';
import FormVerifyCode, {
  FormAttributes,
} from '../../../components/FormVerifyCode';
import { MozServices } from '../../../lib/types';

export type SigninRecoveryCodeProps = {
  email: string;
  serviceName?: MozServices;
};

const SigninRecoveryCode = ({
  email,
  serviceName,
}: SigninRecoveryCodeProps & RouteComponentProps) => {
  const viewName = 'signin-recovery-code';
  usePageViewEvent(viewName, {
    entrypoint_variation: 'react',
  });

  const [code, setCode] = useState<string>('');
  const [codeErrorMessage, setCodeErrorMessage] = useState<string>('');
  // const alertBar = useAlertBar();
  const ftlMsgResolver = useFtlMsgResolver();

  const formAttributes: FormAttributes = {
    inputFtlId: 'signin-recovery-code-input-label',
    inputLabelText: 'Enter 10-digit backup authentication code',
    pattern: '[0-9]{10}',
    maxLength: 10,
    submitButtonFtlId: 'signin-recovery-code-confirm-button',
    submitButtonText: 'Confirm',
  };

  const onSubmit = () => {
    if (!code) {
      const codeRequiredError = ftlMsgResolver.getMsg(
        'signin-recovery-code-required-error',
        'Backup authentication code required'
      );
      setCodeErrorMessage(codeRequiredError);
    }
    try {
      // Check recovery code
      // Log success event
      // Check if isForcePasswordChange
    } catch (e) {
      // TODO: error handling, error message confirmation
      // const errorSigninRecoveryCode = ftlMsgResolver.getMsg(
      //   'signin-recovery-code-error-general',
      //   'Incorrect backup authentication code'
      // );
      // alertBar.error(errorSigninRecoveryCode);
    }
  };

  return (
    // TODO: redirect to force_auth or signin if user has not initiated sign in

    <>
      <CardHeader
        headingWithDefaultServiceFtlId="signin-recovery-code-heading-w-default-service"
        headingWithCustomServiceFtlId="signin-recovery-code-heading-w-custom-service"
        headingText="Enter backup authentication code"
        {...{ serviceName }}
      />

      <main>
        <div className="flex justify-center mx-auto">
          <FtlMsg id="signin-recovery-code-image-description">
            <RecoveryCodesImg
              className="w-3/5"
              role="img"
              aria-label="Document that contains hidden text."
            />
          </FtlMsg>
        </div>

        <FtlMsg id="signin-recovery-code-instruction">
          <p className="m-5 text-sm">
            Please enter a backup authentication code that was provided to you
            during two step authentication setup.
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
          <FtlMsg id="signin-recovery-code-back-link">
            <Link to="/signin_totp_code">Back</Link>
          </FtlMsg>
          <FtlMsg id="signin-recovery-code-support-link">
            <LinkExternal href="https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication">
              Are you locked out?
            </LinkExternal>
          </FtlMsg>
        </div>
      </main>
    </>
  );
};

export default SigninRecoveryCode;

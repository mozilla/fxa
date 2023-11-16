/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useState } from 'react';
import { Link, RouteComponentProps } from '@reach/router';
import { FtlMsg } from 'fxa-react/lib/utils';
import { useFtlMsgResolver } from '../../../models';
import { usePageViewEvent } from '../../../lib/metrics';
// import { useAlertBar } from '../../models';
import { RecoveryCodesImage } from '../../../components/images';
import CardHeader from '../../../components/CardHeader';
import LinkExternal from 'fxa-react/components/LinkExternal';
import FormVerifyCode, {
  FormAttributes,
} from '../../../components/FormVerifyCode';
import { MozServices } from '../../../lib/types';
import { REACT_ENTRYPOINT } from '../../../constants';
import GleanMetrics from '../../../lib/glean';

export type SigninRecoveryCodeProps = {
  email: string;
  serviceName?: MozServices;
};

export const viewName = 'signin-recovery-code';

const SigninRecoveryCode = ({
  email,
  serviceName,
}: SigninRecoveryCodeProps & RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);
  useEffect(() => {
    GleanMetrics.loginBackupCode.view();
  }, []);

  const [codeErrorMessage, setCodeErrorMessage] = useState<string>('');
  const ftlMsgResolver = useFtlMsgResolver();
  const localizedCustomCodeRequiredMessage = ftlMsgResolver.getMsg(
    'signin-recovery-code-required-error',
    'Backup authentication code required'
  );

  const formAttributes: FormAttributes = {
    inputFtlId: 'signin-recovery-code-input-label',
    inputLabelText: 'Enter 10-digit backup authentication code',
    pattern: '[0-9]{10}',
    maxLength: 10,
    submitButtonFtlId: 'signin-recovery-code-confirm-button',
    submitButtonText: 'Confirm',
  };

  const onSubmit = async () => {
    try {
      GleanMetrics.loginBackupCode.submit();

      // Check recovery code
      // Log success event
      GleanMetrics.loginBackupCode.success();
      // The await of isDone is not entirely necessary when we are not
      // redirecting the user to an RP.  However at the time of implementation
      // for the Glean ping the redirect logic has not been implemented.
      await GleanMetrics.isDone();

      // Check if isForcePasswordChange
    } catch (e) {
      // TODO: error handling, error message confirmation
      // This will likely use auth-errors, and errors should be displayed in a tooltip or banner
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
          <RecoveryCodesImage className="w-3/5" />
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
            verifyCode: onSubmit,
            localizedCustomCodeRequiredMessage,
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

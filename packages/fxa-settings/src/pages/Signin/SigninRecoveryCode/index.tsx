/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { RouteComponentProps } from '@reach/router';
import InputText from '../../../components/InputText';
import { FtlMsg } from 'fxa-react/lib/utils';
import { useFtlMsgResolver } from '../../../models/hooks';
import { usePageViewEvent, logViewEvent } from '../../../lib/metrics';
// import { useAlertBar } from '../../models';
import { ReactComponent as RecoveryCodesImg } from './graphic_recovery_codes.svg';
import CardHeader from '../../../components/CardHeader';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { MozServices } from '../../../lib/types';

export type SigninRecoveryCodeProps = { serviceName?: MozServices };

type FormData = {
  recoveryCode: string;
};

const SigninRecoveryCode = ({
  serviceName,
}: SigninRecoveryCodeProps & RouteComponentProps) => {
  usePageViewEvent('signin-recovery-code', {
    entrypoint_variation: 'react',
  });

  const [recoveryCode, setRecoveryCode] = useState<string>('');
  const [recoveryCodeErrorMessage, setRecoveryCodeErrorMessage] =
    useState<string>('');
  const [isFocused, setIsFocused] = useState(false);
  // const alertBar = useAlertBar();
  const ftlMsgResolver = useFtlMsgResolver();

  const onFocusMetricsEvent = 'signin-recovery-code.engage';

  const onFocus = () => {
    if (!isFocused && onFocusMetricsEvent) {
      logViewEvent('flow', onFocusMetricsEvent, {
        entrypoint_variation: 'react',
      });
      setIsFocused(true);
    }
  };

  const { handleSubmit } = useForm<FormData>({
    mode: 'onBlur',
    criteriaMode: 'all',
    defaultValues: {
      recoveryCode: '',
    },
  });

  const onSubmit = () => {
    if (!recoveryCode) {
      const codeRequiredError = ftlMsgResolver.getMsg(
        'signin-recovery-code-required-error',
        'Backup authentication code required'
      );
      setRecoveryCodeErrorMessage(codeRequiredError);
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

        <form
          noValidate
          className="flex flex-col gap-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          {/* Using `type="text" inputmode="numeric"` shows the numeric pad on mobile and strips out whitespace on desktop. */}
          <FtlMsg id="signin-recovery-code-input">
            <InputText
              type="text"
              inputMode="numeric"
              label="Enter 10-digit backup authentication code"
              onChange={(e) => {
                setRecoveryCode(e.target.value);
                // clear error tooltip if user types in the field
                if (recoveryCodeErrorMessage) {
                  setRecoveryCodeErrorMessage('');
                }
              }}
              onFocusCb={onFocusMetricsEvent ? onFocus : undefined}
              errorText={recoveryCodeErrorMessage}
              autoFocus
              pattern="\d{10}"
              className="text-start"
              anchorStart
              autoComplete="off"
              spellCheck={false}
              prefixDataTestId="signin-recovery-code"
              required
              tooltipPosition="bottom"
              maxLength={10}
            />
          </FtlMsg>

          <FtlMsg id="signin-recovery-code-confirm-button">
            <button
              type="submit"
              id="use-logged-in"
              className="cta-primary cta-xl"
            >
              Confirm
            </button>
          </FtlMsg>
        </form>
        <div className="mt-5 link-blue text-sm flex justify-between">
          <FtlMsg id="signin-recovery-code-back-link">
            <a href="/signin_totp_code">Back</a>
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

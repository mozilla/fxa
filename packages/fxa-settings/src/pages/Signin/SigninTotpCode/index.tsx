/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { RouteComponentProps } from '@reach/router';
import InputText from '../../../components/InputText';
import { FtlMsg } from 'fxa-react/lib/utils';
// import { useFtlMsgResolver } from '../../../models/hooks';
import { usePageViewEvent, logViewEvent } from '../../../lib/metrics';
// import { useAlertBar } from '../../models';
import { ReactComponent as TwoFactorImg } from './graphic_two_factor_auth.svg';
import CardHeader from '../../../components/CardHeader';
import { MozServices } from '../../../lib/types';

// --serviceName-- is the relying party

export type SigninTotpCodeProps = { serviceName?: MozServices };

type FormData = {
  confirmationCode: string;
};

const SigninTotpCode = ({
  serviceName,
}: SigninTotpCodeProps & RouteComponentProps) => {
  usePageViewEvent('signin-totp-code', {
    entrypoint_variation: 'react',
  });

  const [totpCodeValue, setTotpCodeValue] = useState<string>('');
  const [totpErrorMessage, setTotpErrorMessage] = useState<string>('');
  const [isFocused, setIsFocused] = useState(false);
  // const alertBar = useAlertBar();
  // const ftlMsgResolver = useFtlMsgResolver();

  const onFocusMetricsEvent = 'signin-totp-code.engage';

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
      confirmationCode: '',
    },
  });

  const onSubmit = () => {
    if (!totpCodeValue) {
      // TODO: Add l10n for this string
      // Holding on l10n pending product decision
      // Current string vs "Security code required" vs other
      // See FXA-6422, and discussion on PR-14744
      setTotpErrorMessage('Two-step authentication code required');
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

        <form
          noValidate
          className="flex flex-col gap-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          {/* Using `type="text" inputmode="numeric"` shows the numeric pad on mobile and strips out whitespace on desktop. */}
          <FtlMsg id="signin-totp-code-input-label">
            {/* TODO: standardize with input used for Settings/TwoStepAuthentication? */}
            <InputText
              type="text"
              inputMode="numeric"
              label="Enter 6-digit code"
              onChange={(e) => {
                setTotpCodeValue(e.target.value);
                // clear error tooltip if user types in the field
                if (totpErrorMessage) {
                  setTotpErrorMessage('');
                }
              }}
              onFocusCb={onFocusMetricsEvent ? onFocus : undefined}
              errorText={totpErrorMessage}
              autoFocus
              pattern="\d{6}"
              className="text-start"
              anchorStart
              autoComplete="off"
              spellCheck={false}
              prefixDataTestId="signin-totp-code"
              required
              tooltipPosition="bottom"
              maxLength={6}
            />
          </FtlMsg>

          <FtlMsg id="signin-totp-code-confirm-button">
            <button type="submit" className="cta-primary cta-xl">
              Confirm
            </button>
          </FtlMsg>
        </form>
        <div className="mt-5 link-blue text-sm flex justify-between">
          <FtlMsg id="signin-totp-code-other-account-link">
            <a href="/signin" className="text-start">
              Use a different account
            </a>
          </FtlMsg>
          <FtlMsg id="signin-totp-code-recovery-code-link">
            <a href="/signin_recovery_code" className="text-end">
              Trouble entering code?
            </a>
          </FtlMsg>
        </div>
      </main>
    </>
  );
};

export default SigninTotpCode;

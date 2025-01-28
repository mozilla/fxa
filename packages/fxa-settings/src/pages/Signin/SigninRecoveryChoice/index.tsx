/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import AppLayout from '../../../components/AppLayout';
import { HeadingPrimary } from '../../../components/HeadingPrimary';
import FormChoice, {
  CHOICES,
  FormChoiceData,
  FormChoiceOption,
} from '../../../components/FormChoice';
import { useFtlMsgResolver } from '../../../models';
import {
  BackupAuthenticationCodesImage,
  BackupRecoveryPhoneSmsImage,
} from '../../../components/images';
import ButtonBack from '../../../components/ButtonBack';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import Banner from '../../../components/Banner';
import { SigninLocationState } from '../interfaces';
import { getLocalizedErrorMessage } from '../../../lib/error-utils';
import {
  AuthUiError,
  AuthUiErrors,
} from '../../../lib/auth-errors/auth-errors';

export type SigninRecoveryChoiceProps = {
  handlePhoneChoice: () => Promise<AuthUiError | void>;
  lastFourPhoneDigits: string;
  numBackupCodes: number;
  signinState: SigninLocationState;
};

const SigninRecoveryChoice = ({
  handlePhoneChoice,
  lastFourPhoneDigits,
  numBackupCodes,
  signinState,
}: SigninRecoveryChoiceProps) => {
  const [errorBannerMessage, setErrorBannerMessage] = React.useState('');
  const [errorBannerDescription, setErrorBannerDescription] =
    React.useState('');

  const ftlMsgResolver = useFtlMsgResolver();
  const navigateWithQuery = useNavigateWithQuery();

  const generalSendCodeErrorHeading = ftlMsgResolver.getMsg(
    'signin-recovery-phone-send-code-error-heading',
    'There was a problem sending a code to your recovery phone'
  );

  const generalSendCodeErrorDescription = ftlMsgResolver.getMsg(
    'signin-recovery-phone-send-code-error-description',
    'Please try again later or use your backup authentication codes.'
  );

  const handlePhoneChoiceError = (error: AuthUiError) => {
    if (
      error === AuthUiErrors.BACKEND_SERVICE_FAILURE ||
      error === AuthUiErrors.SMS_SEND_RATE_LIMIT_EXCEEDED ||
      error === AuthUiErrors.UNEXPECTED_ERROR
    ) {
      setErrorBannerMessage(generalSendCodeErrorHeading);
      setErrorBannerDescription(generalSendCodeErrorDescription);
      return;
    }
    setErrorBannerMessage(getLocalizedErrorMessage(ftlMsgResolver, error));
  };

  const onSubmit = async ({ choice }: FormChoiceData) => {
    setErrorBannerMessage('');
    setErrorBannerDescription('');
    switch (choice) {
      case CHOICES.phone:
        const error = await handlePhoneChoice();
        if (error) {
          handlePhoneChoiceError(error);
          return;
        }
        navigateWithQuery('/signin_recovery_phone', {
          state: { signinState, lastFourPhoneDigits },
        });
        break;
      case CHOICES.code:
        navigateWithQuery('/signin_recovery_code', {
          state: { signinState, lastFourPhoneDigits },
        });
        break;
    }
  };

  const formChoices: FormChoiceOption[] = [
    {
      id: 'recovery-choice-phone',
      value: CHOICES.phone,
      image: <BackupRecoveryPhoneSmsImage />,
      localizedChoiceTitle: ftlMsgResolver.getMsg(
        'signin-recovery-method-phone',
        'Recovery phone'
      ),
      // This doesn't need localization
      localizedChoiceInfo: `••••••${lastFourPhoneDigits}`,
    },
    {
      id: 'recovery-choice-code',
      value: CHOICES.code,
      image: <BackupAuthenticationCodesImage />,
      localizedChoiceTitle: ftlMsgResolver.getMsg(
        'signin-recovery-method-code-v2',
        'Backup authentication codes'
      ),
      localizedChoiceInfo: ftlMsgResolver.getMsg(
        'signin-recovery-method-code-info',
        `${numBackupCodes} codes remaining`,
        { numberOfCodes: numBackupCodes }
      ),
    },
  ];

  return (
    <AppLayout>
      <div className="relative flex items-center mb-5">
        <ButtonBack />
        <FtlMsg id="signin-recovery-method-header">
          <HeadingPrimary marginClass="">Sign in</HeadingPrimary>
        </FtlMsg>
      </div>
      {errorBannerMessage && (
        <Banner
          type="error"
          content={{
            localizedHeading: errorBannerMessage,
            localizedDescription: errorBannerDescription,
          }}
        />
      )}

      <FormChoice {...{ legendEl, onSubmit, formChoices }} />
    </AppLayout>
  );
};
const legendEl = (
  <>
    <legend>
      <FtlMsg id="signin-recovery-method-subheader">
        <h2 className="card-header">Choose a recovery method</h2>
      </FtlMsg>
    </legend>
    <FtlMsg id="signin-recovery-method-details">
      <p className="pt-2 mb-8">
        Let’s make sure it’s you using your recovery methods.
      </p>
    </FtlMsg>
  </>
);

export default SigninRecoveryChoice;

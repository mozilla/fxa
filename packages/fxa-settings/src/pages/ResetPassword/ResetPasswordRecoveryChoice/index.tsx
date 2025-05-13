/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect } from 'react';
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
import Banner from '../../../components/Banner';
import {
  AuthUiError,
  AuthUiErrors,
} from '../../../lib/auth-errors/auth-errors';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import { CompleteResetPasswordLocationState } from '../CompleteResetPassword/interfaces';
import { getLocalizedErrorMessage } from '../../../lib/error-utils';
import GleanMetrics from '../../../lib/glean';

export type ResetPasswordRecoveryChoiceProps = {
  handlePhoneChoice: () => Promise<AuthUiError | void>;
  maskedPhoneNumber: string;
  lastFourPhoneDigits: string;
  numBackupCodes: number;
  completeResetPasswordLocationState: CompleteResetPasswordLocationState;
};

const ResetPasswordRecoveryChoice = ({
  handlePhoneChoice,
  maskedPhoneNumber,
  lastFourPhoneDigits,
  numBackupCodes,
  completeResetPasswordLocationState,
}: ResetPasswordRecoveryChoiceProps) => {
  const [errorBannerMessage, setErrorBannerMessage] = React.useState('');
  const [errorBannerDescription, setErrorBannerDescription] =
    React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const ftlMsgResolver = useFtlMsgResolver();
  const navigateWithQuery = useNavigateWithQuery();

  const generalSendCodeErrorHeading = ftlMsgResolver.getMsg(
    'password-reset-recovery-method-send-code-error-heading',
    'There was a problem sending a code to your recovery phone'
  );

  const generalSendCodeErrorDescription = ftlMsgResolver.getMsg(
    'password-reset-recovery-method-send-code-error-description',
    'Please try again later or use your backup authentication codes.'
  );

  useEffect(() => {
    GleanMetrics.passwordReset.backupChoiceView();
  }, []);

  const handlePhoneChoiceError = (error: AuthUiError) => {
    if (
      error === AuthUiErrors.BACKEND_SERVICE_FAILURE ||
      error === AuthUiErrors.SMS_SEND_RATE_LIMIT_EXCEEDED ||
      error === AuthUiErrors.FEATURE_NOT_ENABLED ||
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
    setIsSubmitting(true);

    GleanMetrics.passwordReset.backupChoiceSubmit({
      event: { reason: choice },
    });

    switch (choice) {
      case CHOICES.phone:
        const error = await handlePhoneChoice();
        if (error) {
          handlePhoneChoiceError(error);
          setIsSubmitting(false);
          return;
        }

        // /reset_password_recovery_phone to be implemented in FXA-11510
        navigateWithQuery('/reset_password_recovery_phone', {
          state: { ...completeResetPasswordLocationState, lastFourPhoneDigits },
        });
        break;
      case CHOICES.code:
        navigateWithQuery('/confirm_backup_code_reset_password', {
          state: completeResetPasswordLocationState,
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
        'password-reset-recovery-method-phone',
        'Recovery phone'
      ),
      // This doesn't need localization
      localizedChoiceInfo: maskedPhoneNumber,
    },
    {
      id: 'recovery-choice-code',
      value: CHOICES.code,
      image: <BackupAuthenticationCodesImage />,
      localizedChoiceTitle: ftlMsgResolver.getMsg(
        'password-reset-recovery-method-code',
        'Backup authentication codes'
      ),
      localizedChoiceInfo: ftlMsgResolver.getMsg(
        'password-reset-recovery-method-code-info',
        `${numBackupCodes} code${numBackupCodes === 1 ? '' : 's'} remaining`,
        { numBackupCodes }
      ),
    },
  ];

  return (
    <AppLayout>
      <div className="relative flex items-center mb-5">
        <ButtonBack />
        <FtlMsg id="password-reset-recovery-method-header">
          <HeadingPrimary marginClass="">Reset your password</HeadingPrimary>
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

      <FormChoice {...{ legendEl, onSubmit, formChoices, isSubmitting }} />
    </AppLayout>
  );
};
const legendEl = (
  <>
    <legend>
      <FtlMsg id="password-reset-recovery-method-subheader">
        <h2 className="card-header">Choose a recovery method</h2>
      </FtlMsg>
    </legend>
    <FtlMsg id="password-reset-recovery-method-details">
      <p className="pt-2 mb-8">
        Let’s make sure it’s you using your recovery methods.
      </p>
    </FtlMsg>
  </>
);

export default ResetPasswordRecoveryChoice;

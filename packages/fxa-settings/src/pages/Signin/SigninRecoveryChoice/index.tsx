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
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import Banner from '../../../components/Banner';
import { SigninIntegration, SigninLocationState } from '../interfaces';
import { getLocalizedErrorMessage } from '../../../lib/error-utils';
import {
  AuthUiError,
  AuthUiErrors,
} from '../../../lib/auth-errors/auth-errors';
import GleanMetrics from '../../../lib/glean';

export type SigninRecoveryChoiceProps = {
  handlePhoneChoice: () => Promise<AuthUiError | void>;
  maskedPhoneNumber: string;
  lastFourPhoneDigits: string;
  numBackupCodes: number;
  signinState: SigninLocationState;
  integration?: SigninIntegration;
};

const SigninRecoveryChoice = ({
  handlePhoneChoice,
  maskedPhoneNumber,
  lastFourPhoneDigits,
  numBackupCodes,
  signinState,
  integration,
}: SigninRecoveryChoiceProps) => {
  const [errorBannerMessage, setErrorBannerMessage] = React.useState('');
  const [errorBannerDescription, setErrorBannerDescription] =
    React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const ftlMsgResolver = useFtlMsgResolver();
  const navigateWithQuery = useNavigateWithQuery();

  const generalSendCodeErrorHeading = ftlMsgResolver.getMsg(
    'signin-recovery-method-send-code-error-heading',
    'There was a problem sending a code to your recovery phone'
  );

  const generalSendCodeErrorDescription = ftlMsgResolver.getMsg(
    'signin-recovery-method-send-code-error-description',
    'Please try again later or use your backup authentication codes.'
  );

  useEffect(() => {
    GleanMetrics.login.backupChoiceView();
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
    setErrorBannerDescription(generalSendCodeErrorDescription);
  };

  const onSubmit = async ({ choice }: FormChoiceData) => {
    setErrorBannerMessage('');
    setErrorBannerDescription('');
    setIsSubmitting(true);
    GleanMetrics.login.backupChoiceSubmit({ event: { reason: choice } });
    switch (choice) {
      case CHOICES.phone:
        const error = await handlePhoneChoice();
        if (error) {
          handlePhoneChoiceError(error);
          setIsSubmitting(false);
          return;
        }
        navigateWithQuery('/signin_recovery_phone', {
          state: { signinState, lastFourPhoneDigits, numBackupCodes },
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
      localizedChoiceInfo: maskedPhoneNumber,
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
        'signin-recovery-method-code-info-v2',
        `${numBackupCodes} code${numBackupCodes === 1 ? '' : 's'} remaining`,
        { numBackupCodes }
      ),
    },
  ];

  const cmsInfo = integration?.getCmsInfo();
  const cmsButton = {
    color: cmsInfo?.shared?.buttonColor,
  }

  return (
    <AppLayout cmsInfo={cmsInfo}>
      <div className="relative flex items-center mb-5">
        <ButtonBack />
        {cmsInfo?.shared?.logoUrl && cmsInfo.shared?.logoAltText ? (
          <img
            src={cmsInfo.shared.logoUrl}
            alt={cmsInfo.shared.logoAltText}
            className="justify-start mb-4 max-h-[40px]"
          />
        ) : (
          <FtlMsg id="signin-recovery-method-header">
            <HeadingPrimary marginClass="">Sign in</HeadingPrimary>
          </FtlMsg>
        )}
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

      <FormChoice
        {...{ legendEl, onSubmit, formChoices, isSubmitting, cmsButton }}
      />
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

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import AppLayout from '../../../components/AppLayout';
import FormVerifyTotp from '../../../components/FormVerifyTotp';
import { RouteComponentProps } from '@reach/router';
import { useFtlMsgResolver } from '../../../models';
import { FtlMsg } from 'fxa-react/lib/utils';
import { BackupRecoveryPhoneCodeImage } from '../../../components/images';
import Banner from '../../../components/Banner';
import { HeadingPrimary } from '../../../components/HeadingPrimary';
import LinkExternal from 'fxa-react/components/LinkExternal';
import ButtonBack from '../../../components/ButtonBack';
import { getLocalizedErrorMessage } from '../../../lib/error-utils';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import { ResetPasswordRecoveryPhoneProps } from './interfaces';
import { BannerLinkProps } from '../../../components/Banner/interfaces';

const ResetPasswordRecoveryPhone = ({
  lastFourPhoneDigits,
  verifyCode,
  resendCode,
}: ResetPasswordRecoveryPhoneProps & RouteComponentProps) => {
  const [errorMessage, setErrorMessage] = React.useState('');
  const [errorDescription, setErrorDescription] = React.useState('');
  const [errorLink, setErrorLink] = React.useState<BannerLinkProps>();
  const [showResendSuccessBanner, setShowResendSuccessBanner] =
    React.useState(false);
  const ftlMsgResolver = useFtlMsgResolver();

  const spanElement = <span className="font-bold">{lastFourPhoneDigits}</span>;

  const clearBanners = () => {
    setErrorMessage('');
    setErrorDescription('');
    setErrorLink(undefined);
    setShowResendSuccessBanner(false);
  };

  const localizedGeneralErrorDescription = ftlMsgResolver.getMsg(
    'reset-password-recovery-phone-general-error-description',
    'Please try again later.'
  );

  const handleVerifyCode = async (code: string) => {
    clearBanners();
    const error = await verifyCode(code);

    if (error) {
      if (
        error.errno === AuthUiErrors.BACKEND_SERVICE_FAILURE.errno ||
        error.errno === AuthUiErrors.UNEXPECTED_ERROR.errno
      ) {
        setErrorMessage(
          ftlMsgResolver.getMsg(
            'reset-password-recovery-phone-code-verification-error-heading',
            'There was a problem verifying your code'
          )
        );
        setErrorDescription(localizedGeneralErrorDescription);
        return;
      }
      if (error.errno === AuthUiErrors.INVALID_EXPIRED_OTP_CODE.errno) {
        setErrorDescription(
          ftlMsgResolver.getMsg(
            'reset-password-recovery-phone-invalid-code-error-description',
            'The code is invalid or expired.'
          )
        );
        setErrorLink({
          path: '/confirm_backup_code_reset_password',
          localizedText: ftlMsgResolver.getMsg(
            'reset-password-recovery-phone-invalid-code-error-link',
            'Use backup authentication codes instead?'
          ),
          gleanId: 'reset_password_backup_phone_error_use_backup_code_link',
        });
        return;
      }
      setErrorMessage(getLocalizedErrorMessage(ftlMsgResolver, error));
      return;
    }
  };

  const handleResendCode = async () => {
    clearBanners();
    const error = await resendCode();
    if (error) {
      if (
        error.errno === AuthUiErrors.BACKEND_SERVICE_FAILURE.errno ||
        error.errno === AuthUiErrors.FEATURE_NOT_ENABLED.errno ||
        error.errno === AuthUiErrors.SMS_SEND_RATE_LIMIT_EXCEEDED.errno ||
        error.errno === AuthUiErrors.UNEXPECTED_ERROR.errno
      ) {
        setErrorMessage(
          ftlMsgResolver.getMsg(
            'reset-password-recovery-phone-send-code-error-heading',
            'There was a problem sending a code'
          )
        );
        setErrorDescription(localizedGeneralErrorDescription);
        return;
      }
      setErrorMessage(getLocalizedErrorMessage(ftlMsgResolver, error));
      return;
    }
    setShowResendSuccessBanner(true);
  };

  return (
    <AppLayout>
      <div className="relative flex items-center">
        <ButtonBack />
        <FtlMsg id="reset-password-recovery-phone-flow-heading">
          <HeadingPrimary marginClass="">Reset your password</HeadingPrimary>
        </FtlMsg>
      </div>

      {(errorMessage || errorDescription) && (
        <Banner
          type="error"
          content={{
            localizedHeading: errorMessage,
            localizedDescription: errorDescription,
          }}
          {...(errorLink && {
            link: {
              path: errorLink.path,
              localizedText: errorLink.localizedText,
              gleanId: errorLink.gleanId,
            } as BannerLinkProps,
          })}
        />
      )}
      {showResendSuccessBanner && (
        <Banner
          type="success"
          content={{
            localizedHeading: ftlMsgResolver.getMsg(
              'reset-password-recovery-phone-resend-success',
              'Code sent'
            ),
          }}
        />
      )}
      <BackupRecoveryPhoneCodeImage />
      <FtlMsg id="reset-password-recovery-phone-heading">
        <h2 className="card-header my-4">Enter recovery code</h2>
      </FtlMsg>
      <FtlMsg
        id="reset-password-recovery-phone-instruction-v3"
        vars={{ lastFourPhoneDigits }}
        elems={{ span: spanElement }}
      >
        <p>
          A 6-digit code was sent to the phone number ending in {spanElement} by
          text message. This code expires after 5 minutes. Donʼt share this code
          with anyone.
        </p>
      </FtlMsg>
      <FormVerifyTotp
        codeLength={6}
        codeType="numeric"
        localizedInputLabel={ftlMsgResolver.getMsg(
          'reset-password-recovery-phone-input-label',
          'Enter 6-digit code'
        )}
        localizedSubmitButtonText={ftlMsgResolver.getMsg(
          'reset-password-recovery-phone-code-submit-button',
          'Confirm'
        )}
        verifyCode={handleVerifyCode}
        {...{
          clearBanners,
          errorMessage,
          setErrorMessage,
        }}
        gleanDataAttrs={{ id: 'reset_password_backup_phone_submit' }}
      />
      <div className="flex justify-between mt-5 text-sm">
        <FtlMsg id="reset-password-recovery-phone-resend-code-button">
          <button
            className="link-blue mt-4 text-sm"
            data-glean-id="reset_password_backup_phone_resend"
            onClick={handleResendCode}
          >
            Resend code
          </button>
        </FtlMsg>
        <FtlMsg id="reset-password-recovery-phone-locked-out-link">
          <LinkExternal
            href="https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication"
            className="link-blue mt-4 text-sm"
            gleanDataAttrs={{ id: 'reset_password_backup_phone_locked_out_link' }}
          >
            Are you locked out?
          </LinkExternal>
        </FtlMsg>
      </div>
    </AppLayout>
  );
};

export default ResetPasswordRecoveryPhone;

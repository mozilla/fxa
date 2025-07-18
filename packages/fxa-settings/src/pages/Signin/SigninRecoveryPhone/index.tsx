/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useState } from 'react';
import AppLayout from '../../../components/AppLayout';
import FormVerifyTotp from '../../../components/FormVerifyTotp';
import { RouteComponentProps } from '@reach/router';
import { useFtlMsgResolver } from '../../../models';
import { FtlMsg, FtlMsgResolver } from 'fxa-react/lib/utils';
import { BackupRecoveryPhoneCodeImage } from '../../../components/images';
import Banner from '../../../components/Banner';
import { HeadingPrimary } from '../../../components/HeadingPrimary';
import LinkExternal from 'fxa-react/components/LinkExternal';
import ButtonBack from '../../../components/ButtonBack';
import {
  getLocalizedErrorMessage,
  HandledError,
} from '../../../lib/error-utils';
import {
  AuthUiError,
  AuthUiErrors,
} from '../../../lib/auth-errors/auth-errors';
import { SigninRecoveryPhoneProps } from './interfaces';
import { BannerLinkProps } from '../../../components/Banner/interfaces';

// Reusable function for error banner heading/description
function getSendCodeErrorBanner(
  error: HandledError | AuthUiError,
  ftlMsgResolver: FtlMsgResolver,
  localizedGeneralErrorDescription: string
) {
  if (!error) return { heading: '', description: '' };
  const heading = ftlMsgResolver.getMsg(
    'signin-recovery-phone-send-code-error-heading',
    'There was a problem sending a code'
  );
  if (
    error.errno === AuthUiErrors.BACKEND_SERVICE_FAILURE.errno ||
    error.errno === AuthUiErrors.FEATURE_NOT_ENABLED?.errno ||
    error.errno === AuthUiErrors.SMS_SEND_RATE_LIMIT_EXCEEDED?.errno ||
    error.errno === AuthUiErrors.UNEXPECTED_ERROR.errno
  ) {
    return {
      heading,
      description: localizedGeneralErrorDescription,
    };
  }
  return {
    heading,
    description: getLocalizedErrorMessage(ftlMsgResolver, error),
  };
}

const SigninRecoveryPhone = ({
  lastFourPhoneDigits,
  verifyCode,
  resendCode,
  sendError,
  numBackupCodes,
  integration
}: SigninRecoveryPhoneProps & RouteComponentProps) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [errorDescription, setErrorDescription] = useState('');
  const [errorLink, setErrorLink] = useState<BannerLinkProps>();
  const [showResendSuccessBanner, setShowResendSuccessBanner] = useState(false);
  const [initialSendErrorDismissed, setInitialSendErrorDismissed] =
    useState(false);
  const ftlMsgResolver = useFtlMsgResolver();

  const localizedGeneralErrorDescription = ftlMsgResolver.getMsg(
    'signin-recovery-phone-general-error-description',
    'Please try again later.'
  );

  const spanElement = <span className="font-bold">{lastFourPhoneDigits}</span>;

  useEffect(() => {
    if (sendError && !initialSendErrorDismissed) {
      const { heading, description } = getSendCodeErrorBanner(
        sendError,
        ftlMsgResolver,
        localizedGeneralErrorDescription
      );
      setErrorMessage(heading);
      setErrorDescription(description);
    }
  }, [
    sendError,
    initialSendErrorDismissed,
    ftlMsgResolver,
    localizedGeneralErrorDescription,
  ]);

  const clearBanners = () => {
    setErrorMessage('');
    setErrorDescription('');
    setErrorLink(undefined);
    setShowResendSuccessBanner(false);
    setInitialSendErrorDismissed(true);
  };

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
            'signin-recovery-phone-code-verification-error-heading',
            'There was a problem verifying your code'
          )
        );
        setErrorDescription(localizedGeneralErrorDescription);
        return;
      }
      if (error.errno === AuthUiErrors.INVALID_EXPIRED_OTP_CODE.errno) {
        setErrorDescription(
          ftlMsgResolver.getMsg(
            'signin-recovery-phone-invalid-code-error-description',
            'The code is invalid or expired.'
          )
        );
        if (numBackupCodes && numBackupCodes > 0) {
          setErrorLink({
            path: '/signin_recovery_code',
            localizedText: ftlMsgResolver.getMsg(
              'signin-recovery-phone-invalid-code-error-link',
              'Use backup authentication codes instead?'
            ),
            gleanId: 'login_backup_phone_error_use_backup_code_link',
          });
        }
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
      const { heading, description } = getSendCodeErrorBanner(
        error,
        ftlMsgResolver,
        localizedGeneralErrorDescription
      );
      setErrorMessage(heading);
      setErrorDescription(description);
      return;
    }
    setShowResendSuccessBanner(true);
  };

  const cmsInfo = integration?.getCmsInfo();

  return (
    <AppLayout integration={integration}>

      <div className="relative flex items-center">
        <ButtonBack />
        {cmsInfo?.shared?.logoUrl && cmsInfo.shared?.logoAltText ? (
          <img
            src={cmsInfo.shared.logoUrl}
            alt={cmsInfo.shared.logoAltText}
            className="justify-start mb-4 max-h-[40px]"
          />
        ) : (
          <FtlMsg id="signin-recovery-phone-flow-heading">
            <HeadingPrimary marginClass="">Sign in</HeadingPrimary>
          </FtlMsg>
        )}
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
              'signin-recovery-phone-resend-success',
              'Code sent'
            ),
          }}
        />
      )}
      <BackupRecoveryPhoneCodeImage />
      <FtlMsg id="signin-recovery-phone-heading">
        <h2 className="card-header my-4">Enter recovery code</h2>
      </FtlMsg>
      <FtlMsg
        id="signin-recovery-phone-instruction-v3"
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
          'signin-recovery-phone-input-label',
          'Enter 6-digit code'
        )}
        localizedSubmitButtonText={ftlMsgResolver.getMsg(
          'signin-recovery-phone-code-submit-button',
          'Confirm'
        )}
        verifyCode={handleVerifyCode}
        {...{
          clearBanners,
          errorMessage,
          setErrorMessage,
          setErrorDescription,
        }}
        gleanDataAttrs={{ id: 'login_backup_phone_submit' }}
        className="my-6"
        cmsButton={{
          color: cmsInfo?.shared?.buttonColor
        }}
      />
      <div className="flex justify-between mt-5 text-sm">
        <FtlMsg id="signin-recovery-phone-resend-code-button">
          <button
            className="link-blue mt-4 text-sm"
            data-glean-id="login_backup_phone_resend"
            onClick={handleResendCode}
          >
            Resend code
          </button>
        </FtlMsg>
        <FtlMsg id="signin-recovery-phone-locked-out-link">
          <LinkExternal
            href="https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication"
            className="link-blue mt-4 text-sm"
            gleanDataAttrs={{ id: 'login_backup_phone_locked_out_link' }}
          >
            Are you locked out?
          </LinkExternal>
        </FtlMsg>
      </div>
    </AppLayout>
  );
};

export default SigninRecoveryPhone;

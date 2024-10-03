import React, { useRef, useState } from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import Banner, { BannerType } from '../Banner';
import FormVerifyCode, { FormAttributes } from '../FormVerifyCode';
import { Link } from '@reach/router';
import { useFtlMsgResolver, useAuthClient } from '../../models';
import protectionShieldIcon from './protection-shield.svg';

export type CodeArray = Array<string | undefined>;

export type PasswordResetConfirmTotpProps = {
  codeLength: 6 | 8;
  passwordForgotToken: string;
  onComplete: () => Promise<void>;
};

const PasswordResetConfirmTotp = ({
  codeLength,
  onComplete,
  passwordForgotToken,
}: PasswordResetConfirmTotpProps) => {
  const inputRefs = useRef(
    Array.from({ length: codeLength }, () =>
      React.createRef<HTMLInputElement>()
    )
  );
  const ftlMsgResolver = useFtlMsgResolver();
  const authClient = useAuthClient();

  const [codeArray, setCodeArray] = useState<CodeArray>(new Array(codeLength));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [bannerError, setBannerError] = useState('');

  const stringifiedCode = codeArray.join('');

  const isFormValid = stringifiedCode.length === codeLength && !errorMessage;
  const isSubmitDisabled = isSubmitting || !isFormValid;

  const verifyCode = async (code: string) => {
    const result = await authClient.checkTotpTokenCodeWithPasswordForgotToken(
      passwordForgotToken,
      code
    );
    if (result.success) {
      await onComplete();
    }
  };

  const formAttributes: FormAttributes = {
    inputFtlId: 'password-reset-confirm-totp-input-label',
    inputLabelText: 'Enter code',
    pattern: '[0-9]{6}',
    maxLength: 6,
    submitButtonFtlId: 'password-reset-confirm-totp-confirm-button',
    submitButtonText: 'Confirm',
  };

  const localizedCustomCodeRequiredMessage = ftlMsgResolver.getMsg(
    'signin-totp-code-required-error',
    'Authentication code required'
  );
  const [codeErrorMessage, setCodeErrorMessage] = useState<string>('');

  return (
    <>
      <h1 className="text-grey-400 mb-6 text-left">
        <FtlMsg id="password-reset-confirm-totp-header">
          Reset your password
        </FtlMsg>
      </h1>

      <h2 className="font-bold text-xl text-left">
        <FtlMsg id="password-reset-confirm-totp-subheader">
          Enter your two-factor authentication security code (2FA)
        </FtlMsg>
      </h2>

      {bannerError && <Banner type={BannerType.error}>{bannerError}</Banner>}

      <div className="flex space-x-4">
        <img src={protectionShieldIcon} alt="" />
        <FtlMsg id="password-reset-confirm-totp-instruction">
          <p id="totp-code-instruction" className="my-5 text-md">
            Check your authenticator app to reset your password.
          </p>
        </FtlMsg>
      </div>

      <FormVerifyCode
        {...{
          formAttributes,
          verifyCode,
          localizedCustomCodeRequiredMessage,
          codeErrorMessage,
          setCodeErrorMessage,
          viewName: 'password-reset-confirm-totp',
        }}
      />
      <div className="mt-5 link-blue text-sm flex justify-end">
        <FtlMsg id="password-reset-confirm-totp-trouble-code">
          <Link to={''}>Trouble entering code?</Link>
        </FtlMsg>
      </div>
    </>
  );
};

export default PasswordResetConfirmTotp;

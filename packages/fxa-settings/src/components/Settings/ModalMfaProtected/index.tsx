/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { FtlMsg } from 'fxa-react/lib/utils';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import GleanMetrics from '../../../lib/glean';
import { MfaReason } from '../../../lib/types';
import { useFtlMsgResolver } from '../../../models';
import Banner, { ResendCodeSuccessBanner } from '../../Banner';
import { EmailCodeImage } from '../../images';
import InputText from '../../InputText';
import Modal from '../Modal';

type ModalProps = {
  email: string;
  expirationTime: number;
  onSubmit: (code: string) => void;
  onDismiss: () => void;
  handleResendCode: () => void;
  clearErrorMessage: () => void;
  localizedErrorBannerMessage?: string;
  resendCodeLoading: boolean;
  showResendSuccessBanner: boolean;
  reason: MfaReason;
};

type FormData = {
  confirmationCode: string;
};

export const ModalMfaProtected = ({
  email,
  expirationTime,
  onSubmit,
  onDismiss,
  handleResendCode,
  clearErrorMessage,
  localizedErrorBannerMessage,
  resendCodeLoading,
  showResendSuccessBanner,
  reason,
}: ModalProps) => {
  useEffect(() => {
    GleanMetrics.accountPref.mfaGuardView({
      event: { reason },
    });
  }, [reason]);
  const ftlMsgResolver = useFtlMsgResolver();

  const { handleSubmit, register, formState } = useForm<FormData>({
    mode: 'all',
    defaultValues: {
      confirmationCode: '',
    },
  });

  const { isDirty, isValid } = formState;
  const buttonDisabled = !isDirty || !isValid;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // only accept characters that match the code type (numeric or alphanumeric)
    // strip out any other characters
    const filteredCode = e.target.value.replace(/[^0-9]/g, '');
    e.target.value = filteredCode;
    clearErrorMessage();
  };

  return (
    <Modal
      data-testid="modal-verify-session"
      descId="modal-mfa-protected-desc"
      headerId="modal-mfa-protected-title"
      hasButtons={false}
      onDismiss={onDismiss}
    >
      <form
        onSubmit={handleSubmit(({ confirmationCode }) => {
          onSubmit(confirmationCode.trim());
        })}
      >
        <FtlMsg id="modal-mfa-protected-title">
          <h2 id="modal-mfa-protected-title" className="font-bold text-xl">
            Enter confirmation code
          </h2>
        </FtlMsg>
        <FtlMsg id="modal-mfa-protected-subtitle">
          <p className="text-base mt-1">
            Help us make sure it’s you changing your account info
          </p>
        </FtlMsg>
        {showResendSuccessBanner && <ResendCodeSuccessBanner />}
        {localizedErrorBannerMessage && (
          <Banner
            type="error"
            bannerId="modal-mfa-protected-error-banner"
            content={{ localizedHeading: localizedErrorBannerMessage }}
          />
        )}

        <EmailCodeImage />

        <FtlMsg
          id="modal-mfa-protected-instruction"
          vars={{ email, expirationTime }}
          elems={{
            email: <span className="font-bold">{email}</span>,
          }}
        >
          <p id="modal-mfa-protected-desc" className="my-6">
            Enter the code that was sent to{' '}
            <span className="font-bold">{email}</span> within{' '}
            {expirationTime === 1 ? '1 minute' : `${expirationTime} minutes`}.
          </p>
        </FtlMsg>

        <div className="mt-4 mb-8">
          <InputText
            name="confirmationCode"
            label={ftlMsgResolver.getMsg(
              'modal-mfa-protected-input-label',
              'Enter 6-digit code'
            )}
            inputRef={register({
              required: true,
              pattern: /^\s*[0-9]{6}\s*$/,
            })}
            maxLength={6}
            inputMode="numeric"
            onChange={onChange}
            ariaDescribedBy={
              localizedErrorBannerMessage
                ? 'modal-mfa-protected-error-banner'
                : undefined
            }
            hasErrors={!!localizedErrorBannerMessage}
          />
        </div>

        <div className="flex justify-between gap-4 w-full">
          <FtlMsg id="modal-mfa-protected-cancel-button">
            <button
              type="button"
              className="cta-neutral cta-xl flex-1 w-1/2"
              onClick={onDismiss}
            >
              Cancel
            </button>
          </FtlMsg>
          <FtlMsg id="modal-mfa-protected-confirm-button">
            <button
              type="submit"
              className="cta-primary cta-xl flex-1 w-1/2"
              disabled={buttonDisabled}
              data-glean-id="account_pref_mfa_guard_submit"
              data-glean-type={reason}
            >
              Confirm
            </button>
          </FtlMsg>
        </div>
      </form>
      <div className="mt-7 text-grey-500 text-sm inline-flex gap-1">
        <FtlMsg id="modal-mfa-protected-code-expired">
          <p>Code expired?</p>
        </FtlMsg>
        <FtlMsg id="modal-mfa-protected-resend-code-link">
          <button
            className="link-blue"
            onClick={handleResendCode}
            disabled={resendCodeLoading}
          >
            Email new code.
          </button>
        </FtlMsg>
      </div>
    </Modal>
  );
};

export default ModalMfaProtected;

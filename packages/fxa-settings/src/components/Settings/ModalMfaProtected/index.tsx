/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../Modal';
import InputText from '../../InputText';
import { useFtlMsgResolver } from '../../../models';
import { FtlMsg } from 'fxa-react/lib/utils';
import { EmailCodeImage } from '../../images';
import { ResendCodeSuccessBanner } from '../../Banner';

type ModalProps = {
  email: string;
  expirationTime: number;
  onSubmit: (code: string) => void;
  onDismiss: () => void;
  handleResendCode: () => void;
  clearErrorTooltip: () => void;
  localizedErrorTooltipMessage?: string;
  resendCodeLoading: boolean;
  showResendSuccessBanner: boolean;
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
  clearErrorTooltip,
  localizedErrorTooltipMessage,
  resendCodeLoading,
  showResendSuccessBanner,
}: ModalProps) => {
  const ftlMsgResolver = useFtlMsgResolver();

  const { handleSubmit, register, formState } = useForm<FormData>({
    mode: 'all',
    defaultValues: {
      confirmationCode: '',
    },
  });

  const { isDirty, isValid } = formState;
  const buttonDisabled = !isDirty || !isValid;

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
          <p className="text-base mt-1">Help us make sure it’s you changing your account info</p>
        </FtlMsg>
        {showResendSuccessBanner && <ResendCodeSuccessBanner />}

        <EmailCodeImage />

        <FtlMsg
          id="modal-mfa-protected-instruction"
          vars={{ email, expirationTime }}
          elems={{
            email: <span className="font-bold">{email}</span>,
          }}
        >
          <p id="modal-mfa-protected-desc" className="my-6">
            Enter the code that was sent to <span className="font-bold">{email}</span> within {expirationTime === 1 ? '1 minute' : `${expirationTime} minutes`}.
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
            onChange={clearErrorTooltip}
            {...{
              errorText: localizedErrorTooltipMessage,
            }}
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

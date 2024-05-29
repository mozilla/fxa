/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../Modal';
import InputText from '../../InputText';
import { ApolloError } from '@apollo/client';
import { useAccount, useSession } from '../../../models';
import { Localized, useLocalization } from '@fluent/react';
import { AuthUiErrors } from 'fxa-settings/src/lib/auth-errors/auth-errors';
import { getErrorFtlId } from '../../../lib/error-utils';

type ModalProps = {
  onDismiss: () => void;
  onError: (error: ApolloError) => void;
  onCompleted?: () => void;
};

type FormData = {
  verificationCode: string;
};

export const ModalVerifySession = ({
  onDismiss,
  onError,
  onCompleted,
}: ModalProps) => {
  const session = useSession();
  const [errorText, setErrorText] = useState<string>();
  const account = useAccount();
  const primaryEmail = account.primaryEmail;
  const { l10n } = useLocalization();

  const { handleSubmit, register, formState } = useForm<FormData>({
    mode: 'all',
    defaultValues: {
      verificationCode: '',
    },
  });

  const verifySession = useCallback(
    async (code: string) => {
      try {
        await session.verifySession(code);
      } catch (e) {
        if (e.errno === AuthUiErrors.INVALID_EXPIRED_SIGNUP_CODE.errno) {
          const errorText = l10n.getString(
            getErrorFtlId(e),
            null,
            AuthUiErrors.INVALID_EXPIRED_SIGNUP_CODE.message
          );
          setErrorText(errorText);
        } else {
          onError(e);
        }
        return;
      }
    },
    [session, l10n, setErrorText, onError]
  );

  useEffect(() => {
    const getStatus = async () => {
      // Check cache first, then do network request for session verification
      if (session.verified) {
        onCompleted && onCompleted();
      } else {
        let sessionVerified = false;
        sessionVerified = await session.isSessionVerified();
        if (sessionVerified) {
          onCompleted && onCompleted();
        } else {
          session.sendVerificationCode();
        }
      }
    };

    getStatus();
  }, [session, onCompleted]);

  const buttonDisabled =
    !formState.isDirty || !formState.isValid || account.loading;
  return (
    !session.verified && (
      <Modal
        data-testid="modal-verify-session"
        descId="modal-verify-session-desc"
        headerId="modal-verify-session-header"
        hasButtons={false}
        onDismiss={onDismiss}
      >
        <form
          onSubmit={handleSubmit(({ verificationCode }) => {
            verifySession(verificationCode.trim());
          })}
        >
          <Localized id="mvs-verify-your-email-2">
            <h2
              id="modal-verify-session-header-2"
              className="font-bold text-xl text-center"
              data-testid="modal-verify-session-header"
            >
              Confirm your email
            </h2>
          </Localized>

          <Localized
            id="mvs-enter-verification-code-desc-2"
            vars={{ email: primaryEmail.email }}
            elems={{
              email: <span className="font-bold"></span>,
            }}
          >
            <p
              id="modal-verify-session-desc-2"
              data-testid="modal-verify-session-desc"
              className="my-6 text-center"
            >
              Please enter the confirmation code that was sent to{' '}
              <span className="font-bold">{primaryEmail.email}</span> within 5
              minutes.
            </p>
          </Localized>

          <div className="mt-4 mb-6">
            <InputText
              name="verificationCode"
              label={l10n.getString(
                'mvs-enter-verification-code-2',
                null,
                'Enter your confirmation code'
              )}
              onChange={() => {
                if (errorText) {
                  setErrorText(undefined);
                }
              }}
              inputRef={register({
                required: true,
                pattern: /^\s*[0-9]{6}\s*$/,
              })}
              prefixDataTestId="verification-code"
              {...{ errorText }}
            ></InputText>
          </div>

          <div className="flex justify-center mx-auto max-w-64">
            <Localized id="msv-cancel-button">
              <button
                type="button"
                className="cta-neutral cta-base-p mx-2 flex-1"
                data-testid="modal-verify-session-cancel"
                onClick={(event) => onDismiss()}
              >
                Cancel
              </button>
            </Localized>
            <Localized id="msv-submit-button-2">
              <button
                type="submit"
                className="cta-primary cta-base-p mx-2 flex-1"
                data-testid="modal-verify-session-submit"
                disabled={buttonDisabled}
              >
                Confirm
              </button>
            </Localized>
          </div>
        </form>
      </Modal>
    )
  );
};

export default ModalVerifySession;

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../Modal';
import InputText from '../InputText';
import { ApolloError, gql } from '@apollo/client';
import { useAccount, useSession } from '../../models';
import { useMutation } from '../../lib/hooks';

type ModalProps = {
  onDismiss: () => void;
  onError: (error: ApolloError) => void;
  onCompleted?: () => void;
};

type FormData = {
  verificationCode: string;
};

export const SEND_SESSION_VERIFICATION_CODE_MUTATION = gql`
  mutation sendSessionVerificationCode($input: SendSessionVerificationInput!) {
    sendSessionVerificationCode(input: $input) {
      clientMutationId
    }
  }
`;

export const VERIFY_SESSION_MUTATION = gql`
  mutation verifySession($input: VerifySessionInput!) {
    verifySession(input: $input) {
      clientMutationId
    }
  }
`;

export const ModalVerifySession = ({
  onDismiss,
  onError,
  onCompleted,
}: ModalProps) => {
  const session = useSession();
  const [errorText, setErrorText] = useState<string>();
  const { primaryEmail } = useAccount();
  const { handleSubmit, register, formState } = useForm<FormData>({
    mode: 'all',
    defaultValues: {
      verificationCode: '',
    },
  });

  const [sendCode] = useMutation(SEND_SESSION_VERIFICATION_CODE_MUTATION, {
    variables: { input: {} },
    ignoreResults: true,
    onError,
  });

  const [verifySession, { loading }] = useMutation(VERIFY_SESSION_MUTATION, {
    ignoreResults: true,
    onError: (error) => {
      if (error.graphQLErrors?.length) {
        setErrorText(error.message);
      } else {
        // Bubble up network errors, etc.
        onError(error);
      }
    },
    update: (cache) => {
      cache.modify({
        fields: {
          session: () => {
            return { verified: true };
          },
        },
      });
    },
  });

  useEffect(() => {
    if (onCompleted && session.verified) {
      onCompleted();
    } else {
      sendCode();
    }
  }, [session, sendCode, onCompleted]);

  if (session.verified) {
    return null;
  }
  const buttonDisabled = !formState.isDirty || !formState.isValid || loading;
  return (
    <Modal
      data-testid="modal-verify-session"
      descId="modal-verify-session-desc"
      headerId="modal-verify-session-header"
      hasButtons={false}
      onDismiss={onDismiss}
    >
      <form
        onSubmit={handleSubmit(({ verificationCode }) => {
          verifySession({
            variables: {
              input: {
                code: verificationCode.trim(),
              },
            },
          });
        })}
      >
        <h2
          id="modal-verify-session-header"
          className="font-bold text-xl text-center"
        >
          Verify your email
        </h2>
        <p
          id="modal-verify-session-desc"
          data-testid="modal-desc"
          className="my-6 text-center"
        >
          Please enter the verification code that was sent to{' '}
          <span className="font-bold">{primaryEmail.email}</span> within 5
          minutes.
        </p>

        <div className="mt-4 mb-6">
          <InputText
            name="verificationCode"
            label="Enter your verification code"
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
          <button
            type="button"
            className="cta-neutral mx-2 flex-1"
            data-testid="modal-verify-session-cancel"
            onClick={onDismiss}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="cta-primary mx-2 flex-1"
            data-testid="modal-verify-session-submit"
            disabled={buttonDisabled}
          >
            Verify
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ModalVerifySession;

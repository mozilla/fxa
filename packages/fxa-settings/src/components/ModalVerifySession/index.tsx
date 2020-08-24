/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useState } from 'react';
import Modal from '../Modal';
import TextInput from '../TextInput';
import { gql, useMutation } from '@apollo/client';
import { useAccount } from '../../models';

type ModalProps = {
  onDismiss: () => void;
  onError: (error: Error) => void;
  onCompleted?: () => void;
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
  onCompleted = () => {},
}: ModalProps) => {
  const [code, setCode] = useState<string>();
  const [errorText, setErrorText] = useState<string>();
  const { primaryEmail } = useAccount();
  const [sendCode] = useMutation(SEND_SESSION_VERIFICATION_CODE_MUTATION, {
    variables: { input: {} },
    ignoreResults: true,
    onError,
  });
  const [verifySession] = useMutation(VERIFY_SESSION_MUTATION, {
    onCompleted,
    onError: (error) => {
      if (error.graphQLErrors?.length) {
        setErrorText(error.message);
      } else {
        // Bubble up network errors, etc.
        onError(error);
      }
    },
    ignoreResults: true,
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
    sendCode();
  }, [sendCode]);

  return (
    <Modal
      data-testid="modal-verify-session"
      descId="some-desc"
      headerId="some-id"
      hasButtons={false}
      onDismiss={onDismiss}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          verifySession({
            variables: {
              input: {
                code,
              },
            },
          });
        }}
      >
        <h2 id="some-id" className="font-bold text-xl text-center">
          Verify your email
        </h2>
        <p id="some-desc" data-testid="modal-desc" className="my-6">
          Please enter the verification code that was sent to{' '}
          <span className="font-bold">{primaryEmail.email}</span> within 5
          minutes.
        </p>
        {/* TODO: proper validation error text ↓ is just a placeholder */}
        <p className="text-red-500" data-testid="modal-verify-session-error">
          {errorText}
        </p>
        <TextInput
          label="Enter your verification code"
          onChange={(event) => {
            setCode(event.target.value);
          }}
        ></TextInput>
        <div className="flex mt-6">
          <button
            type="button"
            className="cta-neutral transition-standard flex-1"
            data-testid="modal-verify-session-cancel"
            onClick={onDismiss}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="cta-primary transition-standard flex-1"
            data-testid="modal-verify-session-submit"
          >
            Verify
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ModalVerifySession;

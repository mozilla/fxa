import React, { useCallback, useRef, useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import sentryMetrics from 'fxa-shared/lib/sentry';
import TextInput from '../TextInput';
import { RouteComponentProps, useNavigate } from '@reach/router';
import FlowContainer from '../FlowContainer';
import { Account } from '../../models';
import VerifiedSessionGuard from '../VerifiedSessionGuard';

export const CREATE_SECONDARY_EMAIL_MUTATION = gql`
  mutation createSecondaryEmail($input: EmailInput!) {
    createSecondaryEmail(input: $input) {
      clientMutationId
    }
  }
`;

export const FlowSecondaryEmailAdd = (_: RouteComponentProps) => {
  const [saveBtnDisabled, setSaveBtnDisabled] = useState(true);
  const [errorText, setErrorText] = useState<string>();
  const [email, setEmail] = useState<string>();
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const goBack = useCallback(() => window.history.back(), []);

  const [createSecondaryEmail] = useMutation(CREATE_SECONDARY_EMAIL_MUTATION, {
    onError: (error) => {
      if (error.graphQLErrors?.length) {
        setErrorText(error.message);
      } else {
        sentryMetrics.captureException(error);
        // TODO
      }
    },
    update: (cache) => {
      cache.modify({
        fields: {
          account: (existing: Account) => {
            const emails = [
              ...existing.emails,
              { email: email!, isPrimary: false, verified: false },
            ];
            return { ...existing, emails };
          },
        },
      });
    },
    onCompleted: () => {
      navigate('emails/verify', { state: { email }, replace: true });
    },
  });

  const checkEmail = useCallback(
    (ev) => {
      setSaveBtnDisabled(!ev.target.checkValidity());
      setEmail(inputRef.current?.value);
    },
    [setSaveBtnDisabled]
  );

  return (
    <FlowContainer title="Secondary email">
      <VerifiedSessionGuard onDismiss={goBack} onError={goBack} />
      <form
        onSubmit={(ev) => {
          ev.preventDefault();
          if (inputRef.current) {
            createSecondaryEmail({
              variables: { input: { email } },
            });
          }
        }}
      >
        <div className="mb-3" data-testid="secondary-email-input">
          <TextInput
            label="Enter email address"
            type="email"
            onChange={checkEmail}
            {...{ inputRef, errorText }}
          />
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            className="cta-neutral-lg transition-standard mb-3 w-32"
            data-testid="cancel-button"
            onClick={goBack}
          >
            Cancel
          </button>

          <button
            type="submit"
            className={`cta-primary transition-standard mb-3 w-32 ${
              saveBtnDisabled ? 'opacity-25' : ''
            }`}
            data-testid="save-button"
            disabled={saveBtnDisabled}
          >
            Save
          </button>
        </div>
      </form>
    </FlowContainer>
  );
};

export default FlowSecondaryEmailAdd;

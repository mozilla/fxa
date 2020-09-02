import React, { useCallback, useRef, useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import { cloneDeep } from '@apollo/client/utilities';
import sentryMetrics from 'fxa-shared/lib/sentry';
import InputText from '../InputText';
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

export const PageSecondaryEmailAdd = (_: RouteComponentProps) => {
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
            const account = cloneDeep(existing);
            account.emails.push({
              email: email!,
              isPrimary: false,
              verified: false,
            });
            return account;
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
        <div className="mt-4 mb-6" data-testid="secondary-email-input">
          <InputText
            label="Enter email address"
            type="email"
            onChange={checkEmail}
            {...{ inputRef, errorText }}
          />
        </div>

        <div className="flex justify-center mx-auto max-w-64">
          <button
            type="button"
            className="cta-neutral mx-2 flex-1"
            data-testid="cancel-button"
            onClick={goBack}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="cta-primary mx-2 flex-1"
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

export default PageSecondaryEmailAdd;

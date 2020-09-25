import React, { ChangeEvent, useCallback, useRef, useState } from 'react';
import { gql } from '@apollo/client';
import { cloneDeep } from '@apollo/client/utilities';
import { RouteComponentProps, useNavigate } from '@reach/router';
import { useAlertBar, useMutation } from '../../lib/hooks';
import { Account } from '../../models';
import InputText from '../InputText';
import FlowContainer from '../FlowContainer';
import VerifiedSessionGuard from '../VerifiedSessionGuard';
import AlertBar from '../AlertBar';

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
  const alertBar = useAlertBar();
  const goBack = useCallback(() => window.history.back(), []);

  const [createSecondaryEmail] = useMutation(CREATE_SECONDARY_EMAIL_MUTATION, {
    onError: (error) => {
      if (error.graphQLErrors?.length) {
        setErrorText(error.message);
      } else {
        alertBar.error('There was a problem creating this email.');
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
    (ev: ChangeEvent<HTMLInputElement>) => {
      setSaveBtnDisabled(!ev.target.checkValidity());
      setEmail(inputRef.current?.value);
    },
    [setSaveBtnDisabled]
  );

  return (
    <FlowContainer title="Secondary email">
      {alertBar.visible && (
        <AlertBar onDismiss={alertBar.hide} type={alertBar.type}>
          <p data-testid="add-email-error">{alertBar.content}</p>
        </AlertBar>
      )}
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

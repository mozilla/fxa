import React, { useCallback, useState, useEffect } from 'react';
import { gql } from '@apollo/client';
import { cloneDeep } from '@apollo/client/utilities';
import { RouteComponentProps, useNavigate } from '@reach/router';
import { Account } from '../../models';
import { useAlertBar, useMutation } from '../../lib/hooks';
import InputText from '../InputText';
import FlowContainer from '../FlowContainer';
import VerifiedSessionGuard from '../VerifiedSessionGuard';

export const VERIFY_SECONDARY_EMAIL_MUTATION = gql`
  mutation verifySecondaryEmail($input: VerifyEmailInput!) {
    verifySecondaryEmail(input: $input) {
      clientMutationId
    }
  }
`;

export const PageSecondaryEmailVerify = ({ location }: RouteComponentProps) => {
  const [code, setCode] = useState<string>();
  const [errorText, setErrorText] = useState<string>();
  const goBack = useCallback(() => window.history.back(), []);
  const navigate = useNavigate();
  const alertBar = useAlertBar();
  const email = (location?.state as any)?.email as string | undefined;

  const [verifySecondaryEmail] = useMutation(VERIFY_SECONDARY_EMAIL_MUTATION, {
    onError: (error) => {
      if (error.graphQLErrors?.length) {
        setErrorText(error.message);
      } else {
        alertBar.error('There was a problem sending the verification code.');
      }
    },
    update: (cache) => {
      cache.modify({
        fields: {
          account: (existing: Account) => {
            const account = cloneDeep(existing);
            account.emails.find((m) => m.email === email)!.verified = true;
            return account;
          },
        },
      });
    },
    onCompleted: () => {
      navigate('/beta/settings', { replace: true });
    },
  });

  useEffect(() => {
    if (!email) {
      navigate('/beta/settings', { replace: true });
    }
  }, [email, navigate]);

  return (
    <FlowContainer title="Secondary email">
      <VerifiedSessionGuard onDismiss={goBack} onError={goBack} />
      <form
        data-testid="secondary-email-verify-form"
        onSubmit={(event) => {
          event.preventDefault();
          verifySecondaryEmail({
            variables: {
              input: {
                code,
                email,
              },
            },
          });
        }}
      >
        <p>
          Please enter the verification code that was sent to{' '}
          <span className="font-bold">{email}</span> within 5 minutes.
        </p>

        <div className="my-6">
          <InputText
            label="Enter your verification code"
            onChange={(event) => {
              setCode(event.target.value);
            }}
            {...{ errorText }}
          ></InputText>
        </div>

        <div className="flex justify-center mx-auto max-w-64">
          <button
            type="button"
            className="cta-neutral mx-2 flex-1"
            data-testid="secondary-email-verify-cancel"
            onClick={goBack}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="cta-primary mx-2 flex-1"
            data-testid="secondary-email-verify-submit"
          >
            Verify
          </button>
        </div>
      </form>
    </FlowContainer>
  );
};

export default PageSecondaryEmailVerify;

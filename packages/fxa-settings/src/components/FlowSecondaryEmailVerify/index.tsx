import React, { useCallback, useState, useEffect } from 'react';
import { gql, useMutation } from '@apollo/client';
import sentryMetrics from 'fxa-shared/lib/sentry';
import TextInput from '../TextInput';
import { RouteComponentProps, useNavigate } from '@reach/router';
import FlowContainer from '../FlowContainer';
import { Account } from '../../models';
import VerifiedSessionGuard from '../VerifiedSessionGuard';

export const VERIFY_SECONDARY_EMAIL_MUTATION = gql`
  mutation verifySecondaryEmail($input: VerifyEmailInput!) {
    verifySecondaryEmail(input: $input) {
      clientMutationId
    }
  }
`;

export const FlowSecondaryEmailVerify = ({ location }: RouteComponentProps) => {
  const [code, setCode] = useState<string>();
  const [errorText, setErrorText] = useState<string>();
  const goBack = useCallback(() => window.history.back(), []);
  const navigate = useNavigate();
  const email = (location?.state as any)?.email as string | undefined;

  const [verifySecondaryEmail] = useMutation(VERIFY_SECONDARY_EMAIL_MUTATION, {
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
            const emails = existing.emails.map((m) =>
              m.email === email ? { ...m, verified: true } : { ...m }
            );
            return { ...existing, emails };
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
        <p className="my-6">
          Please enter the verification code that was sent to{' '}
          <span className="font-bold">{email}</span> within 5 minutes.
        </p>
        <TextInput
          label="Enter your verification code"
          onChange={(event) => {
            setCode(event.target.value);
          }}
          {...{ errorText }}
        ></TextInput>
        <div className="flex mt-6">
          <button
            type="button"
            className="cta-neutral-lg transition-standard flex-1"
            data-testid="secondary-email-verify-cancel"
            onClick={goBack}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="cta-primary transition-standard flex-1"
            data-testid="secondary-email-verify-submit"
          >
            Verify
          </button>
        </div>
      </form>
    </FlowContainer>
  );
};

export default FlowSecondaryEmailVerify;

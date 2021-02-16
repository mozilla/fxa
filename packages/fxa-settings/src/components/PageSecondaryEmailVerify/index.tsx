import React, { useCallback, useState, useEffect } from 'react';
import { gql } from '@apollo/client';
import { Localized, useLocalization } from '@fluent/react';
import { RouteComponentProps, useNavigate } from '@reach/router';
import { HomePath } from '../../constants';
import { useAlertBar, useMutation } from '../../lib/hooks';
import { logViewEvent } from '../../lib/metrics';
import { Email } from '../../models';
import InputText from '../InputText';
import FlowContainer from '../FlowContainer';
import VerifiedSessionGuard from '../VerifiedSessionGuard';
import { useForm } from 'react-hook-form';

type FormData = {
  verificationCode: string;
};

export const VERIFY_SECONDARY_EMAIL_MUTATION = gql`
  mutation verifySecondaryEmail($input: VerifyEmailInput!) {
    verifySecondaryEmail(input: $input) {
      clientMutationId
    }
  }
`;

export const PageSecondaryEmailVerify = ({ location }: RouteComponentProps) => {
  const [errorText, setErrorText] = useState<string>();
  const { handleSubmit, register, formState } = useForm<FormData>({
    mode: 'all',
    defaultValues: {
      verificationCode: '',
    },
  });
  const goBack = useCallback(() => window.history.back(), []);
  const { l10n } = useLocalization();
  const navigate = useNavigate();
  const alertBar = useAlertBar();
  const email = (location?.state as any)?.email as string | undefined;

  const [verifySecondaryEmail, { loading }] = useMutation(
    VERIFY_SECONDARY_EMAIL_MUTATION,
    {
      onError: (error) => {
        if (error.graphQLErrors?.length) {
          setErrorText(error.message);
        } else {
          alertBar.error(
            l10n.getString(
              'verify-secondary-email-error',
              null,
              'There was a problem sending the verification code.'
            )
          );
          logViewEvent('verify-secondary-email.verification', 'fail');
        }
      },
      update: (cache) => {
        cache.modify({
          id: cache.identify({ __typename: 'Account' }),
          fields: {
            emails(existingEmails) {
              return existingEmails.map((x: Email) =>
                x.email === email ? { ...x, verified: true } : { ...x }
              );
            },
          },
        });
      },
      onCompleted: () => {
        navigate(HomePath, { replace: true });
        logViewEvent('verify-secondary-email.verification', 'success');
      },
    }
  );

  useEffect(() => {
    if (!email) {
      navigate(HomePath, { replace: true });
    }
  }, [email, navigate]);

  const buttonDisabled = !formState.isDirty || !formState.isValid || loading;
  return (
    <Localized id="verify-secondary-email-page-title" attrs={{ title: true }}>
      <FlowContainer title="Secondary email">
        <VerifiedSessionGuard onDismiss={goBack} onError={goBack} />
        <form
          data-testid="secondary-email-verify-form"
          onSubmit={handleSubmit(({ verificationCode }) => {
            verifySecondaryEmail({
              variables: {
                input: {
                  code: verificationCode,
                  email,
                },
              },
            });
            logViewEvent('verify-secondary-email.verification', 'clicked');
          })}
        >
          <Localized
            id="verify-secondary-email-please-enter"
            elems={{ email: <span className="font-bold">{email}</span> }}
          >
            <p>
              Please enter the verification code that was sent to {email} within
              5 minutes.
            </p>
          </Localized>

          <div className="my-6">
            <Localized
              id="verify-secondary-email-verification-code"
              attrs={{ label: true }}
            >
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
            </Localized>
          </div>

          <div className="flex justify-center mx-auto max-w-64">
            <Localized id="verify-secondary-email-cancel-button">
              <button
                type="button"
                className="cta-neutral mx-2 flex-1"
                data-testid="secondary-email-verify-cancel"
                onClick={goBack}
              >
                Cancel
              </button>
            </Localized>
            <Localized id="verify-secondary-email-verify-button">
              <button
                type="submit"
                className="cta-primary mx-2 flex-1"
                data-testid="secondary-email-verify-submit"
                disabled={buttonDisabled}
              >
                Verify
              </button>
            </Localized>
          </div>
        </form>
      </FlowContainer>
    </Localized>
  );
};

export default PageSecondaryEmailVerify;

import React, { ChangeEvent, useCallback, useRef, useState } from 'react';
import { gql } from '@apollo/client';
import { Localized, useLocalization } from '@fluent/react';
import { RouteComponentProps, useNavigate } from '@reach/router';
import { useAlertBar } from '../../lib/hooks';
import { logViewEvent, usePageViewEvent } from '../../lib/metrics';
import { HomePath } from '../../constants';
import InputText from '../InputText';
import FlowContainer from '../FlowContainer';
import VerifiedSessionGuard from '../VerifiedSessionGuard';
import AlertBar from '../AlertBar';
import { isEmailValid } from 'fxa-shared/email/helpers';
import { useAuthClient } from '../../lib/auth';
import { cache } from '../../lib/cache';

export const CREATE_SECONDARY_EMAIL_MUTATION = gql`
  mutation createSecondaryEmail($input: EmailInput!) {
    createSecondaryEmail(input: $input) {
      clientMutationId
    }
  }
`;

export const PageSecondaryEmailAdd = (_: RouteComponentProps) => {
  usePageViewEvent('settings.emails');
  const [saveBtnDisabled, setSaveBtnDisabled] = useState(true);
  const [errorText, setErrorText] = useState<string>();
  const [email, setEmail] = useState<string>();
  const inputRef = useRef<HTMLInputElement>(null);
  const { l10n } = useLocalization();
  const navigate = useNavigate();
  const alertBar = useAlertBar();
  const goHome = () =>
    navigate(HomePath + '#secondary-email', { replace: true });

  const createSecondaryEmail = useAuthClient(
    (auth, sessionToken) => async (email: string) => {
      await auth.recoveryEmailCreate(sessionToken, email, {
        verificationMethod: 'email-otp',
      });
      return email;
    },
    {
      onSuccess: (email) => {
        cache.modify({
          id: cache.identify({ __typename: 'Account' }),
          fields: {
            emails(existingEmails) {
              return [
                ...existingEmails,
                {
                  email: email!,
                  isPrimary: false,
                  verified: false,
                },
              ];
            },
          },
        });
        navigate('emails/verify', { state: { email }, replace: true });
      },
      onError: (error) => {
        if (error.errno) {
          setErrorText(error.message);
        } else {
          alertBar.error(
            l10n.getString(
              'add-secondary-email-error',
              null,
              'There was a problem creating this email.'
            )
          );
        }
      },
    }
  );

  const checkEmail = useCallback(
    (ev: ChangeEvent<HTMLInputElement>) => {
      const email = inputRef.current?.value || '';
      const isValid = isEmailValid(email);
      setSaveBtnDisabled(!isValid);
      setEmail(inputRef.current?.value);
      setErrorText('');
    },
    [setSaveBtnDisabled]
  );

  return (
    <Localized id="add-secondary-email-page-title" attrs={{ title: true }}>
      <FlowContainer title="Secondary email">
        {alertBar.visible && (
          <AlertBar onDismiss={alertBar.hide} type={alertBar.type}>
            <p data-testid="add-email-error">{alertBar.content}</p>
          </AlertBar>
        )}
        <VerifiedSessionGuard onDismiss={goHome} onError={goHome} />
        <form
          onSubmit={(ev) => {
            ev.preventDefault();
            if (inputRef.current) {
              createSecondaryEmail.execute(email);
              logViewEvent('settings.emails', 'submit');
            }
          }}
        >
          <div className="mt-4 mb-6" data-testid="secondary-email-input">
            <Localized
              id="add-secondary-email-enter-address"
              attrs={{ label: true }}
            >
              <InputText
                label="Enter email address"
                type="email"
                onChange={checkEmail}
                {...{ inputRef, errorText }}
              />
            </Localized>
          </div>

          <div className="flex justify-center mx-auto max-w-64">
            <Localized id="add-secondary-email-cancel-button">
              <button
                type="button"
                className="cta-neutral mx-2 flex-1"
                data-testid="cancel-button"
                onClick={goHome}
              >
                Cancel
              </button>
            </Localized>
            <Localized id="add-secondary-email-save-button">
              <button
                type="submit"
                className="cta-primary mx-2 flex-1"
                data-testid="save-button"
                disabled={saveBtnDisabled}
              >
                Save
              </button>
            </Localized>
          </div>
        </form>
      </FlowContainer>
    </Localized>
  );
};

export default PageSecondaryEmailAdd;

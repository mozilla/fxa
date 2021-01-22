import React, { ChangeEvent, useCallback, useRef, useState } from 'react';
import { gql } from '@apollo/client';
import { Localized, useLocalization } from '@fluent/react';
import { RouteComponentProps, useNavigate } from '@reach/router';
import { useAlertBar, useMutation } from '../../lib/hooks';
import { logViewEvent, usePageViewEvent } from '../../lib/metrics';
import InputText from '../InputText';
import FlowContainer from '../FlowContainer';
import VerifiedSessionGuard from '../VerifiedSessionGuard';
import AlertBar from '../AlertBar';
import { isEmailValid } from 'fxa-shared/email/helpers';

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
  const goBack = useCallback(() => window.history.back(), []);

  const [createSecondaryEmail] = useMutation(CREATE_SECONDARY_EMAIL_MUTATION, {
    onError: (error) => {
      if (error.graphQLErrors?.length) {
        setErrorText(error.message);
      } else {
        alertBar.error(l10n.getString('add-secondary-email-error'));
        // TODO: old settings has no equivalent metrics event here
      }
    },
    update: (cache) => {
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
    },
    onCompleted: () => {
      navigate('emails/verify', { state: { email }, replace: true });
      // TODO: old settings has no equivalent metrics event here
    },
  });

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
        <VerifiedSessionGuard onDismiss={goBack} onError={goBack} />
        <form
          onSubmit={(ev) => {
            ev.preventDefault();
            if (inputRef.current) {
              createSecondaryEmail({
                variables: { input: { email } },
              });
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
                onClick={goBack}
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

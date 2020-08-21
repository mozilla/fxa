/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { useBooleanState } from 'fxa-react/lib/hooks';
import { gql, useMutation } from '@apollo/client';
import UnitRow from '../UnitRow';
import AlertBar from '../AlertBar';
import { useAccount, Email } from '../../models';
import sentryMetrics from 'fxa-shared/lib/sentry';
import { Link, useNavigate } from '@reach/router';

export const RESEND_SECONDARY_EMAIL_CODE_MUTATION = gql`
  mutation resendSecondaryEmailCode($input: EmailInput!) {
    resendSecondaryEmailCode(input: $input) {
      clientMutationId
    }
  }
`;

type UnitRowSecondaryEmailContentAndActionsProps = {
  secondary: Email;
  isLastVerifiedSecondaryEmail: boolean;
};

export const UnitRowSecondaryEmail = () => {
  const account = useAccount();
  const [alertBarRevealed, revealAlertBar, hideAlertBar] = useBooleanState();
  const [email, setEmail] = useState<string>();
  const navigate = useNavigate();
  const secondaryEmails = account.emails.filter((email) => !email.isPrimary);
  const hasAtLeastOneSecondaryEmail = !!secondaryEmails.length;
  const lastVerifiedSecondaryEmailIndex = secondaryEmails
    .map((email) => email.verified)
    .lastIndexOf(true);

  // TODO: DRY this up and don't import `sentryMetrics` into every component
  // needing a mutation - we must have an `onError` option in mutations
  // to allow tests to pass but providing one prevents an error from actually
  // throwing so we need to manually report it to Sentry.
  // See https://github.com/apollographql/react-apollo/issues/2614
  const [resendSecondaryEmailCode, { error }] = useMutation(
    RESEND_SECONDARY_EMAIL_CODE_MUTATION,
    {
      onError: (error) => {
        sentryMetrics.captureException(error);
        revealAlertBar();
      },
      onCompleted: () => {
        navigate('/beta/settings/emails/verify', { state: { email } });
      },
    }
  );

  const UnitRowSecondaryEmailNotSet = () => {
    // user doesn't have a secondary email (verified or unverified) set
    return (
      <UnitRow
        header="Secondary email"
        headerValue={null}
        route="/beta/settings/emails"
        {...{
          alertBarRevealed,
        }}
      >
        <SecondaryEmailDefaultContent />
      </UnitRow>
    );
  };

  const UnitRowSecondaryEmailContentAndActions = ({
    secondary: { email, verified },
    isLastVerifiedSecondaryEmail,
  }: UnitRowSecondaryEmailContentAndActionsProps) => {
    return (
      <div className="mobileLandscape:flex unit-row-multi-row">
        <div className="unit-row-content" data-testid="unit-row-content">
          <p className="font-bold" data-testid="unit-row-header-value">
            {email}
            {!verified && (
              <span
                data-testid="unverified-text"
                className="uppercase block text-orange-600 font-bold text-xs"
              >
                unverified
              </span>
            )}
          </p>
          {verified && isLastVerifiedSecondaryEmail && (
            <SecondaryEmailDefaultContent />
          )}
          {!verified && (
            <p className="text-xs mt-3 text-grey-400">
              Verification needed.
              <button
                className="link-blue mx-1"
                data-testid="resend-secondary-email-code-button"
                onClick={() => {
                  setEmail(email);
                  resendSecondaryEmailCode({
                    variables: { input: { email } },
                  });
                }}
              >
                Resend verification email
              </button>
              if it's not in your email or spam.
            </p>
          )}
        </div>
        <div className="unit-row-actions" data-testid="unit-row-actions">
          {verified && (
            <div>
              <button
                className="cta-neutral transition-standard"
                onClick={() => {
                  // Make secondaryEmail the primary email!
                }}
                data-testid="secondary-email-make-primary"
              >
                Make primary
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!hasAtLeastOneSecondaryEmail) {
    return <UnitRowSecondaryEmailNotSet />;
  }

  // user has at least one secondary email (verified or unverified) set
  return (
    <>
      {alertBarRevealed && error && (
        <AlertBar onDismiss={hideAlertBar}>
          <p data-testid="resend-secondary-email-code-error">
            Error text TBD. {error.message}
          </p>
        </AlertBar>
      )}
      <div className="unit-row">
        <div className="unit-row-header">
          <h3 data-testid="unit-row-header">Secondary email</h3>
        </div>
        <div className="mobileLandscape:flex-3 desktop:flex-5">
          {secondaryEmails.map((secondary, index) => (
            <UnitRowSecondaryEmailContentAndActions
              key={secondary.email}
              isLastVerifiedSecondaryEmail={
                index === lastVerifiedSecondaryEmailIndex
              }
              {...{
                secondary,
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
};

const SecondaryEmailDefaultContent = () => (
  <div data-testid="secondary-email-default-content">
    <p className="text-sm mt-3">
      Access your account if you can't log in to your primary email.
    </p>
    <p className="text-grey-400 text-xs mt-2">
      Note: a secondary email won't restore your information—you'll need a{' '}
      <a
        className="link-blue"
        href="#recovery-key"
        data-testid="link-recovery-key"
      >
        recovery key
      </a>{' '}
      for that.
    </p>
  </div>
);

export default UnitRowSecondaryEmail;

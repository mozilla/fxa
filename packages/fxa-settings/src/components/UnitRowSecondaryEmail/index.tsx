/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useRef } from 'react';
import { useBooleanState } from 'fxa-react/lib/hooks';
import { gql, useMutation } from '@apollo/client';
import { useFocusOnTriggeringElementOnClose } from '../../lib/hooks';
import UnitRow from '../UnitRow';
import Modal from '../Modal';
import AlertBar from '../AlertBar';
import { useAccount, Email } from '../../models';
import sentryMetrics from 'fxa-shared/lib/sentry';

export const RESEND_SECONDARY_EMAIL_CODE_MUTATION = gql`
  mutation resendSecondaryEmailCode($input: EmailInput!) {
    resendSecondaryEmailCode(input: $input) {
      clientMutationId
    }
  }
`;

type UnitRowSecondaryEmailContentAndActionsProps = {
  secondaryEmailObj: Email;
  isLastVerifiedSecondaryEmail: boolean;
};

export const UnitRowSecondaryEmail = () => {
  const account = useAccount();
  const primaryEmail = account.primaryEmail.email;
  const primaryEmailIsVerified = account.primaryEmail.verified;
  const secondaryEmails = account.emails.filter((email) => !email.isPrimary);
  const hasAtLeastOneSecondaryEmail = !!secondaryEmails.length;
  const lastVerifiedSecondaryEmailIndex = secondaryEmails
    .map((email) => email.verified)
    .lastIndexOf(true);

  const [alertBarRevealed, revealAlertBar, hideAlertBar] = useBooleanState();

  // TODO: DRY this up and don't import `sentryMetrics` into every component
  // needing a mutation - we must have an `onError` option in mutations
  // to allow tests to pass but providing one prevents an error from actually
  // throwing so we need to manually report it to Sentry.
  // See https://github.com/apollographql/react-apollo/issues/2614
  const [resendSecondaryEmailCode, { data, error }] = useMutation(
    RESEND_SECONDARY_EMAIL_CODE_MUTATION,
    {
      onError: (error) => {
        sentryMetrics.captureException(error);
      },
    }
  );

  const UnitRowSecondaryEmailNotSet = () => {
    const [modalRevealed, revealModal, hideModal] = useBooleanState();
    const modalHeaderId = 'modal-header-verify-email';
    const modalDescId = 'modal-desc-verify-email';

    const resendPrimaryEmailCodeFromModal = useCallback(() => {
      // Resend primary email verification code - part of FXA-1613
      hideModal();
      revealAlertBar();
    }, [hideModal]);

    const modalTriggerElement = useRef<HTMLButtonElement>(null);
    // If the UnitRow children contains an AlertBar that is revealed,
    // don't redirect focus back to the element that opened the modal
    // because focus will be set in the AlertBar.
    useFocusOnTriggeringElementOnClose(
      modalRevealed,
      modalTriggerElement,
      alertBarRevealed
    );
    const route = primaryEmailIsVerified
      ? '/beta/settings/secondary_email'
      : undefined;
    const revealModalIfPrimaryEmailIsNotVerified = primaryEmailIsVerified
      ? undefined
      : revealModal;

    // user doesn't have a secondary email (verified or unverified) set
    return (
      <UnitRow
        header="Secondary email"
        headerValue={null}
        revealModal={revealModalIfPrimaryEmailIsNotVerified}
        {...{
          route,
          modalRevealed,
          alertBarRevealed,
        }}
      >
        <SecondaryEmailDefaultContent />

        {modalRevealed && (
          <Modal
            onDismiss={hideModal}
            onConfirm={resendPrimaryEmailCodeFromModal}
            headerId={modalHeaderId}
            descId={modalDescId}
          >
            <h2
              id={modalHeaderId}
              className="font-bold text-xl text-center mb-2"
              data-testid={modalHeaderId}
            >
              Verify primary email first
            </h2>
            <p
              className="text-center"
              id={modalDescId}
              data-testid={modalDescId}
            >
              Before you can add a secondary email, you must verify your primary
              email. To do this, you'll need access to {primaryEmail}
            </p>
          </Modal>
        )}
      </UnitRow>
    );
  };

  const UnitRowSecondaryEmailContentAndActions = ({
    secondaryEmailObj,
    isLastVerifiedSecondaryEmail,
  }: UnitRowSecondaryEmailContentAndActionsProps) => {
    const secondaryEmail = secondaryEmailObj.email;
    const secondaryEmailIsVerified = secondaryEmailObj.verified;

    const resendSecondaryEmailCodeHandler = () => {
      resendSecondaryEmailCode({
        variables: { input: { email: secondaryEmail } },
      });
      revealAlertBar();
    };

    return (
      <>
        {alertBarRevealed && (data || error) && (
          <AlertBar onDismiss={hideAlertBar}>
            {data && (
              <p data-testid="resend-secondary-email-code-success">
                Check the inbox for {primaryEmail} to verify your secondary
                email.
              </p>
            )}
            {error && (
              <p data-testid="resend-secondary-email-code-error">
                Error text TBD. {error.message}
              </p>
            )}
          </AlertBar>
        )}
        <div className="mobileLandscape:flex unit-row-multi-row">
          <div className="unit-row-content" data-testid="unit-row-content">
            <p className="font-bold" data-testid="unit-row-header-value">
              {secondaryEmail}
              {!secondaryEmailIsVerified && (
                <span
                  data-testid="unverified-text"
                  className="uppercase block text-orange-600 font-bold text-xs"
                >
                  unverified
                </span>
              )}
            </p>
            {secondaryEmailIsVerified && isLastVerifiedSecondaryEmail && (
              <SecondaryEmailDefaultContent />
            )}
            {!secondaryEmailIsVerified && (
              <p className="text-xs mt-3 text-grey-400">
                Verification needed.
                <button
                  className="link-blue mx-1"
                  data-testid="resend-secondary-email-code-button"
                  onClick={resendSecondaryEmailCodeHandler}
                >
                  Resend verification email
                </button>
                if it's not in your email or spam.
              </p>
            )}
          </div>
          <div className="unit-row-actions" data-testid="unit-row-actions">
            {secondaryEmailIsVerified && (
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
      </>
    );
  };

  if (!hasAtLeastOneSecondaryEmail) {
    return <UnitRowSecondaryEmailNotSet />;
  }

  // user has at least one secondary email (verified or unverified) set
  return (
    <div className="unit-row">
      <div className="unit-row-header">
        <h3 data-testid="unit-row-header">Secondary email</h3>
      </div>
      <div className="mobileLandscape:flex-3 desktop:flex-5">
        {secondaryEmails.map((secondaryEmailObj, index) => (
          <UnitRowSecondaryEmailContentAndActions
            key={secondaryEmailObj.email}
            isLastVerifiedSecondaryEmail={
              index === lastVerifiedSecondaryEmailIndex
            }
            {...{
              secondaryEmailObj,
            }}
          />
        ))}
      </div>
    </div>
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

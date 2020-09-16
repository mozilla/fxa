/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { useBooleanState } from 'fxa-react/lib/hooks';
import AlertBar from '../AlertBar';
import Modal from '../Modal';
import UnitRow from '../UnitRow';
import VerifiedSessionGuard from '../VerifiedSessionGuard';
import { useAccount, useLazyAccount } from '../../models';
import { ButtonIconReload } from '../ButtonIcon';

export const DELETE_TOTP_MUTATION = gql`
  mutation deleteTotp($input: DeleteTotpInput!) {
    deleteTotp(input: $input) {
      clientMutationId
    }
  }
`;

export const UnitRowTwoStepAuth = () => {
  const { totp } = useAccount();
  const { exists } = totp;
  const [modalRevealed, revealModal, hideModal] = useBooleanState();
  const [alertBarRevealed, revealAlertBar, hideAlertBar] = useBooleanState();
  const [errorText, setErrorText] = useState<string>();
  const onError = (e: Error) => {
    setErrorText(e.message);
    hideModal();
    revealAlertBar();
  };

  const [getAccount, { accountLoading }] = useLazyAccount((error) => {
    setErrorText(
      'Sorry, there was a problem refreshing two-step authentication.'
    );
    revealAlertBar();
  });

  const [disableTwoStepAuth] = useMutation(DELETE_TOTP_MUTATION, {
    variables: { input: {} },
    onCompleted: () => {
      hideModal();
      revealAlertBar();
    },
    onError,
    ignoreResults: true,
    update: (cache) => {
      cache.modify({
        fields: {
          account: (existing) => {
            return { ...existing, totp: { exists: false, verified: false } };
          },
        },
      });
    },
  });

  const conditionalUnitRowProps = exists
    ? {
        headerValueClassName: 'text-green-800',
        headerValue: 'Enabled',
        ctaText: 'Change',
        secondaryCtaText: 'Disable',
        secondaryButtonClassName: 'cta-caution',
        revealSecondaryModal: revealModal,
      }
    : {
        headerValue: null,
        noHeaderValueText: 'Not Set',
        ctaText: 'Add',
        secondaryCtaText: undefined,
        revealSecondaryModal: undefined,
      };

  return (
    <UnitRow
      header="Two-step authentication"
      route="/beta/settings/two_step_authentication"
      {...conditionalUnitRowProps}
      headerContent={
        <ButtonIconReload
          title="Refresh two-step authentication"
          classNames="mobileLandscape:hidden"
          disabled={accountLoading}
          onClick={getAccount}
        />
      }
      actionContent={
        <ButtonIconReload
          title="Refresh two-step authentication"
          classNames="hidden mobileLandscape:inline-block"
          testId="two-step-refresh"
          disabled={accountLoading}
          onClick={getAccount}
        />
      }
    >
      <p className="text-sm mt-3">
        Prevent someone else from logging in by requiring a unique code only you
        have access to.
      </p>
      {modalRevealed && (
        <VerifiedSessionGuard onDismiss={hideModal} onError={onError}>
          <Modal
            onDismiss={hideModal}
            onConfirm={disableTwoStepAuth}
            headerId="two-step-auth-disable-header"
            descId="two-step-auth-disable-description"
            confirmText="Disable"
            confirmBtnClassName="cta-caution"
          >
            <h2
              className="font-bold text-xl text-center mb-2"
              data-testid="disable-totp-modal-header"
            >
              Disable two-step authentication?
            </h2>
            {/* "replacing recovery codes" link below will actually drop you into
            recovery codes flow in the future. */}
            <p className="text-center">
              You won't be able to undo this action. You also have the option of{' '}
              <LinkExternal
                className="link-blue"
                href="https://support.mozilla.org/en-US/kb/reset-your-firefox-account-password-recovery-keys"
              >
                replacing your recovery codes
              </LinkExternal>
              .
            </p>
          </Modal>
        </VerifiedSessionGuard>
      )}
      {alertBarRevealed && (
        <AlertBar
          onDismiss={hideAlertBar}
          type={errorText ? 'error' : 'success'}
        >
          {errorText ? (
            <p data-testid="delete-totp-error">Error text TBD. {errorText}</p>
          ) : (
            <p data-testid="delete-totp-success">
              Two-step authentication disabled
            </p>
          )}
        </AlertBar>
      )}
    </UnitRow>
  );
};

export default UnitRowTwoStepAuth;

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { gql } from '@apollo/client';
import LinkExternal from 'fxa-react/components/LinkExternal';
import { useBooleanState } from 'fxa-react/lib/hooks';
import { useAlertBar } from '../../lib/hooks';
import AlertBar from '../AlertBar';
import Modal from '../Modal';
import UnitRow from '../UnitRow';
import VerifiedSessionGuard from '../VerifiedSessionGuard';
import { useAccount, useLazyTotpStatus } from '../../models';
import { ButtonIconReload } from '../ButtonIcon';
import { HomePath } from '../../constants';
import { Localized, useLocalization } from '@fluent/react';
import { useAuthClient } from '../../lib/auth';
import { cache } from '../../lib/cache';

const route = `${HomePath}/two_step_authentication`;
const replaceCodesRoute = `${route}/replace_codes`;

export const DELETE_TOTP_MUTATION = gql`
  mutation deleteTotp($input: DeleteTotpInput!) {
    deleteTotp(input: $input) {
      clientMutationId
    }
  }
`;

export const UnitRowTwoStepAuth = () => {
  const alertBar = useAlertBar();
  const {
    totp: { exists, verified },
  } = useAccount();
  const [modalRevealed, revealModal, hideModal] = useBooleanState();
  const [
    secondaryModalRevealed,
    revealSecondaryModal,
    hideSecondaryModal,
  ] = useBooleanState();
  const { l10n } = useLocalization();

  const [getTotpStatus, { totpStatusLoading }] = useLazyTotpStatus(() => {
    hideModal();
    alertBar.success(
      l10n.getString(
        'tfa-row-cannot-refresh',
        null,
        'Sorry, there was a problem refreshing two-step authentication.'
      )
    );
  });

  const disableTwoStepAuth = useAuthClient(
    (auth, sessionToken) => () => auth.deleteTotpToken(sessionToken),
    {
      onSuccess: () => {
        cache.modify({
          id: cache.identify({ __typename: 'Account' }),
          fields: {
            totp() {
              return { exists: false, verified: false };
            },
          },
        });
        hideModal();
        alertBar.success(
          l10n.getString(
            'tfa-row-disabled',
            null,
            'Two-step authentication disabled.'
          )
        );
      },
      onError: () => {
        hideModal();
        alertBar.error(
          l10n.getString(
            'tfa-row-cannot-disable',
            null,
            'Two-step authentication could not be disabled.'
          )
        );
      },
    }
  );

  const conditionalUnitRowProps =
    exists && verified
      ? {
          headerValueClassName: 'text-green-800',
          headerValue: l10n.getString('tfa-row-enabled', null, 'Enabled'),
          secondaryCtaText: l10n.getString(
            'tfa-row-action-disable',
            null,
            'Disable'
          ),
          secondaryButtonClassName: 'cta-caution',
          secondaryButtonTestId: 'two-step-disable-button',
          // The naming of this is a bit confusing, since they are swapped in this
          // case, we should come up with a better name here. Filed FXA-2539
          revealModal: revealSecondaryModal,
          revealSecondaryModal: revealModal,
          hideCtaText: true,
        }
      : {
          headerValue: null,
          noHeaderValueText: l10n.getString('tfa-row-not-set', null, 'Not set'),
          ctaText: l10n.getString('tfa-row-action-add', null, 'Add'),
          secondaryCtaText: undefined,
          revealSecondaryModal: undefined,
        };

  return (
    <UnitRow
      header={l10n.getString('tfa-row-header')}
      headerId="two-step-authentication"
      prefixDataTestId="two-step"
      route={route}
      {...conditionalUnitRowProps}
      headerContent={
        <Localized id="tfa-row-button-refresh" attrs={{ title: true }}>
          <ButtonIconReload
            title="Refresh two-step authentication"
            classNames="ltr:ml-1 rtl:mr-1 mobileLandscape:hidden"
            disabled={totpStatusLoading}
            onClick={getTotpStatus}
          />
        </Localized>
      }
      actionContent={
        <Localized id="tfa-row-button-refresh" attrs={{ title: true }}>
          <ButtonIconReload
            title="Refresh two-step authentication"
            classNames="hidden ltr:ml-1 rtl:mr-1 mobileLandscape:inline-block"
            testId="two-step-refresh"
            disabled={totpStatusLoading}
            onClick={getTotpStatus}
          />
        </Localized>
      }
    >
      <Localized id="tfa-row-content-explain">
        <p className="text-sm mt-3">
          Prevent someone else from logging in by requiring a unique code only
          you have access to.
        </p>
      </Localized>
      {modalRevealed && (
        <VerifiedSessionGuard
          onDismiss={hideModal}
          onError={(error) => {
            hideModal();
            alertBar.error(error.message, error);
          }}
        >
          <Modal
            onDismiss={hideModal}
            onConfirm={() => disableTwoStepAuth.execute()}
            headerId="two-step-auth-disable-header"
            descId="two-step-auth-disable-description"
            confirmText={l10n.getString(
              'tfa-row-disable-modal-confirm',
              null,
              'Disable'
            )}
            confirmBtnClassName="cta-caution"
          >
            <Localized id="tfa-row-disable-modal-heading">
              <h2
                className="font-bold text-xl text-center mb-2"
                data-testid="disable-totp-modal-header"
              >
                Disable two-step authentication?
              </h2>
            </Localized>
            {/* "replacing recovery codes" link below will actually drop you into
            recovery codes flow in the future. */}
            <Localized
              id="tfa-row-disable-modal-explain"
              elems={{
                linkExternal: (
                  <LinkExternal
                    className="link-blue"
                    href="https://support.mozilla.org/en-US/kb/changing-your-two-step-authentication-device-firefox-account"
                  >
                    {' '}
                  </LinkExternal>
                ),
              }}
            >
              <p className="text-center">
                You won't be able to undo this action. You also have the option
                of{' '}
                <LinkExternal
                  className="link-blue"
                  href="https://support.mozilla.org/en-US/kb/reset-your-firefox-account-password-recovery-keys"
                >
                  replacing your recovery codes
                </LinkExternal>
                .
              </p>
            </Localized>
          </Modal>
        </VerifiedSessionGuard>
      )}
      {secondaryModalRevealed && (
        <VerifiedSessionGuard
          onDismiss={hideSecondaryModal}
          onError={(error) => {
            hideModal();
            alertBar.error(
              l10n.getString(
                'tfa-row-cannot-verify-session-2',
                null,
                'Sorry, there was a problem verifying your session.'
              ),
              error
            );
          }}
        >
          <Modal
            onDismiss={hideSecondaryModal}
            headerId="two-step-auth-change-codes-header"
            descId="two-step-auth-change-codes-description"
            confirmText={l10n.getString(
              'tfa-row-change-modal-confirm',
              null,
              'Change'
            )}
            confirmBtnClassName="cta-primary"
            route={replaceCodesRoute}
          >
            <Localized id="tfa-row-change-modal-heading">
              <h2
                className="font-bold text-xl text-center mb-2"
                data-testid="change-codes-modal-header"
              >
                Change recovery codes?
              </h2>
            </Localized>
            <Localized id="tfa-row-change-modal-explain">
              <p className="text-center">
                You won't be able to undo this action.
              </p>
            </Localized>
          </Modal>
        </VerifiedSessionGuard>
      )}
      {alertBar.visible && (
        <AlertBar onDismiss={alertBar.hide} type={alertBar.type}>
          <p data-testid={`delete-totp-${alertBar.type}`}>{alertBar.content}</p>
        </AlertBar>
      )}
    </UnitRow>
  );
};

export default UnitRowTwoStepAuth;

/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback } from 'react';
import { useBooleanState } from 'fxa-react/lib/hooks';
import UnitRow from '../UnitRow';
import Modal from '../Modal';
import AlertBar from '../AlertBar';

type UnitRowSecondaryEmailProps = {
  primaryEmail: string;
};

export const UnitRowSecondaryEmail = ({ primaryEmail }: UnitRowSecondaryEmailProps) => {
  const [alertBarRevealed, revealAlertBar, hideAlertBar] = useBooleanState();
  const [modalRevealed, revealModal, hideModal] = useBooleanState();

  const modalHeaderId = 'modal-header-verify-email';
  const modalDescId = 'modal-desc-verify-email';

  const onSecondaryEmailConfirm = useCallback(() => {
    console.log('confirmed - resend verification code');
    hideModal();
    revealAlertBar();
  }, [hideModal, revealAlertBar]);

  return (
      <UnitRow
        header="Secondary email"
        headerValue={null}
        {...{
          revealModal,
          modalRevealed,
          alertBarRevealed
        }}
      >
        <p className="text-sm mt-3">
          Access your account if you can't log in to your primary email.
        </p>
        <p className="text-grey-400 text-xs mt-2">
          Note: a secondary email won't restore your information—you'll need
          a{' '}
          <a className="link-blue" href="#recovery-key">
            recovery key
          </a>{' '}
          for that.
        </p>

        {modalRevealed && (
          <Modal
            onDismiss={hideModal}
            onConfirm={onSecondaryEmailConfirm}
            headerId={modalHeaderId}
            descId={modalDescId}
          >
            <h2
              id={modalHeaderId}
              className="font-bold text-xl text-center mb-2"
            >
              Verify primary email first
            </h2>
            <p className="text-center" id={modalDescId}>
              Before you can add a secondary email, you must verify your
              primary email. To do this, you'll need access to{' '}
              {primaryEmail}
            </p>
          </Modal>
        )}

        {alertBarRevealed && (
          <AlertBar onDismiss={hideAlertBar}>
            <p>Check the inbox for {primaryEmail} to verify your primary email.</p>
          </AlertBar>
        )}
      </UnitRow>
  );
};

export default UnitRowSecondaryEmail;

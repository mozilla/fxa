/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback } from 'react';
import { useBooleanState } from 'fxa-react/lib/hooks';
import UnitRow from '../UnitRow';
import UnitRowWithAvatar from '../UnitRowWithAvatar';
import Modal from '../Modal';
import AlertBar from '../AlertBar';

export const Settings = ({ account }: { account: AccountData }) => {
  const [modalRevealed, revealModal, hideModal] = useBooleanState();
  const [alertBarRevealed, revealAlertBar, hideAlertBar] = useBooleanState();

  const onSecondaryEmailConfirm = useCallback(() => {
    console.log('confirmed - resend verification code');
    hideModal();
    revealAlertBar();
  }, [hideModal, revealAlertBar]);

  const modalHeaderId = 'modal-header-verify-email';
  const modalDescId = 'modal-desc-verify-email';

  const primaryEmail = account.emails.find((email) => email.isPrimary)!;

  return (
    <>
      {/*
       * While this is where the AlertBar needs to be in the DOM, it won't be composed here
       * like this. We likely need some sort of alert bar root element and then AlertBar
       * can return a React.Portal hooking into this element via a ref so that we can freely
       * use <AlertBar> with content where needed while its placement in the DOM remains
       * here. Details will be worked out in FXA-1628.
       */}
      {alertBarRevealed && (
        <AlertBar onDismiss={hideAlertBar}>
          <p>
            Check the inbox for {primaryEmail.email} to verify your primary
            email.
          </p>
        </AlertBar>
      )}
      <section className="mt-11" id="profile" data-testid="settings-profile">
        <h2 className="font-header font-bold ml-4 mb-4">Profile</h2>

        <div className="bg-white tablet:rounded-xl shadow">
          <UnitRowWithAvatar avatarUrl={account.avatarUrl} />

          <hr className="unit-row-hr" />

          <UnitRow
            header="Display name"
            headerValue={account.displayName}
            route="#"
          />

          <hr className="unit-row-hr" />

          <UnitRow
            header="Password"
            headerValueClassName="tracking-wider"
            headerValue="••••••••••••••••••"
            route="#"
          >
            <p className="text-grey-400 text-xs mobileLandscape:mt-3">
              Created {account.passwordCreated}
            </p>
          </UnitRow>

          <hr className="unit-row-hr" />

          {/*
          /* TO DO: primary/secondary email section with
          /* verified status and number of secondary emails
          /* taken into account
          */}
          <UnitRow header="Primary email" headerValue={primaryEmail.email} />

          <hr className="unit-row-hr" />

          <UnitRow
            header="Secondary email"
            headerValue={null}
            {...{
              revealModal,
              modalRevealed,
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
                  {primaryEmail.email}
                </p>
              </Modal>
            )}
          </UnitRow>
        </div>
      </section>
    </>
  );
};

export default Settings;

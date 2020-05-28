/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback } from 'react';
import { useBooleanState } from 'fxa-react/lib/hooks';
import { useQuery } from '@apollo/client';
import AppErrorDialog from 'fxa-react/components/AppErrorDialog';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import UnitRow from '../UnitRow';
import UnitRowWithImage from '../UnitRowWithImage';
import Modal from '../Modal';
import { GET_ACCOUNT, accountData } from './gql';

export const Settings = () => {
  const { loading, error, data } = useQuery(GET_ACCOUNT);
  const [modalRevealed, revealModal, hideModal] = useBooleanState();
  const onSecondaryEmailConfirm = useCallback(() => {
    console.log('confirmed - resend verification code');
    hideModal();
  }, [hideModal]);

  const modalHeaderId = 'modal-header-verify-email';
  const modalDescId = 'modal-desc-verify-email';

  if (loading) {
    return (
      <LoadingSpinner className="bg-grey-20 flex items-center flex-col justify-center h-screen select-none" />
    );
  }

  if (error) {
    return <AppErrorDialog data-testid="error-dialog" {...{ error }} />;
  }

  const account: accountData = data.account;
  const primaryEmail = account.emails.find((email) => email.isPrimary)!;
  // const secondaryEmails = account.emails.filter((email) => !email.isPrimary);

  return (
    <main data-testid="settings-container" className="bg-grey-20 min-h-screen">
      <h2>Settings</h2>
      <section>
        <h3>Profile</h3>

        <UnitRowWithImage
          header="Picture"
          imageUrl={account.avatarUrl}
          alt="Your avatar"
          route="#"
        />

        {account.displayName && (
          <UnitRow
            header="Display name"
            headerValue={account.displayName}
            route="#"
          />
        )}

        <UnitRow header="Password" headerValue="********" route="#">
          <p>Created {account.passwordCreated}</p>
        </UnitRow>

        {/*
        /* TO DO: primary/secondary email section with
        /* verified status and number of secondary emails
        /* taken into account
        */}
        <UnitRow header="Primary email" headerValue={primaryEmail.email} />

        <UnitRow
          header="Secondary email"
          headerValue={null}
          {...{
            revealModal,
            modalRevealed,
          }}
        >
          <p>Access your account if you can't log in to your primary email.</p>
          <p>
            Note: a secondary email won't restore your information—you'll need a{' '}
            <a href="#recovery-key">recovery key</a> for that.
          </p>

          {modalRevealed && (
            <Modal
              onDismiss={hideModal}
              onConfirm={onSecondaryEmailConfirm}
              headerId={modalHeaderId}
              descId={modalDescId}
            >
              <h2 id={modalHeaderId}>Verify primary email first</h2>
              <p id={modalDescId}>
                Before you can add a secondary email, you must verify your
                primary email. To do this, you'll need access to{' '}
                {primaryEmail.email}
              </p>
            </Modal>
          )}
        </UnitRow>
      </section>
    </main>
  );
};

export default Settings;

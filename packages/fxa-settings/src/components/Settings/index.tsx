/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback } from 'react';
import { useBooleanState } from 'fxa-react/lib/hooks';
import UnitRow from '../UnitRow';
import UnitRowWithImage from '../UnitRowWithImage';
import Modal from '../Modal';

const MOCK_ACCOUNT_DATA = {
  displayName: 'Fred Flinstone',
  avatarUrl: null,
  passwordCreated: 123456789,
  emails: [
    {
      email: 'user@example.com',
      isPrimary: true,
      verified: true,
    },
    {
      email: 'user2@example.com',
      isPrimary: false,
      verified: true,
    },
  ],
};

export const Settings = () => {
  const primaryEmail =
    MOCK_ACCOUNT_DATA.emails.find((email) => email.isPrimary === true) ||
    MOCK_ACCOUNT_DATA.emails[0];
  const [modalRevealed, revealModal, hideModal] = useBooleanState();
  const onSecondaryEmailConfirm = useCallback(() => {
    console.log('confirmed - resend verification code');
    hideModal();
  }, [hideModal]);

  return (
    <main>
      <h2>Settings</h2>
      <section>
        <h3>Profile</h3>

        <UnitRowWithImage
          header="Picture"
          imageUrl={MOCK_ACCOUNT_DATA.avatarUrl}
          alt="Your avatar"
          route="#"
        />

        <UnitRow
          header="Display name"
          headerValue={MOCK_ACCOUNT_DATA.displayName}
          route="#"
        />

        <UnitRow header="Password" headerValue="********" route="#">
          <p>Created {MOCK_ACCOUNT_DATA.passwordCreated}</p>
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
          {...{ revealModal }}
        >
          <p>Access your account if you can't log in to your primary email.</p>
          <p>
            Note: a secondary email won't restore your information—you'll need a{' '}
            <a href="#recovery-key">recovery key</a> for that.
          </p>

          {modalRevealed && (
            <Modal onDismiss={hideModal} onConfirm={onSecondaryEmailConfirm}>
              <h2>Verify primary email first</h2>
              <p>
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

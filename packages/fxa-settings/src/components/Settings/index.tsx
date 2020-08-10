/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import UnitRow from '../UnitRow';
import UnitRowWithAvatar from '../UnitRowWithAvatar';
import Security from '../Security';
import UnitRowSecondaryEmail from '../UnitRowSecondaryEmail';

import { useAccount } from '../../models';

export const Settings = () => {
  const {
    primaryEmail,
    displayName,
    avatarUrl,
    passwordCreated,
    recoveryKey,
  } = useAccount();

  return (
    <>
      <section className="mt-11" id="profile" data-testid="settings-profile">
        <h2 className="font-header font-bold ml-4 mb-4">Profile</h2>

        <div className="bg-white tablet:rounded-xl shadow">
          <UnitRowWithAvatar avatarUrl={avatarUrl} />

          <hr className="unit-row-hr" />

          <UnitRow header="Display name" headerValue={displayName} route="#" />

          <hr className="unit-row-hr" />

          <UnitRow
            header="Password"
            headerValueClassName="tracking-wider"
            headerValue="••••••••••••••••••"
            route="#"
          >
            <p className="text-grey-400 text-xs mobileLandscape:mt-3">
              Created {passwordCreated}
            </p>
          </UnitRow>

          <hr className="unit-row-hr" />

          <UnitRow header="Primary email" headerValue={primaryEmail.email} />

          <hr className="unit-row-hr" />

          <UnitRowSecondaryEmail primaryEmail={primaryEmail.email} />
        </div>
      </section>

      <Security
        accountRecoveryKeyEnabled={recoveryKey}
        twoFactorAuthEnabled={false}
      />
    </>
  );
};

export default Settings;

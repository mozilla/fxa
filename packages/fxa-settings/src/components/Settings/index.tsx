/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import UnitRow from '../UnitRow';
import UnitRowWithAvatar from '../UnitRowWithAvatar';
import Security from '../Security';
import UnitRowSecondaryEmail from '../UnitRowSecondaryEmail';
import { RouteComponentProps } from '@reach/router';
import AlertExternal from '../AlertExternal';
import * as Metrics from '../../lib/metrics';

import { useAccount } from '../../models';

export const Settings = (_: RouteComponentProps) => {
  const {
    primaryEmail,
    displayName,
    avatarUrl,
    passwordCreated,
    recoveryKey,
    uid,
  } = useAccount();

  Metrics.setProperties({
    lang: document.querySelector('html')?.getAttribute('lang'),
    uid,
  });

  const pwdDateText = Intl.DateTimeFormat('default', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(new Date(passwordCreated));

  return (
    <>
      <AlertExternal />
      <section className="mt-11" id="profile" data-testid="settings-profile">
        <h2 className="font-header font-bold ml-4 mb-4">Profile</h2>

        <div className="bg-white tablet:rounded-xl shadow">
          <UnitRowWithAvatar avatarUrl={avatarUrl} />

          <hr className="unit-row-hr" />

          <UnitRow
            header="Display name"
            headerValue={displayName}
            route="/beta/settings/display_name"
          />

          <hr className="unit-row-hr" />

          <UnitRow
            header="Password"
            headerValueClassName="tracking-wider"
            headerValue="••••••••••••••••••"
            route="/beta/settings/change_password"
          >
            <p className="text-grey-400 text-xs mobileLandscape:mt-3">
              Created {pwdDateText}
            </p>
          </UnitRow>

          <hr className="unit-row-hr" />

          <UnitRow header="Primary email" headerValue={primaryEmail.email} />

          <hr className="unit-row-hr" />

          <UnitRowSecondaryEmail />
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

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import UnitRow from '../UnitRow';
import UnitRowRecoveryKey from '../UnitRowRecoveryKey';

type SecurityProps = {
  twoFactorAuthEnabled: boolean;
  className?: string;
};

export const Security = ({ twoFactorAuthEnabled }: SecurityProps) => {
  const getValue = (settingOption: boolean) =>
    settingOption ? 'Enabled' : 'Not Set';
  const getClassName = (settingOption: boolean) =>
    settingOption ? 'text-green-800' : '';
  return (
    <section className="mt-11" id="security" data-testid="settings-security">
      <h2 className="font-header font-bold ml-4 mb-4">Security</h2>
      <div className="bg-white tablet:rounded-xl shadow">
        <UnitRowRecoveryKey />
        <hr className="unit-row-hr" />
        <UnitRow
          header="Two-step authentication"
          headerValueClassName={getClassName(twoFactorAuthEnabled)}
          headerValue={getValue(twoFactorAuthEnabled)}
          route="/beta/settings/two_step_authentication"
        >
          <p className="text-sm mt-3">
            Prevent someone else from logging in by requiring a unique code only
            you have access to.
          </p>
        </UnitRow>
      </div>
    </section>
  );
};

export default Security;

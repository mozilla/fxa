/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Localized } from '@fluent/react';
import React from 'react';
import UnitRowRecoveryKey from '../UnitRowRecoveryKey';
import UnitRowTwoStepAuth from '../UnitRowTwoStepAuth';
import { UnitRow } from '../UnitRow';
import { useAccount } from '../../models';

export const Security = () => {
  const { passwordCreated } = useAccount();

  const pwdDateText = Intl.DateTimeFormat('default', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).format(new Date(passwordCreated));

  return (
    <section className="mt-11" data-testid="settings-security">
      <h2 className="font-header font-bold mobileLandscape:ltr:ml-6 mobileLandscape:rtl:ml-6 ltr:ml-4 rtl:mr-4 mb-4 relative">
        <span id="security" className="nav-anchor"></span>
        <Localized id="security-heading">Security</Localized>
      </h2>
      <div className="bg-white tablet:rounded-xl shadow">
        <Localized id="security-password" attrs={{ header: true }}>
          <UnitRow
            header="Password"
            headerId="password"
            headerValueClassName="tracking-wider"
            headerValue="••••••••••••••••••"
            route="/settings/change_password"
            prefixDataTestId="password"
          >
            <Localized
              id="security-password-created-date"
              vars={{ date: pwdDateText }}
            >
              <p className="text-grey-400 text-xs mobileLandscape:mt-3">
                Created {pwdDateText}
              </p>
            </Localized>
          </UnitRow>
        </Localized>
        <hr className="unit-row-hr" />

        <UnitRowRecoveryKey />
        <hr className="unit-row-hr" />
        <UnitRowTwoStepAuth />
      </div>
    </section>
  );
};

export default Security;

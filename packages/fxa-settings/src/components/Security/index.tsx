/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Localized, useLocalization } from '@fluent/react';
import React from 'react';
import UnitRowRecoveryKey from '../UnitRowRecoveryKey';
import UnitRowTwoStepAuth from '../UnitRowTwoStepAuth';
import { UnitRow } from '../UnitRow';
import { useAccount } from '../../models';

const PwdDate = ({ passwordCreated }: { passwordCreated: number }) => {
  const pwdDateText = Intl.DateTimeFormat('default', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).format(new Date(passwordCreated));

  return (
    <Localized id="security-password-created-date" vars={{ date: pwdDateText }}>
      <p className="text-grey-400 text-xs mobileLandscape:mt-3">
        Created {pwdDateText}
      </p>
    </Localized>
  );
};

export const Security = () => {
  const { passwordCreated, hasPassword } = useAccount();
  const { l10n } = useLocalization();
  const localizedNotSet = l10n.getString('security-not-set', null, 'Not Set');

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
            headerValueClassName={hasPassword ? 'tracking-wider' : undefined}
            headerValue={hasPassword ? '••••••••••••••••••' : null}
            noHeaderValueText={localizedNotSet}
            ctaText={
              hasPassword
                ? undefined
                : l10n.getString('security-action-create', null, 'Create')
            }
            route={
              hasPassword
                ? '/settings/change_password'
                : '/settings/create_password'
            }
            prefixDataTestId="password"
            isLevelWithRefreshButton={true}
          >
            {hasPassword ? (
              <PwdDate {...{ passwordCreated }} />
            ) : (
              <Localized id="security-set-password">
                <p className="text-sm mt-3">
                  Set a password to use Firefox Sync and certain account
                  security features.
                </p>
              </Localized>
            )}
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

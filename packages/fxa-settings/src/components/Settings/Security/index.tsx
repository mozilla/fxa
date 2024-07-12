/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Localized, useLocalization } from '@fluent/react';
import React, { forwardRef } from 'react';
import UnitRowRecoveryKey from '../UnitRowRecoveryKey';
import UnitRowTwoStepAuth from '../UnitRowTwoStepAuth';
import { UnitRow } from '../UnitRow';
import { useAccount } from '../../../models';
import {
  FtlMsg,
  getLocalizedDate,
  LocalizedDateOptions,
} from 'fxa-react/lib/utils';
import { Link } from '@reach/router';
import GleanMetrics from '../../../lib/glean';

const PwdDate = ({ passwordCreated }: { passwordCreated: number }) => {
  const pwdDateText = Intl.DateTimeFormat('default', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).format(new Date(passwordCreated));

  const pwdDateFluent = getLocalizedDate(
    passwordCreated,
    LocalizedDateOptions.NumericDate
  );

  return (
    <FtlMsg id="security-password-created-date" vars={{ date: pwdDateFluent }}>
      <p className="text-grey-400 text-xs mobileLandscape:mt-3">
        Created {pwdDateText}
      </p>
    </FtlMsg>
  );
};

export const Security = forwardRef<HTMLDivElement>((_, ref) => {
  const { passwordCreated, hasPassword } = useAccount();
  const { l10n } = useLocalization();
  const localizedNotSet = l10n.getString('security-not-set', null, 'Not Set');

  return (
    <section
      className="mt-11"
      data-testid="settings-security"
      {...{ ref }}
      id="security-section"
    >
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
            ctaOnClickAction={() => {
              GleanMetrics.accountPref.changePasswordSubmit();
            }}
          >
            {hasPassword ? (
              <PwdDate {...{ passwordCreated }} />
            ) : (
              <Localized id="security-set-password">
                <p className="text-sm mt-3">
                  Set a password to sync and use certain account security
                  features.
                </p>
              </Localized>
            )}
          </UnitRow>
        </Localized>
        <hr className="unit-row-hr" />

        <UnitRowRecoveryKey />
        <hr className="unit-row-hr" />
        <UnitRowTwoStepAuth />

        <hr className="unit-row-hr" />

        <div className="px-5 pt-4 pb-6">
          <div className="text-center mobileLandscape:text-start">
            <Localized id="security-recent-activity-link">
              <Link
                data-testid="settings-recent-activity"
                className="link-blue text-sm"
                to="/settings/recent_activity"
              >
                View recent account activity
              </Link>
            </Localized>
          </div>
        </div>
      </div>
    </section>
  );
});

export default Security;

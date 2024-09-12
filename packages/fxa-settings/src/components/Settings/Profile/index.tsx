/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { forwardRef } from 'react';
import { useAccount } from '../../../models';
import { UnitRow } from '../UnitRow';
import { UnitRowSecondaryEmail } from '../UnitRowSecondaryEmail';
import { SETTINGS_PATH } from '../../../constants';
import { FtlMsg } from 'fxa-react/lib/utils';
import GleanMetrics from '../../../lib/glean';

export const Profile = forwardRef<HTMLDivElement>((_, ref) => {
  const { avatar, primaryEmail, displayName } = useAccount();

  return (
    <section data-testid="settings-profile" {...{ ref }} id="profile-section">
      <h2 className="font-header font-bold mobileLandscape:ms-6 ms-4 mb-4 relative">
        <span id="profile" className="nav-anchor"></span>
        <FtlMsg id="profile-heading">Profile</FtlMsg>
      </h2>

      <div className="bg-white tablet:rounded-xl shadow">
        <FtlMsg id="profile-picture" attrs={{ header: true }}>
          <UnitRow
            header="Picture"
            headerId="profile-picture"
            headerValue={!avatar.isDefault}
            route={`${SETTINGS_PATH}/avatar`}
            prefixDataTestId="avatar"
            {...{ avatar }}
          />
        </FtlMsg>

        <hr className="unit-row-hr" />

        <FtlMsg id="profile-display-name" attrs={{ header: true }}>
          <UnitRow
            header="Display name"
            headerId="display-name"
            headerValue={displayName || undefined}
            headerValueClassName="break-all"
            route="/settings/display_name"
            ctaOnClickAction={() =>
              GleanMetrics.accountPref.displayNameSubmit()
            }
            prefixDataTestId="display-name"
          />
        </FtlMsg>

        <hr className="unit-row-hr" />

        <FtlMsg id="profile-primary-email" attrs={{ header: true }}>
          <UnitRow
            header="Primary email"
            headerId="primary-email"
            headerValue={primaryEmail.email}
            headerValueClassName="break-all"
            prefixDataTestId="primary-email"
          />
        </FtlMsg>

        <hr className="unit-row-hr" />

        <UnitRowSecondaryEmail />
      </div>
    </section>
  );
});

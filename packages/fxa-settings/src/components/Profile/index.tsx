import React from 'react';
import { useAccount } from '../../models';
import { UnitRow } from '../UnitRow';
import { UnitRowWithAvatar } from '../UnitRowWithAvatar';
import { UnitRowSecondaryEmail } from '../UnitRowSecondaryEmail';
import { Localized } from '@fluent/react';

export const Profile = () => {
  const { primaryEmail, displayName, passwordCreated } = useAccount();

  const pwdDateText = Intl.DateTimeFormat('default', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(new Date(passwordCreated));

  return (
    <section className="mt-11" data-testid="settings-profile">
      <h2 className="font-header font-bold ltr:ml-4 rtl:mr-4 mb-4 relative">
        <span id="profile" className="nav-anchor"></span>
        <Localized id="profile-heading">Profile</Localized>
      </h2>

      <div className="bg-white tablet:rounded-xl shadow">
        <UnitRowWithAvatar />

        <hr className="unit-row-hr" />

        <Localized id="profile-display-name" attrs={{ header: true }}>
          <UnitRow
            header="Display name"
            headerValue={displayName}
            headerValueClassName="break-all"
            route="/beta/settings/display_name"
            prefixDataTestId="display-name"
          />
        </Localized>

        <hr className="unit-row-hr" />

        <Localized id="profile-password" attrs={{ header: true }}>
          <UnitRow
            header="Password"
            headerValueClassName="tracking-wider"
            headerValue="••••••••••••••••••"
            route="/beta/settings/change_password"
            prefixDataTestId="password"
          >
            <Localized
              id="profile-password-created-date"
              vars={{ date: pwdDateText }}
            >
              <p className="text-grey-400 text-xs mobileLandscape:mt-3">
                Created {pwdDateText}
              </p>
            </Localized>
          </UnitRow>
        </Localized>

        <hr className="unit-row-hr" />

        <Localized id="profile-primary-email" attrs={{ header: true }}>
          <UnitRow
            header="Primary email"
            headerValue={primaryEmail.email}
            headerValueClassName="break-all"
            prefixDataTestId="primary-email"
          />
        </Localized>

        <hr className="unit-row-hr" />

        <UnitRowSecondaryEmail />
      </div>
    </section>
  );
};

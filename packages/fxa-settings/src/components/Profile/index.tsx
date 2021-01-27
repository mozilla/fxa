import React from 'react';
import { useAccount } from '../../models';
import { UnitRow } from '../UnitRow';
import { UnitRowWithAvatar } from '../UnitRowWithAvatar';
import { UnitRowSecondaryEmail } from '../UnitRowSecondaryEmail';

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
        <span id="profile" className="nav-anchor"></span>Profile
      </h2>

      <div className="bg-white tablet:rounded-xl shadow">
        <UnitRowWithAvatar />

        <hr className="unit-row-hr" />

        <UnitRow
          header="Display name"
          headerValue={displayName}
          headerValueClassName="break-all"
          route="/beta/settings/display_name"
          prefixDataTestId="display-name"
        />

        <hr className="unit-row-hr" />

        <UnitRow
          header="Password"
          headerValueClassName="tracking-wider"
          headerValue="••••••••••••••••••"
          route="/beta/settings/change_password"
          prefixDataTestId="password"
        >
          <p className="text-grey-400 text-xs mobileLandscape:mt-3">
            Created {pwdDateText}
          </p>
        </UnitRow>

        <hr className="unit-row-hr" />

        <UnitRow
          header="Primary email"
          headerValue={primaryEmail.email}
          headerValueClassName="break-all"
          prefixDataTestId="primary-email"
        />

        <hr className="unit-row-hr" />

        <UnitRowSecondaryEmail />
      </div>
    </section>
  );
};

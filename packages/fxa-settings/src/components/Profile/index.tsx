import React from 'react';
import { useAccount } from '../../models';
import { UnitRow } from '../UnitRow';
import { UnitRowWithAvatar } from '../UnitRowWithAvatar';
import { UnitRowSecondaryEmail } from '../UnitRowSecondaryEmail';

export const Profile = () => {
  const {
    primaryEmail,
    displayName,
    avatarUrl,
    passwordCreated,
  } = useAccount();

  const pwdDateText = Intl.DateTimeFormat('default', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(new Date(passwordCreated));

  return (
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
  );
};

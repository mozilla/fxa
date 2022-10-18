import React from 'react';
import { useAccount } from '../../models';
import { UnitRow } from '../UnitRow';
import { UnitRowSecondaryEmail } from '../UnitRowSecondaryEmail';
import { HomePath } from '../../constants';
import { Localized } from '@fluent/react';

export const Profile = () => {
  const { avatar, primaryEmail, displayName } = useAccount();

  return (
    <section className="mt-11" data-testid="settings-profile">
      <h2 className="font-header font-bold mobileLandscape:ltr:ml-6 mobileLandscape:rtl:ml-6 ltr:ml-4 rtl:mr-4 mb-4 relative">
        <span id="profile" className="nav-anchor"></span>
        <Localized id="profile-heading">Profile</Localized>
      </h2>

      <div className="bg-white tablet:rounded-xl shadow">
        <Localized id="profile-picture" attrs={{ header: true }}>
          <UnitRow
            header="Picture"
            headerId="profile-picture"
            headerValue={!avatar.isDefault}
            route={`${HomePath}/avatar`}
            prefixDataTestId="avatar"
            {...{ avatar }}
          />
        </Localized>

        <hr className="unit-row-hr" />

        <Localized id="profile-display-name" attrs={{ header: true }}>
          <UnitRow
            header="Display name"
            headerId="display-name"
            headerValue={displayName}
            headerValueClassName="break-all"
            route="/settings/display_name"
            prefixDataTestId="display-name"
          />
        </Localized>

        <hr className="unit-row-hr" />

        <Localized id="profile-primary-email" attrs={{ header: true }}>
          <UnitRow
            header="Primary email"
            headerId="primary-email"
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

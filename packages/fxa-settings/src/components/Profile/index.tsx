import React from 'react';
import { useAccount } from '../../models';
import { UnitRow } from '../UnitRow';
import { UnitRowSecondaryEmail } from '../UnitRowSecondaryEmail';
import { HomePath } from '../../constants';
import { Localized, useLocalization } from '@fluent/react';

export const Profile = () => {
  const { avatar, primaryEmail, displayName, passwordCreated } = useAccount();
  const { l10n } = useLocalization();

  const pwdDateText = Intl.DateTimeFormat('default', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).format(new Date(passwordCreated));

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

        <Localized id="profile-password" attrs={{ header: true }}>
          <UnitRow
            header="Password"
            headerId="password"
            headerValueClassName="tracking-wider"
            headerValue="••••••••••••••••••"
            route="/settings/change_password"
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
            headerId="primary-email"
            headerValue={primaryEmail.email}
            noHeaderValueText={l10n.getString(
              'profile-primary-email-none',
              null,
              'None'
            )}
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

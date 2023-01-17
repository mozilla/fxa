import React from 'react';
import { Profile } from '../../lib/types';
import firefoxLogo from '../../images/firefox-logo-combined.svg';
import { useLocalization } from '@fluent/react';

export type HeaderProps = {
  profile?: Profile;
};

export const Header = ({ profile }: HeaderProps) => {
  const { l10n } = useLocalization();
  return (
    <header
      className="flex justify-between items-center bg-white shadow h-16 fixed left-0 top-0 my-0 mx-auto px-4 py-0 w-full z-10 tablet:h-20"
      role="banner"
    >
      <div data-testid="branding">
        <img
          src={firefoxLogo}
          alt={l10n.getString('brand-name-firefox-logo', null, 'Firefox logo')}
          className="w-[120px]"
        />
      </div>

      {profile && (
        <img
          className="rounded-full w-8 h-8"
          src={profile.avatar}
          data-testid="avatar"
          alt={profile.displayName || profile.email}
          title={profile.displayName || profile.email}
        />
      )}
    </header>
  );
};

export default Header;

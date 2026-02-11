import React from 'react';
import { Profile } from '../../store/types';
import mozillaLogo from '@fxa/shared/assets/images/moz-logo-bw-rgb.svg';
import { useLocalization } from '@fluent/react';

export type HeaderProps = {
  profile?: Profile;
  className?: string;
};

export const Header = ({ profile, className = 'default' }: HeaderProps) => {
  const { l10n } = useLocalization();
  let profileSection: JSX.Element | null = null;

  if (profile) {
    const { avatar, displayName, email } = profile;
    profileSection = (
      <img
        className="rounded-full w-8 h-8"
        src={avatar}
        data-testid="avatar"
        alt={displayName || email}
        title={displayName || email}
      />
    );
  }

  return (
    <header
      className={`${className} flex justify-between items-center bg-white shadow h-16 fixed left-0 top-0 my-0 mx-auto px-4 py-0 w-full z-10 tablet:h-20`}
      role="banner"
    >
      <div data-testid="branding">
        <img
          src={mozillaLogo}
          alt={l10n.getString('brand-name-mozilla-logo', null, 'Mozilla logo')}
          className="w-[140px]"
        />
      </div>
      {profileSection}
    </header>
  );
};

export default Header;

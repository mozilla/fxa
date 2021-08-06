import React from 'react';

import './index.scss';
import { Profile } from '../../store/types';

type HeaderProps = {
  profile?: Profile;
  className?: string;
};

export const Header = ({ profile, className = 'default' }: HeaderProps) => {
  let profileSection = null;
  if (profile) {
    const { avatar, displayName, email } = profile;
    profileSection = (
      <img
        className="avatar hoisted"
        src={avatar}
        data-testid="avatar"
        alt={displayName || email}
      />
    );
  }

  return (
    <header className={`${className} fxa-settings-header`} role="banner">
      <div className="fxa-logo" data-testid="branding" title="firefox"></div>
      {profileSection}
    </header>
  );
};

export default Header;

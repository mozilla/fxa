import React from 'react';

import './index.scss';
import { Profile } from '../../store/types';

type HeaderProps = {
  profile: Profile;
  className?: string;
};

export const Header = ({ profile, className = 'default' }: HeaderProps) => {
  const { avatar, displayName, email } = profile;

  return (
    <header className={`${className} fxa-settings-header`} role="banner">
      <div className="fxa-logo" data-testid="branding" title="firefox"></div>
      <img
        className="avatar hoisted"
        src={avatar}
        data-testid="avatar"
        alt={displayName || email}
      />
    </header>
  );
};

export default Header;

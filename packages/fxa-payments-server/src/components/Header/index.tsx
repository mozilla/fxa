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
    <header className={`${className} fxa-settings-header`}>
      <h1 className="fxa-manage-account">
        <span className="fxa-account-title">Firefox</span>
      </h1>
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

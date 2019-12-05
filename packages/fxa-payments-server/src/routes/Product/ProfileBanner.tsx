import React from 'react';
import { Profile } from '../../lib/types';

export default ({
  profile: { email, avatar, displayName },
}: {
  profile: Profile;
}) => (
  <div className="profile-banner">
    <img className="avatar hoisted" src={avatar} alt={displayName || email} />
    {displayName && (
      <h2 data-testid="profile-display-name" className="displayName">
        {displayName}
      </h2>
    )}
    <h3 data-testid="profile-email" className="name email">
      {email}
    </h3>
  </div>
);

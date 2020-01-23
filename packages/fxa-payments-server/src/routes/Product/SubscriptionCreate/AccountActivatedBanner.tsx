import React from 'react';
import { Profile } from '../../../store/types';
import { Localized } from 'fluent-react';

export default ({ profile: { email, displayName } }: { profile: Profile }) => {
  const userEl = displayName ? (
    <span data-testid="activated-display-name" className="displayName">
      {displayName}
    </span>
  ) : (
    <span data-testid="activated-email" className="email">
      {email}
    </span>
  );

  return (
    <div data-testid="account-activated" className="account-activated">
      <Localized id="account-activated-greeting" $userEl={userEl}>
        <h2>Your account is activated, {userEl}</h2>
      </Localized>
    </div>
  );
};

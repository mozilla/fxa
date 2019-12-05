import React from 'react';
import { Profile } from '../../../lib/types';

export default ({ profile: { email, displayName } }: { profile: Profile }) => (
  <div data-testid="account-activated" className="account-activated">
    <h2>
      Your account is activated,{' '}
      {displayName ? (
        <span data-testid="activated-display-name" className="displayName">
          {displayName}
        </span>
      ) : (
        <span data-testid="activated-email" className="email">
          {email}
        </span>
      )}
    </h2>
  </div>
);

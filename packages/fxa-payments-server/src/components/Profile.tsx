import React from 'react';
import { connect } from 'react-redux';
import { selectors } from '../store';
import { State, ProfileFetchState } from '../store/types';

type ProfileProps = {
  profile: ProfileFetchState;
};

export const Profile = ({
  profile: { loading, error, result },
}: ProfileProps) => {
  return (
    <div>
      {loading && <h1>(profile loading...)</h1>}
      {error && <h1>(profile error! {'' + error})</h1>}
      {result && (
        <div className="profileCard">
          <img
            data-testid="avatar"
            className="avatar"
            alt={result.email}
            src={result.avatar}
            width="64"
            height="64"
          />
          <br />
          {result.displayName && (
            <span data-testid="displayName" className="displayName">
              {result.displayName}
              <br />
            </span>
          )}
          <span data-testid="email" className="email">
            {result.email}
          </span>
        </div>
      )}
    </div>
  );
};

export default connect((state: State) => ({
  profile: selectors.profile(state),
}))(Profile);

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import Avatar from '../Avatar';
import { Link, useLocation } from '@reach/router';

type UnitRowWithAvatarProps = {
  avatarUrl: string | null;
};

export const UnitRowWithAvatar = ({ avatarUrl }: UnitRowWithAvatarProps) => {
  const ctaText = avatarUrl ? 'Change' : 'Add';
  const location = useLocation();
  return (
    <div className="unit-row">
      <div className="unit-row-header">
        <h3 data-testid="unit-row-with-avatar-header">Picture</h3>
      </div>
      <div className="unit-row-content">
        <Avatar
          {...{ avatarUrl }}
          className="mx-auto mobileLandscape:mx-0 w-32 mobileLandscape:w-16"
        />
      </div>
      <div className="unit-row-actions">
        <div>
          <Link
            className="cta-neutral cta-base transition-standard"
            data-testid="unit-row-with-avatar-route"
            to={`/beta/settings/avatar/change${location.search}`}
          >
            {ctaText}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnitRowWithAvatar;

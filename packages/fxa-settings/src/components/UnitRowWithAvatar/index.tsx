/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { ReactComponent as DefaultAvatar } from '../../images/avatar-default.svg';

type UnitRowWithAvatarProps = {
  avatarUrl: string | null;
};

export const UnitRowWithAvatar = ({ avatarUrl }: UnitRowWithAvatarProps) => {
  const ctaText = avatarUrl ? 'Change' : 'Add';

  return (
    <div className="unit-row">
      <div className="unit-row-header">
        <h3 data-testid="unit-row-with-avatar-header">Picture</h3>
      </div>
      <div className="unit-row-content">
        {avatarUrl ? (
          <img
            data-testid="unit-row-with-avatar-nondefault"
            src={avatarUrl}
            alt="Your avatar"
            className="mx-auto mobileLandscape:mx-0 w-32 mobileLandscape:w-16 rounded-full"
          />
        ) : (
          <DefaultAvatar
            data-testid="unit-row-with-avatar-default"
            role="img"
            aria-label="Default avatar"
            className="mx-auto mobileLandscape:mx-0 w-32 mobileLandscape:w-16"
          />
        )}
      </div>
      <div className="unit-row-actions">
        <div>
          <a
            className="cta-neutral"
            data-testid="unit-row-with-avatar-route"
            href="#"
          >
            {ctaText}
          </a>
        </div>
      </div>
    </div>
  );
};

export default UnitRowWithAvatar;

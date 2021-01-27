/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import Avatar from '../Avatar';
import { useAccount } from '../../models';
import { Link, useLocation } from '@reach/router';
import { HomePath } from 'fxa-settings/src/constants';
import { Localized } from '@fluent/react';

export const UnitRowWithAvatar = () => {
  const { avatarUrl } = useAccount();
  const ctaTextFallback = avatarUrl ? 'Change' : 'Add';
  const ctaPath = ctaTextFallback.toLocaleLowerCase();
  const ctaL10nId = avatarUrl ? 'avatar-change-link' : 'avatar-add-link';
  const location = useLocation();
  return (
    <div className="unit-row">
      <div className="unit-row-header">
        <Localized id="avatar-heading">
          <h3 data-testid="unit-row-with-avatar-header">Picture</h3>
        </Localized>
      </div>
      <div className="unit-row-content">
        <Avatar className="mx-auto mobileLandscape:mx-0 w-32 mobileLandscape:w-16" />
      </div>
      <div className="unit-row-actions">
        <div>
          <Localized id={ctaL10nId}>
            <Link
              className="cta-neutral cta-base"
              data-testid="unit-row-with-avatar-route"
              to={`${HomePath}/avatar/${ctaPath}${location.search}`}
            >
              {ctaTextFallback}
            </Link>
          </Localized>
        </div>
      </div>
    </div>
  );
};

export default UnitRowWithAvatar;

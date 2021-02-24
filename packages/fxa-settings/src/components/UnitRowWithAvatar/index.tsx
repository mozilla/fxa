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
  const { avatar } = useAccount();
  const ctaTextFallback = avatar.url ? 'Change' : 'Add';
  const ctaL10nId = avatar.url ? 'avatar-change-link' : 'avatar-add-link';
  const location = useLocation();
  return (
    <div className="unit-row">
      <div className="unit-row-header">
        <Localized id="avatar-heading">
          <h3 id="profile-picture" data-testid="unit-row-with-avatar-header">
            Picture
          </h3>
        </Localized>
      </div>
      <div className="unit-row-content">
        <Avatar className="mx-auto mobileLandscape:mx-0 w-32 mobileLandscape:w-16" />
      </div>
      <div className="unit-row-actions">
        <div className="flex items-center">
          <Localized id={ctaL10nId}>
            <Link
              className="cta-neutral cta-base ltr:mr-1 rtl:ml-1"
              data-testid="unit-row-with-avatar-route"
              to={`${HomePath}/avatar${location.search}`}
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

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Link, RouteComponentProps } from '@reach/router';
import Nav from '../Nav';
import Security from '../Security';
import { Profile } from '../Profile';
import ConnectedServices from '../ConnectedServices';
import LinkedAccounts from '../LinkedAccounts';

import * as Metrics from '../../../lib/metrics';
import { useAccount } from '../../../models';
import { DeleteAccountPath } from 'fxa-settings/src/constants';
import { Localized } from '@fluent/react';
import DataCollection from '../DataCollection';

export const PageSettings = (_: RouteComponentProps) => {
  const { uid } = useAccount();

  Metrics.setProperties({
    lang: document.querySelector('html')?.getAttribute('lang'),
    uid,
  });
  Metrics.usePageViewEvent(Metrics.settingsViewName);

  return (
    <div id="fxa-settings" className="flex">
      <div className="hidden desktop:block desktop:flex-2">
        <Nav />
      </div>
      <div className="flex-7 max-w-full">
        <Profile />
        <Security />
        <ConnectedServices />
        <LinkedAccounts />
        <DataCollection />
        <div className="flex mx-4 tablet:mx-0" id="delete-account">
          <Localized id="delete-account-link">
            <Link
              data-testid="settings-delete-account"
              className="cta-caution text-sm transition-standard mt-12 py-2 px-5 mobileLandscape:py-1"
              to={DeleteAccountPath}
            >
              Delete account
            </Link>
          </Localized>
        </div>
      </div>
    </div>
  );
};

export default PageSettings;

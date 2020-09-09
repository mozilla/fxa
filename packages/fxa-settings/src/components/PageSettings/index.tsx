/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { RouteComponentProps } from '@reach/router';
import AlertExternal from '../AlertExternal';
import Nav from '../Nav';
import Security from '../Security';
import { Profile } from '../Profile';

import * as Metrics from '../../lib/metrics';
import { useAccount } from '../../models';

export const PageSettings = (_: RouteComponentProps) => {
  const { uid } = useAccount();

  Metrics.setProperties({
    lang: document.querySelector('html')?.getAttribute('lang'),
    uid,
  });

  return (
    <div className="flex">
      <AlertExternal />
      <div className="hidden desktop:block desktop:flex-2">
        <Nav />
      </div>
      <div className="flex-7 max-w-full">
        <Profile />
        <Security />
      </div>
    </div>
  );
};

export default PageSettings;

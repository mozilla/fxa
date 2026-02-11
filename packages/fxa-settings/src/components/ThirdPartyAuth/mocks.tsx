/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import ThirdPartyAuth, { ThirdPartyAuthProps } from '.';
import { AppContext } from '../../models';
import { mockAppContext } from '../../models/mocks';
import { LocationProvider } from '@reach/router';

export const Subject = (props: ThirdPartyAuthProps) => {
  return (
    <AppContext.Provider value={mockAppContext()}>
      <LocationProvider>
        <ThirdPartyAuth {...props} />
      </LocationProvider>
    </AppContext.Provider>
  );
};

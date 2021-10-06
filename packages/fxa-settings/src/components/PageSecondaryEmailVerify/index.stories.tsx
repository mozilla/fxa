/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { PageSecondaryEmailVerify } from '.';
import { AppLayout } from '../AppLayout';
import { WindowLocation, LocationProvider } from '@reach/router';

const mockLocation = {
  state: { email: 'johndope@example.com' },
} as unknown as WindowLocation;

storiesOf('Pages/SecondaryEmailVerify', module)
  .addDecorator((getStory) => <LocationProvider>{getStory()}</LocationProvider>)
  .add('valid: 1234, invalid: 4444', () => {
    return (
      <AppLayout>
        <PageSecondaryEmailVerify location={mockLocation} />
      </AppLayout>
    );
  });

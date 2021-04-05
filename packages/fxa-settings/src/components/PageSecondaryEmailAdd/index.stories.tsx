/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { LocationProvider } from '@reach/router';
import { storiesOf } from '@storybook/react';
import { AppLayout } from '../AppLayout';
import { PageSecondaryEmailAdd } from '.';
import { MockedCache, mockEmail } from '../../models/_mocks';

storiesOf('Pages|SecondaryEmailAdd', module)
  .addDecorator((getStory) => <LocationProvider>{getStory()}</LocationProvider>)
  .add('Default empty', () => (
    <MockedCache>
      <AppLayout>
        <PageSecondaryEmailAdd />
      </AppLayout>
    </MockedCache>
  ))
  .add('No secondary email set, primary email verified', () => {
    return (
      <MockedCache>
        <AppLayout>
          <PageSecondaryEmailAdd />
        </AppLayout>
      </MockedCache>
    );
  })
  .add(
    'secondary can not match primary error, primary email unverified',
    () => {
      return (
        <MockedCache>
          <AppLayout>
            <PageSecondaryEmailAdd />
          </AppLayout>
        </MockedCache>
      );
    }
  )
  .add(
    'secondary matching secondary already added, primary email verified',
    () => {
      return (
        <MockedCache>
          <AppLayout>
            <PageSecondaryEmailAdd />
          </AppLayout>
        </MockedCache>
      );
    }
  );

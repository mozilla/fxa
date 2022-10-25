/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { LocationProvider } from '@reach/router';
import { storiesOf } from '@storybook/react';
import React from 'react';
import { PageDisplayName } from '.';
import AppLayout from '../AppLayout';

storiesOf('Pages/DisplayName', module)
  .addDecorator((getStory) => <LocationProvider>{getStory()}</LocationProvider>)
  .add('default', () => (
    <AppLayout>
      <PageDisplayName />
    </AppLayout>
  ));

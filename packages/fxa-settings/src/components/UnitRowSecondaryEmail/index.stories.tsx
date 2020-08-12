/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { UnitRowSecondaryEmail } from '.';
import { AlertBarRootAndContextProvider } from '../../lib/AlertBarContext';

storiesOf('Components|UnitRowSecondaryEmail', module).add('basic', () => (
  <AlertBarRootAndContextProvider>
    <UnitRowSecondaryEmail primaryEmail="user@example.com" />
  </AlertBarRootAndContextProvider>
));

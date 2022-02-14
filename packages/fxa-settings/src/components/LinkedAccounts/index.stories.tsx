/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { storiesOf } from '@storybook/react';
import { LinkedAccounts } from '.';

import { MOCK_LINKED_ACCOUNTS } from './mocks';
import { AppContext } from 'fxa-settings/src/models';
import { mockAppContext } from 'fxa-settings/src/models/mocks';

storiesOf('Components/LinkedAccounts', module).add('default', () => (
  <AppContext.Provider
    value={mockAppContext({
      account: { linkedAccounts: MOCK_LINKED_ACCOUNTS } as any,
    })}
  >
    <LinkedAccounts />
  </AppContext.Provider>
));

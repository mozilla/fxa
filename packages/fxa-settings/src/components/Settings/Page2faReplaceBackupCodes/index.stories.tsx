/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AppContext } from 'fxa-settings/src/models';
import {
  mockAppContext,
  MOCK_ACCOUNT,
  mockSession,
} from 'fxa-settings/src/models/mocks';
import React from 'react';
import { Page2faReplaceBackupCodes } from '.';
import { Meta } from '@storybook/react';
import { LocationProvider } from '@reach/router';
import { withLocalization } from 'fxa-react/lib/storybooks';
import SettingsLayout from '../SettingsLayout';
import { MfaContext } from '../MfaGuard';

const session = mockSession(true);

// Account with existing backup codes (replace scenario)
const accountWithExistingCodes = {
  ...MOCK_ACCOUNT,
  backupCodes: {
    hasBackupCodes: true,
    count: 5,
  },
  updateRecoveryCodes: () => Promise.resolve(true),
  generateRecoveryCodes: () =>
    Promise.resolve([
      'C1OFZW7R04',
      'XVKRLKERT4',
      'CF0V94X204',
      'C3THX2SGZ4',
      'UXC6NRQT54',
      '24RF9WFA44',
      'ZBULPFN7J4',
      'D4J6KY8FL4',
    ]),
} as any;

// Account with no backup codes (create new scenario)
const accountWithNoCodes = {
  ...MOCK_ACCOUNT,
  backupCodes: {
    hasBackupCodes: false,
    count: 0,
  },
  updateRecoveryCodes: () => Promise.resolve(true),
  generateRecoveryCodes: () =>
    Promise.resolve([
      'C1OFZW7R04',
      'XVKRLKERT4',
      'CF0V94X204',
      'C3THX2SGZ4',
      'UXC6NRQT54',
      '24RF9WFA44',
      'ZBULPFN7J4',
      'D4J6KY8FL4',
    ]),
} as any;

export default {
  title: 'Pages/Settings/ReplaceBackupCodes',
  component: Page2faReplaceBackupCodes,
  decorators: [withLocalization],
} as Meta;

// Story for users who have existing backup codes and want to replace them
export const ReplaceExistingCodes = () => (
  <LocationProvider>
    <AppContext.Provider
      value={mockAppContext({ account: accountWithExistingCodes, session })}
    >
      <SettingsLayout>
        <MfaContext.Provider value="2fa">
          <Page2faReplaceBackupCodes />
        </MfaContext.Provider>
      </SettingsLayout>
    </AppContext.Provider>
  </LocationProvider>
);

// Story for users who have no backup codes and need to create new ones
export const CreateNewCodes = () => (
  <LocationProvider>
    <AppContext.Provider
      value={mockAppContext({ account: accountWithNoCodes, session })}
    >
      <SettingsLayout>
        <MfaContext.Provider value="2fa">
          <Page2faReplaceBackupCodes />
        </MfaContext.Provider>
      </SettingsLayout>
    </AppContext.Provider>
  </LocationProvider>
);

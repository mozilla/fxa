/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AppContext } from 'fxa-settings/src/models';
import { mockAppContext, MOCK_ACCOUNT } from 'fxa-settings/src/models/mocks';
import React from 'react';
import { Page2faReplaceRecoveryCodes } from '.';
import AppLayout from '../AppLayout';
import { Meta } from '@storybook/react';
import { LocationProvider } from '@reach/router';
import { withLocalization } from '../../../../.storybook/decorators';

const account = {
  ...MOCK_ACCOUNT,
  replaceRecoveryCodes: () =>
    Promise.resolve({
      recoveryCodes: [
        'C1OFZW7R04',
        'XVKRLKERT4',
        'CF0V94X204',
        'C3THX2SGZ4',
        'UXC6NRQT54',
        '24RF9WFA44',
        'ZBULPFN7J4',
        'D4J6KY8FL4',
      ],
    }),
} as any;

export default {
  title: 'Pages/Settings/TwoStepAuthenticationReplaceCodes',
  component: Page2faReplaceRecoveryCodes,
  decorators: [withLocalization],
} as Meta;

export const Default = () => (
  <LocationProvider>
    <AppContext.Provider value={mockAppContext({ account })}>
      <AppLayout>
        <Page2faReplaceRecoveryCodes />
      </AppLayout>
    </AppContext.Provider>
  </LocationProvider>
);

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import AuthTotp from '.';
import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';
import { MOCK_ACCOUNT, mockAppContext } from '../../../models/mocks';
import { AppContext } from '../../../models/contexts/AppContext';
import { MozServices } from '../../../lib/types';
import { withLocalization } from 'fxa-react/lib/storybooks';

export default {
  title: 'Pages/Pair/AuthTotp',
  component: AuthTotp,
  decorators: [
    withLocalization,
    (Story) => (
      <AppContext.Provider value={mockAppContext()}>
        <LocationProvider>
          <Story />
        </LocationProvider>
      </AppContext.Provider>
    ),
  ],
} as Meta;

const storyWithProps = ({ ...props }) => {
  const story = () => (
    <AuthTotp email={MOCK_ACCOUNT.primaryEmail.email} {...props} />
  );
  return story;
};

export const Default = storyWithProps({});

export const WithRelyingParty = storyWithProps({
  serviceName: MozServices.MozillaVPN,
});

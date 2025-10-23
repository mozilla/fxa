/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { Profile } from '.';
import { Account, AppContext } from '../../../models';
import { mockAppContext } from '../../../models/mocks';
import {
  MOCK_PROFILE_ALL,
  MOCK_PROFILE_EMPTY,
  MOCK_PROFILE_UNCONFIRMED_FEATURES,
} from './mocks';

export default {
  title: 'Components/Settings/Profile',
  component: Profile,
  decorators: [withLocalization],
} as Meta;

const storyWithContext = (account: Account, storyName?: string) => {
  const story = () => (
    <LocationProvider>
      <AppContext.Provider value={mockAppContext({ account })}>
        <Profile />
      </AppContext.Provider>
    </LocationProvider>
  );
  if (storyName) story.storyName = storyName;
  return story;
};

export const FreshAccount = storyWithContext(MOCK_PROFILE_EMPTY);
export const UnconfirmedFeatures = storyWithContext(
  MOCK_PROFILE_UNCONFIRMED_FEATURES
);
export const CompletelyFilledOut = storyWithContext(MOCK_PROFILE_ALL);

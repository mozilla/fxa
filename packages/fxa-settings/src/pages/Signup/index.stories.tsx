/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import Signup, { SignupProps } from '.';
import AppLayout from '../../components/AppLayout';
import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';
import { MozServices } from '../../lib/types';
import { MOCK_ACCOUNT } from '../../models/mocks';
import { withLocalization } from 'fxa-react/lib/storybooks';

export default {
  title: 'Pages/Signup',
  component: Signup,
  decorators: [withLocalization],
} as Meta;

const storyWithProps = (props?: Partial<SignupProps>) => {
  const story = () => (
    <LocationProvider>
      <AppLayout>
        <Signup email={MOCK_ACCOUNT.primaryEmail.email} />
      </AppLayout>
    </LocationProvider>
  );
  return story;
};

export const Default = storyWithProps();

export const ForceAuthCantChangeEmail = storyWithProps({
  canChangeEmail: false,
});

export const ClientIsPocket = storyWithProps({
  serviceName: MozServices.Pocket,
});

export const ChooseWhatToSyncIsEnabled = storyWithProps({
  isCWTSEnabled: true,
});

export const NewslettersAreEnabled = storyWithProps({
  areNewslettersEnabled: true,
});

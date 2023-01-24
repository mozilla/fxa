/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import PrimaryEmailVerified, { PrimaryEmailVerifiedProps } from '.';
import AppLayout from '../../../components/AppLayout';
import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';
import { MOCK_SERVICE } from './mocks';

export default {
  title: 'pages/Signup/PrimaryEmailVerified',
  component: PrimaryEmailVerified,
} as Meta;

const storyWithProps = (props?: PrimaryEmailVerifiedProps) => {
  const story = () => (
    <LocationProvider>
      <AppLayout>
        <PrimaryEmailVerified {...props} />
      </AppLayout>
    </LocationProvider>
  );
  return story;
};

export const NotSignedIn = storyWithProps();

export const SignedIn = storyWithProps({ isSignedIn: true });

export const SignedInWithServiceName = storyWithProps({
  isSignedIn: true,
  serviceName: MOCK_SERVICE,
});

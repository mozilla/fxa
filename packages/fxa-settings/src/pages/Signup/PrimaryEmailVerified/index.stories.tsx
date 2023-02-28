/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import PrimaryEmailVerified, { PrimaryEmailVerifiedProps } from '.';
import { Meta } from '@storybook/react';
import { MOCK_SERVICE } from './mocks';
import { withLocalization } from '../../../../.storybook/decorators';

export default {
  title: 'Pages/Signup/PrimaryEmailVerified',
  component: PrimaryEmailVerified,
  decorators: [withLocalization],
} as Meta;

const storyWithProps = (props: PrimaryEmailVerifiedProps) => {
  const story = () => <PrimaryEmailVerified {...props} />;
  return story;
};

export const BasicSignedIn = storyWithProps({ isSignedIn: true });

export const BasicSignedOut = storyWithProps({ isSignedIn: false });

export const BasicWithServiceName = storyWithProps({
  serviceName: MOCK_SERVICE,
  isSignedIn: false,
});

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import LinkRememberPassword, { LinkRememberPasswordProps } from '.';
import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';
import { MOCK_EMAIL } from './mocks';

export default {
  title: 'components/LinkRememberPassword',
  component: LinkRememberPassword,
} as Meta;

const storyWithProps = (props?: LinkRememberPasswordProps) => {
  const story = () => (
    <LocationProvider>
      <LinkRememberPassword {...props} />
    </LocationProvider>
  );
  return story;
};

export const Default = storyWithProps();

export const WithEmailHref = storyWithProps({ email: MOCK_EMAIL });

export const WithForceEmailHref = storyWithProps({ forceEmail: MOCK_EMAIL });

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import LinkRememberPassword from '.';
import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';
import { MOCK_ACCOUNT } from '../../models/mocks';

export default {
  title: 'components/LinkRememberPassword',
  component: LinkRememberPassword,
} as Meta;

const storyWithProps = ({ ...props }) => {
  const story = () => (
    <LocationProvider>
      <LinkRememberPassword
        email={MOCK_ACCOUNT.primaryEmail.email}
        {...props}
      />
    </LocationProvider>
  );
  return story;
};

export const Default = storyWithProps({});

export const WithForceAuth = storyWithProps({ forceAuth: true });

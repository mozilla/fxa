/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { LocationProvider } from '@reach/router';
import CompleteSignin, { CompleteSigninProps } from '.';
import AppLayout from '../../../components/AppLayout';
import { withLocalization } from '../../../../.storybook/decorators';

export default {
  title: 'Pages/Signin/CompleteSignin',
  component: CompleteSignin,
  decorators: [withLocalization],
} as Meta;

const storyWithProps = (props: CompleteSigninProps) => {
  const story = () => (
    <LocationProvider>
      <AppLayout>
        <CompleteSignin {...props} />
      </AppLayout>
    </LocationProvider>
  );
  return story;
};

export const WithValidLink = storyWithProps({
  linkStatus: 'valid',
  isForPrimaryEmail: true,
});

export const WithExpiredLink = storyWithProps({
  linkStatus: 'expired',
  isForPrimaryEmail: true,
});

export const WithDamagedLink = storyWithProps({
  linkStatus: 'damaged',
  isForPrimaryEmail: true,
});

export const WithUsedLinkDefault = storyWithProps({
  linkStatus: 'used',
  isForPrimaryEmail: false,
});

export const WithUsedLinkForPrimaryEmail = storyWithProps({
  linkStatus: 'used',
  isForPrimaryEmail: true,
});

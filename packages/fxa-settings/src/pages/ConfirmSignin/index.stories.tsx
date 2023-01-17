/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import ConfirmSignin, { ConfirmSigninProps } from '.';
import AppLayout from '../../components/AppLayout';
import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';
import { EXAMPLE_EMAIL, mockGoBackCallback } from './mocks';

export default {
  title: 'pages/ConfirmSignin',
  component: ConfirmSignin,
} as Meta;

const storyWithProps = (props: ConfirmSigninProps) => {
  const story = () => (
    <LocationProvider>
      <AppLayout>
        <ConfirmSignin {...props} />
      </AppLayout>
    </LocationProvider>
  );
  return story;
};

export const UserCannotGoBack = storyWithProps({
  email: EXAMPLE_EMAIL,
  isOpenWebmailButtonVisible: false,
});

export const UserCanGoBack = storyWithProps({
  email: EXAMPLE_EMAIL,
  canGoBack: true,
  goBackCallback: mockGoBackCallback,
  isOpenWebmailButtonVisible: false,
});

export const OpenWebmailButtonIsVisible = storyWithProps({
  email: EXAMPLE_EMAIL,
  isOpenWebmailButtonVisible: true,
});

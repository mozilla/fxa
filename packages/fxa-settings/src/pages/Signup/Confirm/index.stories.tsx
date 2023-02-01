/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import Confirm, { ConfirmProps } from '.';
import AppLayout from '../../../components/AppLayout';
import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';
import { MOCK_ACCOUNT } from '../../../models/mocks';
import { MOCK_GOBACK_CB } from './mocks';

export default {
  title: 'pages/Signup/Confirm',
  component: Confirm,
} as Meta;

const storyWithProps = (props: ConfirmProps) => {
  const story = () => (
    <LocationProvider>
      <AppLayout>
        <Confirm {...props} />
      </AppLayout>
    </LocationProvider>
  );
  return story;
};

export const Default = storyWithProps({
  email: MOCK_ACCOUNT.primaryEmail.email,
});

export const UserCanGoBack = storyWithProps({
  email: MOCK_ACCOUNT.primaryEmail.email,
  goBackCallback: MOCK_GOBACK_CB,
});

export const withWebmailLink = storyWithProps({
  email: MOCK_ACCOUNT.primaryEmail.email,
  withWebmailLink: true,
});

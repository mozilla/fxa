/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import SigninTotpCode, { SigninTotpCodeProps } from '.';
import AppLayout from '../../../components/AppLayout';
import { Meta } from '@storybook/react';
import { MOCK_SERVICE } from './mocks';
import { LocationProvider } from '@reach/router';

export default {
  title: 'pages/Signin/SigninTotpCode',
  component: SigninTotpCode,
} as Meta;

const storyWithProps = (props?: SigninTotpCodeProps) => {
  const story = () => (
    <LocationProvider>
      <AppLayout>
        <SigninTotpCode {...props} />
      </AppLayout>
    </LocationProvider>
  );
  return story;
};

export const Default = storyWithProps();

export const WithRelyingParty = storyWithProps({ serviceName: MOCK_SERVICE });

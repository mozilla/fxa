/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import SigninTotpCode from '.';
import AppLayout from '../../../components/AppLayout';
import { Meta } from '@storybook/react';
import { LocationProvider } from '@reach/router';
import { MOCK_ACCOUNT } from '../../../models/mocks';
import { MozServices } from '../../../lib/types';
import { withLocalization } from '../../../../.storybook/decorators';

export default {
  title: 'Pages/Signin/SigninTotpCode',
  component: SigninTotpCode,
  decorators: [withLocalization],
} as Meta;

const storyWithProps = ({ ...props }) => {
  const story = () => (
    <LocationProvider>
      <AppLayout>
        <SigninTotpCode email={MOCK_ACCOUNT.primaryEmail.email} {...props} />
      </AppLayout>
    </LocationProvider>
  );
  return story;
};

export const Default = storyWithProps({});

export const WithRelyingParty = storyWithProps({
  serviceName: MozServices.MozillaVPN,
});

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import AuthTotp from '.';
import AppLayout from '../../../components/AppLayout';
import { Meta } from '@storybook/react';
import { MOCK_ACCOUNT } from '../../../models/mocks';
import { MozServices } from '../../../lib/types';
import { withLocalization } from '../../../../.storybook/decorators';

export default {
  title: 'Pages/Pair/AuthTotp',
  component: AuthTotp,
  decorators: [withLocalization],
} as Meta;

const storyWithProps = ({ ...props }) => {
  const story = () => (
    <AppLayout>
      <AuthTotp email={MOCK_ACCOUNT.primaryEmail.email} {...props} />
    </AppLayout>
  );
  return story;
};

export const Default = storyWithProps({});

export const WithRelyingParty = storyWithProps({
  serviceName: MozServices.MozillaVPN,
});

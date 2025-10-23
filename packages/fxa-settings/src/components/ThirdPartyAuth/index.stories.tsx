/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import ThirdPartyAuth from '.';
import AppLayout from '../AppLayout';
import { Subject } from './mocks';

export default {
  title: 'Components/ThirdPartyAuth',
  component: ThirdPartyAuth,
  decorators: [withLocalization],
} as Meta;

export const Default = () => {
  // Default separator type is 'or'
  return (
    <AppLayout>
      <Subject showSeparator />
    </AppLayout>
  );
};

export const SignInWithSeparator = () => {
  return (
    <AppLayout>
      <Subject showSeparator separatorType="signInWith" />
    </AppLayout>
  );
};

export const NoSeparator = () => {
  return (
    <AppLayout>
      <Subject showSeparator={false} />
    </AppLayout>
  );
};

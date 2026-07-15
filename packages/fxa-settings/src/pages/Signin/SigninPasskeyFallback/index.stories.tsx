/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import SigninPasskeyFallback from '.';
import { MemoryRouter } from 'react-router';
import { Meta } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { withLocalization } from 'fxa-react/lib/storybooks';

export default {
  title: 'Pages/Signin/SigninPasskeyFallback',
  component: SigninPasskeyFallback,
  decorators: [withLocalization],
} as Meta;

const handlers = {
  onContinue: async (password: string) => {
    action('onContinue')(password);
  },
};

export const Default = () => (
  <MemoryRouter>
    <SigninPasskeyFallback email="user@example.com" {...handlers} />
  </MemoryRouter>
);

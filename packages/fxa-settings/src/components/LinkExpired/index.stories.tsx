/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { LocationProvider } from '@reach/router';
import { Meta } from '@storybook/react';
import { ResetPasswordLinkExpired, SigninLinkExpired } from '.';
import { withLocalization } from '../../../.storybook/decorators';
import { MOCK_ACCOUNT } from '../../models/mocks';

export default {
  title: 'Components/LinkExpired',
  subcomponents: { ResetPasswordLinkExpired, SigninLinkExpired },
  decorators: [
    withLocalization,
    (Story) => (
      <LocationProvider>
        <Story />
      </LocationProvider>
    ),
  ],
} as Meta;

// TODO Mock location state
// TODO Mock callbacks

export const LinkExpiredForResetPassword = () => <ResetPasswordLinkExpired />;

export const LinkExpiredForSignin = () => <SigninLinkExpired />;

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import OAuthDataError from './index';
import { AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import { withLocalization } from 'fxa-react/lib/storybooks';

export default {
  title: 'Components/OAuthDataError',
  component: OAuthDataError,
  decorators: [withLocalization],
} as Meta;

const MOCK_AUTH_ERROR = {
  message: AuthUiErrors.UNEXPECTED_ERROR.message,
  errno: 999,
};

export const Default = () => <OAuthDataError error={MOCK_AUTH_ERROR} />;

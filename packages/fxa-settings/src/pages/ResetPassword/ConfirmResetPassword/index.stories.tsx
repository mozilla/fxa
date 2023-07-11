/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import ConfirmResetPassword from '.';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { renderStoryWithHistory } from '../../../lib/storybook-utils';

export default {
  title: 'Pages/ResetPassword/ConfirmResetPassword',
  component: ConfirmResetPassword,
  decorators: [withLocalization],
} as Meta;

export const Default = () =>
  renderStoryWithHistory(<ConfirmResetPassword />, '/confirm_reset_password');

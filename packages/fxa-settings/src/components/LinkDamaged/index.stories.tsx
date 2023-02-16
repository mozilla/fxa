/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import AppLayout from '../AppLayout';
import { Meta } from '@storybook/react';
import LinkDamaged from '.';
import { withLocalization } from '../../../.storybook/decorators';

export default {
  title: 'Components/LinkDamaged',
  component: LinkDamaged,
  decorators: [withLocalization],
} as Meta;

export const DamagedResetPasswordLink = () => (
  <AppLayout>
    <LinkDamaged linkType="reset-password" />
  </AppLayout>
);

export const DamagedSigninLink = () => (
  <AppLayout>
    <LinkDamaged linkType="signin" />
  </AppLayout>
);

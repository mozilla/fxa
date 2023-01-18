/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import AppLayout from '../AppLayout';
import { Meta } from '@storybook/react';
import LinkUsed from '.';

export default {
  title: 'components/LinkUsed',
  component: LinkUsed,
} as Meta;

export const LinkAlreadyUsedForPrimaryEmail = () => (
  <AppLayout>
    <LinkUsed isForPrimaryEmail={true} />
  </AppLayout>
);

export const LinkAlreadyUsedForSomethingOtherThanPrimaryEmail = () => (
  <AppLayout>
    <LinkUsed isForPrimaryEmail={false} />
  </AppLayout>
);

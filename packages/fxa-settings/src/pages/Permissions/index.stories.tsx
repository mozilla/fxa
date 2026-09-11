/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/react';
import Permissions from '.';
import { withLocalization } from 'fxa-react/lib/storybooks';

export default {
  title: 'Pages/Permissions',
  component: Permissions,
  decorators: [withLocalization],
} as Meta;

const story = (rows: { scope: string; value?: string }[]) => () => (
  <Permissions
    serviceName="321Done"
    rows={rows}
    onContinue={() => {}}
    onCancel={() => {}}
  />
);

export const EmailOnly = story([
  { scope: 'profile:email', value: 'user@example.com' },
]);

export const EmailAndDisplayName = story([
  { scope: 'profile:email', value: 'user@example.com' },
  { scope: 'profile:display_name', value: 'Test User' },
]);

export const DisplayNameNotSet = story([
  { scope: 'profile:email', value: 'user@example.com' },
  { scope: 'profile:display_name' },
]);

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/react';
import { withLocalization, withLocation } from 'fxa-react/lib/storybooks';
import SettingsLayout from './index';

export default {
  title: 'Components/Settings/SettingsLayout',
  component: SettingsLayout,
  decorators: [withLocalization, withLocation('/settings')],
} as Meta;

export const Basic = () => (
  <SettingsLayout>
    <p>App content goes here</p>
  </SettingsLayout>
);

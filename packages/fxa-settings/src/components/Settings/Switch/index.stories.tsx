/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import Switch from '.';
import { Subject } from './mocks';

export default {
  title: 'Components/Settings/Switch',
  component: Switch,
  decorators: [withLocalization],
} as Meta;

export const On = () => <Subject />;

export const LoadingUserSwitchedOff = () => <Subject isSubmitting />;

export const Off = () => <Subject isOn={false} />;

export const LoadingUserSwitchedOn = () => (
  <Subject isOn={false} isSubmitting />
);

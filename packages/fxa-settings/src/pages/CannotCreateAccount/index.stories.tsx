/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import CannotCreateAccount from '.';

export default {
  title: 'Pages/CannotCreateAccount',
  component: CannotCreateAccount,
  decorators: [withLocalization],
} as Meta;

export const Basic = () => <CannotCreateAccount />;

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import PasswordInfoBalloon from '.';
import AppLayout from '../AppLayout';
import InputPassword from '../InputPassword';

export default {
  title: 'Components/PasswordInfoBalloon',
  component: PasswordInfoBalloon,
  decorators: [withLocalization],
} as Meta;

export const Default = () => (
  <AppLayout>
    {/* PasswordInfoBalloon and its associated InputPassword
      must be wrapped in a relative div for accurate balloon positioning */}
    <div className="relative">
      <InputPassword
        label="Repeat password (input disabled for storybook)"
        className="text-start"
        disabled
      />
      <PasswordInfoBalloon />
    </div>
  </AppLayout>
);

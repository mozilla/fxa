/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Subject } from './mocks';
import { MemoryRouter } from 'react-router';
import FormPassword from '.';
import { Meta } from '@storybook/react';
import { withLocalization, withLocation } from 'fxa-react/lib/storybooks';
import SettingsLayout from '../Settings/SettingsLayout';

export default {
  title: 'Components/FormPassword',
  component: FormPassword,
  decorators: [withLocalization, withLocation('/settings/password')],
} as Meta;
export const WithCurrentPassword = () => (
  <MemoryRouter>
    <SettingsLayout>
      <div className="max-w-lg mx-auto">
        <Subject />
      </div>
    </SettingsLayout>
  </MemoryRouter>
);

export const WithoutCurrentPassword = () => (
  <MemoryRouter>
    <SettingsLayout>
      <div className="max-w-lg mx-auto">
        <Subject includeCurrentPw={false} />
      </div>
    </SettingsLayout>
  </MemoryRouter>
);

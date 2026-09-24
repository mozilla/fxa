/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';
import EmailBounces from './index';
import { mockAccount } from '../Account/mocks';
import { accountActionStubs, stubAdminApi } from '../../../lib/storybook';

const meta: Meta<typeof EmailBounces> = {
  title: 'Components/EmailBounces',
  component: EmailBounces,
  loaders: [stubAdminApi(accountActionStubs)],
};

export default meta;
type Story = StoryObj<typeof EmailBounces>;

export const Default: Story = {
  args: {
    uid: mockAccount.uid,
    emails: mockAccount.emails,
    emailBounces: mockAccount.emailBounces,
    onCleared: () => {},
  },
};

export const None: Story = {
  args: { uid: mockAccount.uid, emailBounces: [], onCleared: () => {} },
};

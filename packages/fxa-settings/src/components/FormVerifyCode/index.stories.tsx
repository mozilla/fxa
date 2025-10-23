/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import FormVerifyCode from '.';
import AppLayout from '../../components/AppLayout';
import { Subject } from './mocks';

export default {
  title: 'Components/FormVerifyCode',
  component: FormVerifyCode,
  decorators: [withLocalization],
} as Meta;

export const Default = () => (
  <AppLayout>
    <Subject />
  </AppLayout>
);

export const WithCustomErrorMessage = () => (
  <AppLayout>
    <Subject localizedCustomCodeRequiredMessage="This is a spoofed custom error" />
  </AppLayout>
);

export const SubmitOnPasteDisabled = () => (
  <AppLayout>
    <Subject submitFormOnPaste={false} />
  </AppLayout>
);

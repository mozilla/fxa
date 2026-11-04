/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import FormVerifyCode from '.';
import AppLayout from '../../components/AppLayout';
import { Meta } from '@storybook/react';
import { Subject } from './mocks';
import { withLocalization } from 'fxa-react/lib/storybooks';

export default {
  title: 'Components/FormVerifyCode',
  component: FormVerifyCode,
  decorators: [withLocalization],
} as Meta;

export const Default = () => (
  <AppLayout title="Form Verify Code">
    <Subject />
  </AppLayout>
);

export const WithCustomErrorMessage = () => (
  <AppLayout title="Form Verify Code">
    <Subject localizedCustomCodeRequiredMessage="This is a spoofed custom error" />
  </AppLayout>
);

export const SubmitOnPasteDisabled = () => (
  <AppLayout title="Form Verify Code">
    <Subject submitFormOnPaste={false} />
  </AppLayout>
);

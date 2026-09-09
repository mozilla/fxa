/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import TimeoutAndCancel from '.';
import { Subject } from './mocks';

export default {
  title: 'Pages/Pair2/Supplicant/TimeoutAndCancel',
  component: TimeoutAndCancel,
  decorators: [withLocalization],
} as Meta;

// The pairing attempt expired before the user approved it on their computer.
export const TimedOut = () => <Subject />;

// The user cancelled pairing, on either device.
export const Canceled = () => <Subject reason="canceled" />;

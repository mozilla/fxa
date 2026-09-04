/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import TimeoutAndCancel from '.';
import { Subject } from './mocks';

export default {
  title: 'Pages/Pair2/Authority/TimeoutAndCancel',
  component: TimeoutAndCancel,
  decorators: [withLocalization],
} as Meta;

// The pairing request expired before it was approved, so the user still has an
// attempt to abandon — the secondary action is Cancel.
export const TimedOut = () => <Subject reason="timeout" />;

// Pairing was already called off, so there is nothing left to cancel — the
// secondary action sends the user to Sync settings instead.
export const Canceled = () => <Subject reason="canceled" />;

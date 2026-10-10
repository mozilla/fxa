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

// The pairing request expired before it was approved. The user is already
// signed in on this computer, so the only action is to try again.
export const TimedOut = () => <Subject reason="timeout" />;

// Pairing was called off, so a secondary action sends the user to Sync
// settings.
export const Canceled = () => <Subject reason="canceled" />;

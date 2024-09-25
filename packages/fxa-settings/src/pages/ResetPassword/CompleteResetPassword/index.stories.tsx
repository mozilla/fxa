/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { Subject } from './mocks';
import CompleteResetPassword from '.';

export default {
  title: 'Pages/ResetPassword/CompleteResetPassword',
  component: CompleteResetPassword,
  decorators: [withLocalization],
} as Meta;


export const NoSync = () => (
  <Subject recoveryKeyExists={true} estimatedSyncDeviceCount={0} />
);

export const SyncAndNoRecoveryKey = () => (
  <Subject recoveryKeyExists={false} estimatedSyncDeviceCount={2} />
);

export const SyncAndUnconfirmedRecoveryKey = () => (
  <Subject
    estimatedSyncDeviceCount={2}
    recoveryKeyExists={true}
    hasConfirmedRecoveryKey={false}
  />
);

export const SyncAndConfirmedRecoveryKey = () => (
  <Subject
    estimatedSyncDeviceCount={2}
    recoveryKeyExists={true}
    hasConfirmedRecoveryKey={true}
  />
);

export const SyncAndUnableToDetermineRecoveryKey = () => (
  <Subject
    estimatedSyncDeviceCount={undefined}
    recoveryKeyExists={undefined}
    hasConfirmedRecoveryKey={false}
  />
);

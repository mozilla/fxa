/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import RecoveryKeySetupHint from '.';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import AppLayout from '../AppLayout';

export default {
  title: 'Components/RecoveryKeySetupHint',
  component: RecoveryKeySetupHint,
  decorators: [withLocalization],
} as Meta;

const storyWithProps = (
  updateRecoveryKeyHint?: (hint: string) => Promise<void>
) => {
  const story = () => (
    <AppLayout>
      <RecoveryKeySetupHint
        viewName="whatever"
        navigateForward={() => Promise.resolve()}
        updateRecoveryKeyHint={
          updateRecoveryKeyHint || (() => Promise.resolve())
        }
      />
    </AppLayout>
  );
  return story;
};

export const Default = storyWithProps();

export const WithErrorOnSubmittingHint = storyWithProps((hint: string) => {
  return Promise.reject(new Error('Failed to update recovery key hint'));
});

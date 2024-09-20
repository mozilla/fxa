/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import RecoveryKeySetupHint from '.';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';

export default {
  title: 'Components/Settings/RecoveryKeySetupHint',
  component: RecoveryKeySetupHint,
  decorators: [withLocalization],
} as Meta;

const storyWithProps = () => {
  const story = () => (
    <RecoveryKeySetupHint
      viewName="whatever"
      navigateForward={() => {
        alert('navigating to next view within wizard');
      }}
      updateRecoveryKeyHint={() => Promise.resolve()}
    />
  );
  return story;
};

export const Default = storyWithProps();

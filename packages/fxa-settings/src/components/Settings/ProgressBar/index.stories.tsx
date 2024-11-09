/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { LocationProvider } from '@reach/router';
import ProgressBar from '.';

export default {
  title: 'Components/Settings/ProgressBar',
  component: ProgressBar,
  decorators: [
    withLocalization,
    (Story: StoryObj) => (
      <LocationProvider>
        <Story />
      </LocationProvider>
    ),
  ],
} as Meta;

export const FirstOfFiveSteps = () => (
  <ProgressBar currentStep={1} numberOfSteps={5} />
);

export const SecondOfFiveSteps = () => (
  <ProgressBar currentStep={2} numberOfSteps={5} />
);

export const FinalStep = () => (
  <ProgressBar currentStep={5} numberOfSteps={5} />
);

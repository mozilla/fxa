/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { action } from '@storybook/addon-actions';
import { FlowSetup2faPrompt } from '.';

export default {
  title: 'Components/Settings/FlowSetup2faPrompt',
  component: FlowSetup2faPrompt,
  decorators: [withLocalization],
} as Meta;

const handleContinueClick = action('continue-clicked');
const handleCancelClick = action('cancel-clicked');

export const Default = () => (
  <FlowSetup2faPrompt
    localizedPageTitle="Two-step authentication"
    serviceName="123Done"
    onContinue={handleContinueClick}
    onBackButtonClick={handleCancelClick}
  />
);

export const WithError = () => (
  <FlowSetup2faPrompt
    localizedPageTitle="Two-step authentication"
    serviceName="123Done"
    onContinue={handleContinueClick}
    onBackButtonClick={handleCancelClick}
    localizedErrorMessage="An error occurred while setting up two-step authentication."
  />
);

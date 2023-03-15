/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import { withLocalization } from '../../../../.storybook/decorators';
import { FlowContainer } from '.';
import { LocationProvider } from '@reach/router';
import { MOCK_CONTENT, MOCK_SUBTITLE, MOCK_TITLE } from './mocks';

export default {
  title: 'Components/Settings/FlowContainer',
  component: FlowContainer,
  decorators: [
    withLocalization,
    (Story) => (
      <LocationProvider>
        <Story />
      </LocationProvider>
    ),
  ],
} as Meta;

export const Default = () => (
  <FlowContainer title={MOCK_TITLE} subtitle={MOCK_SUBTITLE}>
    {MOCK_CONTENT}
  </FlowContainer>
);

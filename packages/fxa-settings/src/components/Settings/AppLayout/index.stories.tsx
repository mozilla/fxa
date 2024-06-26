import React from 'react';
import AppLayout from './index';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { createMockSettingsIntegration } from '../mocks';

export default {
  title: 'Components/Settings/AppLayout',
  component: AppLayout,
  decorators: [withLocalization],
} as Meta;

const integration = createMockSettingsIntegration();

export const Basic = () => (
  <AppLayout {...{ integration }}>
    <p>App content goes here</p>
  </AppLayout>
);

import React from 'react';
import SettingsLayout from './index';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';
import { createMockSettingsIntegration } from '../mocks';

export default {
  title: 'Components/Settings/SettingsLayout',
  component: SettingsLayout,
  decorators: [withLocalization],
} as Meta;

const integration = createMockSettingsIntegration();

export const Basic = () => (
  <SettingsLayout {...{ integration }}>
    <p>App content goes here</p>
  </SettingsLayout>
);

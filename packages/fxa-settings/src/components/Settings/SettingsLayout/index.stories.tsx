import React from 'react';
import SettingsLayout from './index';
import { Meta } from '@storybook/react';
import { withLocalization } from 'fxa-react/lib/storybooks';

export default {
  title: 'Components/Settings/SettingsLayout',
  component: SettingsLayout,
  decorators: [withLocalization],
} as Meta;

export const Basic = () => (
  <SettingsLayout>
    <p>App content goes here</p>
  </SettingsLayout>
);

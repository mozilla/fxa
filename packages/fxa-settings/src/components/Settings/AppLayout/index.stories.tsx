import React from 'react';
import AppLayout from './index';
import { Meta } from '@storybook/react';
import { withLocalization } from '../../../../.storybook/decorators';

export default {
  title: 'Components/Settings/AppLayout',
  component: AppLayout,
  decorators: [withLocalization],
} as Meta;

export const Basic = () => (
  <AppLayout>
    <p>App contents go here</p>
  </AppLayout>
);

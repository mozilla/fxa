import React from 'react';
import AppLayout from './index';
import { Meta } from '@storybook/react';

export default {
  title: 'Components/Settings/AppLayout',
  component: AppLayout,
} as Meta;

export const Basic = () => (
  <AppLayout>
    <p>App contents go here</p>
  </AppLayout>
);

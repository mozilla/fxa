import React from 'react';
import { storiesOf } from '@storybook/react';
import AppLayout from './index';

storiesOf('components/AppLayout', module).add('basic', () => (
  <AppLayout>
    <p>App contents go here</p>
  </AppLayout>
));

import React from 'react';
import { storiesOf } from '@storybook/react';
import AppLayout from './index';

storiesOf('components/AppLayout', module).add('basic', () => (
  <AppLayout
    avatarUrl={null}
    primaryEmail="user@example.com"
    hasSubscription={false}
  >
    <p>App contents go here</p>
  </AppLayout>
));

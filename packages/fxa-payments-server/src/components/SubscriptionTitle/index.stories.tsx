import React from 'react';
import { storiesOf } from '@storybook/react';
import MockApp from '../../../.storybook/components/MockApp';
import SubscriptionTitle from './index';

storiesOf('components/SubscriptionTitle', module).add('default', () => (
  <MockApp>
    <SubscriptionTitle screenType="create" />
  </MockApp>
));

import React from 'react';
import { storiesOf } from '@storybook/react';
import MockApp from '../../../.storybook/components/MockApp';
import Coupon from './index';

storiesOf('components/Coupon', module).add('default', () => (
  <MockApp>
    <Coupon />
  </MockApp>
));

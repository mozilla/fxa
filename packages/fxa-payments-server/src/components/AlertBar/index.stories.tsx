import React from 'react';
import { storiesOf } from '@storybook/react';
import { AlertBar } from './index';

storiesOf('components/AlertBar', module).add('basic', () => (
  <AlertBar className="alert">This is an alert.</AlertBar>
));

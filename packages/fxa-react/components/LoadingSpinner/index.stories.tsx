import React from 'react';
import { storiesOf } from '@storybook/react';
import LoadingSpinner from './index';

storiesOf('components/LoadingSpinner', module).add('basic', () => (
  <LoadingSpinner />
));

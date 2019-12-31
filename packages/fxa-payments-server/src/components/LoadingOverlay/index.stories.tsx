import React from 'react';
import { storiesOf } from '@storybook/react';
import { LoadingOverlay } from './index';

storiesOf('components/LoadingOverlay', module).add('isLoading = true', () => (
  <LoadingOverlay isLoading={true} />
));

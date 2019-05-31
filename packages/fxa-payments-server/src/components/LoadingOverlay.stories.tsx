import React from 'react';
import { storiesOf } from '@storybook/react';
import { LoadingOverlay } from './LoadingOverlay';

storiesOf('components/LoadingOverlay', module)
  .add('isLoading = true', () => (
    <LoadingOverlay isLoading={true} />
  ))
  .add('isLoading = false', () => (
    <LoadingOverlay isLoading={false} />
  ));

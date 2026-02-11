import React from 'react';
import { LoadingOverlay } from './index';
import { Meta } from '@storybook/react';

export default {
  title: 'components/LoadingOverlay',
  component: LoadingOverlay,
} as Meta;

export const Default = () => {
  return <LoadingOverlay isLoading={true} />;
};

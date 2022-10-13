import React from 'react';
import { AcceptedCards } from './index';
import { Meta } from '@storybook/react';

export default {
  title: 'routes/Product/AcceptedCards',
  component: AcceptedCards,
} as Meta;

export const Default = () => {
  return <AcceptedCards />;
};

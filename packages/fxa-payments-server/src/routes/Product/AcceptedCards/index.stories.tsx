import React from 'react';
import { AcceptedCards } from './index';
import { Meta } from '@storybook/react';

export default {
  title: 'routes/Product/AcceptedCards',
  component: AcceptedCards,
} as Meta;

const storyWithContext = (storyName?: string) => {
  const story = () => <AcceptedCards />

  if (storyName) story.storyName = storyName;
  return story;
}

export const Default = storyWithContext('default');

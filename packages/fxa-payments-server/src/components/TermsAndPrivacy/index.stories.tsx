import React from 'react';
import { TermsAndPrivacy } from './index';
import { SELECTED_PLAN } from '../../lib/mock-data';
import MockApp from '../../../.storybook/components/MockApp';
import { Meta } from '@storybook/react';

export default {
  title: 'components/TermsAndPrivacy',
  component: TermsAndPrivacy,
} as Meta;

const storyWithContext = (
  languages?: readonly string[],
  showFXALinks?: boolean,
  storyName?: string
) => {
  const story = () => (
    <MockApp languages={languages}>
      <TermsAndPrivacy plan={SELECTED_PLAN} showFXALinks={showFXALinks} />
    </MockApp>
  );

  if (storyName) story.storyName = storyName;
  return story;
};

export const Default = storyWithContext([], false, 'default locale');

export const DefaultLocaleWithFXALinks = storyWithContext(
  [],
  true,
  'default locale with fxa links'
);

export const WithFRLocale = storyWithContext(['fr'], false, 'with fr locale');

export const WithFRLocaleAndFXALinks = storyWithContext(
  ['fr'],
  true,
  'with fr locale and fxa links'
);

import React from 'react';
import { TermsAndPrivacy } from './index';
import { SELECTED_PLAN } from '../../lib/mock-data';
import MockApp from '../../../.storybook/components/MockApp';
import { Meta } from '@storybook/react';

export default {
  title: 'components/TermsAndPrivacy',
  component: TermsAndPrivacy,
} as Meta;

const storyWithProps = ({
  languages = [],
  showFXALinks = false,
}: {
  languages?: readonly string[];
  showFXALinks?: boolean;
}) => {
  const story = () => (
    <MockApp languages={languages}>
      <TermsAndPrivacy plan={SELECTED_PLAN} showFXALinks={showFXALinks} />
    </MockApp>
  );

  return story;
};

export const Default = storyWithProps({});
export const DefaultLocaleWithFXALinks = storyWithProps({ showFXALinks: true });
export const WithFRLocale = storyWithProps({ languages: ['fr'] });
export const WithFRLocaleAndFXALinks = storyWithProps({
  languages: ['fr'],
  showFXALinks: true,
});

import React from 'react';
import MockApp from '../../../.storybook/components/MockApp';
import { AppLayout, SignInLayout, SettingsLayout } from './index';
import { Meta } from '@storybook/react';

export default {
  title: 'components/AppLayout',
  component: AppLayout,
} as Meta;

const storyWithProps = (signin: boolean, storyName?: string) => {
  const story = () => (
    <MockApp>
      {signin ? (
        <SettingsLayout>
          <p style={{ padding: '0 2em 4em 2em' }}>App contents go here</p>
        </SettingsLayout>
      ) : (
        <SignInLayout>
          <p>App contents go here</p>
        </SignInLayout>
      )}
    </MockApp>
  );

  if (storyName) story.storyName = storyName;
  return story;
};

export const Default = storyWithProps(false, 'Settings Layout');
export const SigninLayout = storyWithProps(true, 'Sign-In Layout');

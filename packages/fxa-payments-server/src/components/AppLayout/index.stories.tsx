import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import MockApp from '../../../.storybook/components/MockApp';
import { SignInLayout, SettingsLayout } from './index';

const meta: Meta = {
  title: 'components/AppLayout',
};
export default meta;

type Story = StoryObj;

export const SettingsLayoutStory: Story = {
  name: 'Settings layout',
  render: () => (
    <MockApp>
      <SettingsLayout>
        <p style={{ padding: '0 2em 4em 2em' }}>App contents go here</p>
      </SettingsLayout>
    </MockApp>
  ),
};

export const SignInLayoutStory: Story = {
  name: 'Sign-in layout',
  render: () => (
    <MockApp>
      <SignInLayout>
        <p>App contents go here</p>
      </SignInLayout>
    </MockApp>
  ),
};

import React from 'react';
import MockApp from '../../../.storybook/components/MockApp';
import { SignInLayout, SettingsLayout } from './index';

export default { title: 'components/AppLayout' };
export const settingsLayout = () => (
  <MockApp>
    <SettingsLayout>
      <p style={{ padding: '0 2em 4em 2em' }}>App contents go here</p>
    </SettingsLayout>
  </MockApp>
);

export const signInLayout = () => (
  <MockApp>
    <SignInLayout>
      <p>App contents go here</p>
    </SignInLayout>
  </MockApp>
);

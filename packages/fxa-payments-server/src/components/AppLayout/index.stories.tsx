import React from 'react';
import { storiesOf } from '@storybook/react';
import MockApp from '../../../.storybook/components/MockApp';
import { SignInLayout, SettingsLayout } from './index';

storiesOf('components/AppLayout', module)
  .add('Settings layout', () => (
    <MockApp>
      <SettingsLayout>
        <p style={{ padding: '0 2em 4em 2em' }}>App contents go here</p>
      </SettingsLayout>
    </MockApp>
  ))
  .add('Sign-in layout', () => (
    <MockApp>
      <SignInLayout>
        <p>App contents go here</p>
      </SignInLayout>
    </MockApp>
  ));

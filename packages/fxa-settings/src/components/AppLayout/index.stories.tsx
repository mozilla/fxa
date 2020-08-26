import React from 'react';
import { storiesOf } from '@storybook/react';
import { MockedProvider } from '@apollo/client/testing';
import { MockedCache } from '../../models/_mocks';
import AppLayout from './index';

storiesOf('Components|AppLayout', module)
  .addDecorator((getStory) => (
    <MockedProvider>
      <MockedCache>{getStory()}</MockedCache>
    </MockedProvider>
  ))
  .add('basic', () => (
    <AppLayout>
      <p>App contents go here</p>
    </AppLayout>
  ));

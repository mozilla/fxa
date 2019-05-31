import React from 'react';
import { storiesOf } from '@storybook/react';
import { Profile } from './Profile';

storiesOf('components/Profile', module)
  .add('with all profile data', () => (
    <Profile profile={{
      error: null,
      loading: false,
      result: {
        avatar: '',
        displayName: 'Foo Barson',
        email: 'foo@example.com',
      }
    }} />
  ));

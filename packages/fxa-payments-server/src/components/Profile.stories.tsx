import React from 'react';
import { storiesOf } from '@storybook/react';
import { Profile } from './Profile';
import { Profile as ProfileType } from '../store/types';

function init() {
  storiesOf('components/Profile', module).add('with all profile data', () => (
    <Profile
      profile={{
        error: null,
        loading: false,
        result: mockProfile,
      }}
    />
  ));
}

const mockProfile: ProfileType = {
  amrValues: ['blah'],
  avatar: 'http://example.com',
  avatarDefault: false,
  displayName: 'Foo Barson',
  email: 'foo@example.com',
  locale: 'en-US',
  twoFactorAuthentication: false,
  uid: '8675309abcde',
};

init();

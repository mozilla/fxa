import React from 'react';
import {
  render,
  cleanup,
} from '@testing-library/react';
import 'jest-dom/extend-expect';

import { Profile as ProfileType} from '../store/types';
import { Profile } from './Profile';

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

afterEach(cleanup);

it('displays expected profile details', () => {
  const { getByTestId } = render(
    <Profile profile={{
      error: null,
      loading: false,
      result: mockProfile
    }} />
  );
  expect(getByTestId('avatar')).toHaveAttribute('src', mockProfile.avatar);
  expect(getByTestId('displayName')).toHaveTextContent('' + mockProfile.displayName);
  expect(getByTestId('email')).toHaveTextContent(mockProfile.email);
});

it('omits display name when not set', () => {
  const profile = {
    ...mockProfile,
    displayName: null
  };
  const { queryByTestId } = render(
    <Profile profile={{
      error: null,
      loading: false,
      result: profile
    }} />
  );
  expect(queryByTestId('displayName')).toBeNull();
});

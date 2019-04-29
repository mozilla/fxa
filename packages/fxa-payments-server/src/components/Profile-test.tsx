import React from 'react';
import { mount } from 'enzyme';
import { assert } from 'chai';
import { Profile } from './Profile';
import {
  Profile as ProfileType,
  ProfileFetchState
} from '../store/types';

describe('components/Profile', () => {
  const mockProfile: ProfileType = {
    amrValues: ['123', '456'],
    avatar: 'http://example.com/avatar.png',
    avatarDefault: false,
    displayName: 'Foo Bar',
    email: 'foo@example.com',
    locale: 'en-US',
    twoFactorAuthentication: false,
    uid: '8675309',
  };

  it('should work', () => {
    const profileResult: ProfileFetchState = {
      loading: false,
      error: null,
      result: mockProfile,
    };

    const subject = mount(<Profile profile={profileResult} />);

    assert.equal(subject.find('.profileCard').length, 1);
    assert.lengthOf(subject.find('.profileCard'), 1);
    assert.equal(subject.find('.profileCard .avatar').prop('src'), mockProfile.avatar);
    assert.equal(subject.find('.profileCard .displayName').text(), mockProfile.displayName);
    assert.equal(subject.find('.profileCard .email').text(), mockProfile.email);
  });
});
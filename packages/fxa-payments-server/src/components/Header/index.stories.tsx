/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Meta } from '@storybook/react';
import MockApp from '../../../.storybook/components/MockApp';
import { Header, HeaderProps } from './index';
import { Profile } from '../../store/types';

export default {
  title: 'components/Header',
  component: Header,
} as Meta;

const profile: Profile = {
  avatar: 'http://placekitten.com/256/256',
  displayName: 'Foxy77',
  email: 'foxy@firefox.com',
  amrValues: ['amrval'],
  avatarDefault: true,
  locale: 'en',
  twoFactorAuthentication: false,
  uid: 'UIDSTRINGHERE',
  metricsEnabled: true,
};

const storyWithProps = ({ profile }: HeaderProps) => {
  const story = () => (
    <MockApp>
      <Header profile={profile} />
    </MockApp>
  );
  return story;
};

export const Default = storyWithProps({
  profile,
});

export const NoProfile = storyWithProps({});

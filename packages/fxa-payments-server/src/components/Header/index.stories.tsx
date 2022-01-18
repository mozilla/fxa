/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { storiesOf } from '@storybook/react';
import MockApp from '../../../.storybook/components/MockApp';
import Header from './index';
import { Profile } from '../../store/types';

const userProfile: Profile = {
  avatar: 'http://placekitten.com/256/256',
  displayName: 'Foxy77',
  email: 'foxy@firefox.com',
  amrValues: ['amrval'],
  avatarDefault: true,
  locale: 'en-US',
  twoFactorAuthentication: false,
  uid: 'UIDSTRINGHERE',
  metricsEnabled: true,
};

storiesOf('components/Header', module)
  .add('default', () => (
    <MockApp>
      <Header {...{ profile: userProfile }} />
    </MockApp>
  ))
  .add('no profile', () => (
    <MockApp>
      <Header />
    </MockApp>
  ));

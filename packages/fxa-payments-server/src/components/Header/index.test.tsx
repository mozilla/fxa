/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import Header from './index';
import { Profile } from '../../store/types';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';

let userProfile: Profile = {
  avatar: './avatar.svg',
  displayName: 'Foxy77',
  email: 'foxy@firefox.com',
  amrValues: ['amrval'],
  avatarDefault: true,
  locale: 'en',
  twoFactorAuthentication: false,
  uid: 'UIDSTRINGHERE',
  metricsEnabled: true,
};

afterEach(cleanup);

describe('Header', () => {
  it('renders as expected', () => {
    const subject = () => {
      return renderWithLocalizationProvider(
        <Header {...{ profile: userProfile }} />
      );
    };

    const { queryByTestId } = subject();

    const avatar = queryByTestId('avatar');
    expect(avatar).toHaveAttribute('alt', userProfile.displayName);
  });

  it('renderWithLocalizationProviders without profile', () => {
    userProfile.displayName = null;
    const subject = () => {
      return renderWithLocalizationProvider(<Header />);
    };

    const { queryByTestId } = subject();

    const brand = queryByTestId('branding');
    expect(brand).toBeVisible();
  });

  it('alt falls back to email is displayName is null', () => {
    userProfile.displayName = null;
    const subject = () => {
      return renderWithLocalizationProvider(
        <Header {...{ profile: userProfile }} />
      );
    };

    const { queryByTestId } = subject();

    const avatar = queryByTestId('avatar');
    expect(avatar).toHaveAttribute('alt', userProfile.email);
  });
});

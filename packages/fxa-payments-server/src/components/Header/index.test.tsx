import React from 'react';
import { render, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import Header from './index';
import { Profile } from '../../store/types';

let userProfile: Profile = {
  avatar: './avatar.svg',
  displayName: 'Foxy77',
  email: 'foxy@firefox.com',
  amrValues: ['amrval'],
  avatarDefault: true,
  locale: 'en-US',
  twoFactorAuthentication: false,
  uid: 'UIDSTRINGHERE',
};

afterEach(cleanup);

describe('Header', () => {
  it('renders as expected', () => {
    const subject = () => {
      return render(<Header {...{ profile: userProfile }} />);
    };

    const { queryByTestId } = subject();

    const branding = queryByTestId('branding');
    expect(branding).toHaveAttribute('title', 'firefox');

    const avatar = queryByTestId('avatar');
    expect(avatar).toHaveAttribute('alt', userProfile.displayName);
  });

  it('alt falls back to email is displayName is null', () => {
    userProfile.displayName = null;
    const subject = () => {
      return render(<Header {...{ profile: userProfile }} />);
    };

    const { queryByTestId } = subject();

    const avatar = queryByTestId('avatar');
    expect(avatar).toHaveAttribute('alt', userProfile.email);
  });
});

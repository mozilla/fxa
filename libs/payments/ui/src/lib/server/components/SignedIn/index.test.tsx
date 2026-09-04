/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { render, screen } from '@testing-library/react';
import { SignedIn } from './index';

jest.mock('@fxa/payments/ui', () => ({
  __esModule: true,
  Banner: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="banner">{children}</div>
  ),
  BannerVariant: {
    SignedIn: 'signed-in',
  },
}));

describe('SignedIn', () => {
  it('renders the user email', () => {
    render(<SignedIn email="user@example.com" />);
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
  });

  it('renders inside a Banner', () => {
    render(<SignedIn email="user@example.com" />);
    expect(screen.getByTestId('banner')).toBeInTheDocument();
  });
});

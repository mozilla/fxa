/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../../../models/mocks';
import SigninPasskeyFallback from '.';

describe('SigninPasskeyFallback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders email, heading, password field, and continue button', () => {
    renderWithRouter(<SigninPasskeyFallback email="user@example.com" />);
    expect(screen.getByText('Enter your password to sync')).toBeInTheDocument();
    expect(screen.getByTestId('passkey-fallback-email')).toHaveTextContent(
      'user@example.com'
    );
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByTestId('continue-button')).toBeInTheDocument();
  });

  it('calls onContinue with the entered password', async () => {
    const user = userEvent.setup();
    const onContinue = jest.fn().mockResolvedValue(undefined);
    renderWithRouter(
      <SigninPasskeyFallback email="user@example.com" onContinue={onContinue} />
    );
    await user.type(screen.getByLabelText('Password'), 'hunter2-the-sequel');
    await user.click(screen.getByTestId('continue-button'));
    expect(onContinue).toHaveBeenCalledWith('hunter2-the-sequel');
  });

  it('shows a banner when localizedErrorMessage is set', () => {
    renderWithRouter(
      <SigninPasskeyFallback
        email="user@example.com"
        localizedErrorMessage="Incorrect password"
      />
    );
    expect(screen.getByText('Incorrect password')).toBeInTheDocument();
  });
});

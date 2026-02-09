/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import ButtonPasskeySignin from '.';

describe('ButtonPasskeySignin', () => {
  it('renders in default state with passkey icon and text', () => {
    renderWithLocalizationProvider(<ButtonPasskeySignin />);

    screen.getByText('Sign in with passkey');
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();

    const passkeyIcon = screen.getByText('icon_passkey.min.svg');
    expect(passkeyIcon).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders loading state with spinner and loading text', () => {
    renderWithLocalizationProvider(<ButtonPasskeySignin loading={true} />);

    screen.getByText('Securely signing in…');
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();

    const loadingIcon = screen.getByText('icon_loading_arrow.min.svg');
    expect(loadingIcon).toBeInTheDocument();
    expect(loadingIcon).toHaveAttribute('aria-hidden', 'true');
    expect(loadingIcon).toHaveClass('animate-spin-slow');
  });

  it('calls onClick handler when clicked in default state', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();

    renderWithLocalizationProvider(
      <ButtonPasskeySignin onClick={handleClick} />
    );

    const button = screen.getByRole('button');
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick handler when loading', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();

    renderWithLocalizationProvider(
      <ButtonPasskeySignin onClick={handleClick} loading={true} />
    );

    const button = screen.getByRole('button');
    await user.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });
});

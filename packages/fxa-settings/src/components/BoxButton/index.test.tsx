/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { PasskeyIcon } from '../Icons';
import BoxButton from '.';

describe('BoxButton', () => {
  it('renders label, leading icon, and default trailing chevron', () => {
    renderWithLocalizationProvider(
      <BoxButton leadingIcon={<PasskeyIcon ariaHidden />}>
        Sign in with passkey
      </BoxButton>
    );

    screen.getByText('Sign in with passkey');
    const button = screen.getByRole('button');
    expect(button).toBeEnabled();
    expect(button).toHaveAttribute('type', 'button');
    expect(screen.getByText('icon_passkey.min.svg')).toBeInTheDocument();
    expect(screen.getByText('icon_chevron_right.min.svg')).toBeInTheDocument();
  });

  it('renders without a leading icon when leadingIcon prop is omitted', () => {
    renderWithLocalizationProvider(<BoxButton>No icon</BoxButton>);

    expect(screen.queryByText('icon_passkey.min.svg')).not.toBeInTheDocument();
    screen.getByText('No icon');
    expect(screen.getByText('icon_chevron_right.min.svg')).toBeInTheDocument();
  });

  it('renders a custom trailing icon when provided', () => {
    renderWithLocalizationProvider(
      <BoxButton trailingIcon={<span data-testid="custom-trailing">→</span>}>
        Custom trailing icon
      </BoxButton>
    );

    expect(screen.getByTestId('custom-trailing')).toBeInTheDocument();
    expect(
      screen.queryByText('icon_chevron_right.min.svg')
    ).not.toBeInTheDocument();
  });

  it('shows spinner and disables the button when isLoading is true', () => {
    renderWithLocalizationProvider(
      <BoxButton isLoading>Signing in…</BoxButton>
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();

    const spinner = screen.getByText('icon_loading_arrow.min.svg');
    expect(spinner).toHaveClass('animate-spin-slow');
    expect(
      screen.queryByText('icon_chevron_right.min.svg')
    ).not.toBeInTheDocument();
  });

  it('respects an explicit disabled prop', () => {
    renderWithLocalizationProvider(<BoxButton disabled>Off</BoxButton>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('forwards type and aria-label', () => {
    renderWithLocalizationProvider(
      <BoxButton type="submit" aria-label="Continue with Google">
        Continue with Google
      </BoxButton>
    );
    const button = screen.getByRole('button', { name: 'Continue with Google' });
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    renderWithLocalizationProvider(
      <BoxButton onClick={handleClick}>Click me</BoxButton>
    );

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when isLoading', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    renderWithLocalizationProvider(
      <BoxButton isLoading onClick={handleClick}>
        Loading
      </BoxButton>
    );

    await user.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });
});

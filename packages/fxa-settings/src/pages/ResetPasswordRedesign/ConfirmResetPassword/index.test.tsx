// TODO in FXA-7890 import tests from previous design and update

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Subject } from './mocks';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// add Glean mocks

const mockResendCode = jest.fn(() => Promise.resolve(true));
const mockVerifyCode = jest.fn((code: string) => Promise.resolve());

describe('ConfirmResetPassword', () => {
  beforeEach(() => {
    mockResendCode.mockClear();
    mockVerifyCode.mockClear();
  });

  it('renders as expected', async () => {
    renderWithLocalizationProvider(<Subject />);

    await expect(
      screen.getByRole('heading', { name: 'Enter confirmation code' })
    ).toBeVisible();

    expect(
      screen.getByText(/Enter the 8-digit confirmation code we sent to/)
    ).toBeVisible();

    expect(screen.getAllByRole('textbox')).toHaveLength(8);
    const buttons = await screen.findAllByRole('button');
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toHaveTextContent('Continue');
    expect(buttons[0]).toHaveAttribute('aria-disabled', 'true');
    expect(buttons[1]).toHaveTextContent('Resend code');

    const links = await screen.findAllByRole('link');
    expect(links).toHaveLength(3);
    expect(links[0]).toHaveAccessibleName(/Mozilla logo/);
    expect(links[1]).toHaveTextContent('Sign in');
    expect(links[2]).toHaveTextContent('Use a different account');
  });

  it('submits with valid code', async () => {
    const user = userEvent.setup();
    renderWithLocalizationProvider(<Subject verifyCode={mockVerifyCode} />);

    const textboxes = screen.getAllByRole('textbox');
    await user.click(textboxes[0]);
    await waitFor(() => {
      user.paste('12345678');
    });

    // name here is the accessible name from aria-label
    const submitButton = screen.getByRole('button', {
      name: 'Continue',
    });
    expect(submitButton).toHaveAttribute('aria-disabled', 'false');

    await waitFor(() => user.click(submitButton));
    expect(mockVerifyCode).toHaveBeenCalledTimes(1);
    expect(mockVerifyCode).toHaveBeenCalledWith('12345678');
  });

  it('handles resend code', async () => {
    const user = userEvent.setup();
    renderWithLocalizationProvider(<Subject resendCode={mockResendCode} />);

    const resendButton = screen.getByRole('button', {
      name: 'Resend code',
    });

    await waitFor(() => user.click(resendButton));
    expect(mockResendCode).toHaveBeenCalledTimes(1);

    expect(
      screen.getByText(
        'Email re-sent. Add accounts@firefox.com to your contacts to ensure a smooth delivery.'
      )
    ).toBeVisible();
  });

  describe('errors', () => {
    it('can display error passed in by the container', () => {
      renderWithLocalizationProvider(
        <Subject initialErrorMessage="Something went wrong" />
      );

      expect(screen.getByText('Something went wrong')).toBeVisible();
    });

    it('clears the error when input is modified', async () => {
      const user = userEvent.setup();
      renderWithLocalizationProvider(
        <Subject initialErrorMessage="Something went wrong" />
      );

      expect(screen.getByText('Something went wrong')).toBeVisible();

      await waitFor(() =>
        user.type(screen.getByRole('textbox', { name: 'Digit 1 of 8' }), '1')
      );

      expect(
        screen.queryByText('Something went wrong')
      ).not.toBeInTheDocument();
    });
  });
});

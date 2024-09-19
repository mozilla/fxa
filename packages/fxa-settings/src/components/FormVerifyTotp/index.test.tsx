/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import React from 'react';
import Subject from './mocks';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';

describe('FormVerifyTotp component', () => {
  it('renders as expected with default props', async () => {
    renderWithLocalizationProvider(<Subject />);
    expect(screen.getByText('Enter 6-digit code')).toBeVisible();
    expect(screen.getAllByRole('textbox')).toHaveLength(1);
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Submit');
  });

  describe('submit button', () => {
    it('is disabled on render', () => {
      renderWithLocalizationProvider(<Subject />);
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Submit');
      expect(button).toBeDisabled();
    });

    it('is enabled when numbers are typed into all inputs', async () => {
      const user = userEvent.setup();
      renderWithLocalizationProvider(<Subject />);
      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Submit');
      expect(button).toBeDisabled();

      await user.type(input, '123456');

      expect(button).toBeEnabled();
    });

    it('is enabled when numbers are pasted into all inputs', async () => {
      const user = userEvent.setup();
      renderWithLocalizationProvider(<Subject />);
      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Submit');
      expect(button).toBeDisabled();

      await user.click(input);

      await waitFor(() => {
        user.paste('123456');
      });

      expect(button).toBeEnabled();
    });
  });
});

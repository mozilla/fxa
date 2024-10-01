/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import GleanMetrics from '../../../lib/glean';
import { Subject } from './mocks';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import userEvent from '@testing-library/user-event';
import { MOCK_EMAIL } from '../../mocks';

jest.mock('../../../lib/glean', () => ({
  __esModule: true,
  default: { passwordReset: { view: jest.fn(), submit: jest.fn() } },
}));

const mockRequestResetPasswordCode = jest.fn((email: string) =>
  Promise.resolve()
);

describe('ResetPassword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('renders', () => {
    it('as expected', async () => {
      renderWithLocalizationProvider(<Subject />);

      await expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'Reset your password'
      );
      expect(
        screen.getByRole('textbox', { name: 'Enter your email' })
      ).toBeVisible();
      expect(screen.getByRole('button', { name: 'Continue' })).toBeVisible();
      expect(screen.getByText('Remember your password?')).toBeVisible();
      expect(screen.getByRole('link', { name: 'Sign in' })).toBeVisible();
    });

    it('emits a Glean event on render', async () => {
      renderWithLocalizationProvider(<Subject />);
      await expect(screen.getByRole('heading', { level: 1 })).toBeVisible();
      expect(GleanMetrics.passwordReset.view).toHaveBeenCalledTimes(1);
    });
  });

  describe('submit', () => {
    it('trims trailing space in email', async () => {
      const user = userEvent.setup();
      renderWithLocalizationProvider(
        <Subject requestResetPasswordCode={mockRequestResetPasswordCode} />
      );

      await expect(screen.getByRole('heading', { level: 1 })).toBeVisible();

      await waitFor(() =>
        user.type(screen.getByRole('textbox'), `${MOCK_EMAIL} `)
      );

      await waitFor(() => user.click(screen.getByRole('button')));

      expect(mockRequestResetPasswordCode).toBeCalledWith(MOCK_EMAIL);

      expect(GleanMetrics.passwordReset.view).toHaveBeenCalledTimes(1);
      expect(GleanMetrics.passwordReset.submit).toHaveBeenCalledTimes(1);
    });

    it('trims leading space in email', async () => {
      const user = userEvent.setup();
      renderWithLocalizationProvider(
        <Subject requestResetPasswordCode={mockRequestResetPasswordCode} />
      );

      await expect(screen.getByRole('heading', { level: 1 })).toBeVisible();

      await waitFor(() =>
        user.type(screen.getByRole('textbox'), ` ${MOCK_EMAIL}`)
      );

      await waitFor(() => user.click(screen.getByRole('button')));

      expect(mockRequestResetPasswordCode).toBeCalledWith(MOCK_EMAIL);
      expect(GleanMetrics.passwordReset.view).toHaveBeenCalledTimes(1);
      expect(GleanMetrics.passwordReset.submit).toHaveBeenCalledTimes(1);
    });

    describe('handles errors', () => {
      it('with an empty email', async () => {
        const user = userEvent.setup();
        renderWithLocalizationProvider(
          <Subject requestResetPasswordCode={mockRequestResetPasswordCode} />
        );

        await expect(screen.getByRole('heading', { level: 1 })).toBeVisible();
        await waitFor(() => user.click(screen.getByRole('button')));

        expect(screen.getByText('Valid email required')).toBeVisible();
        expect(mockRequestResetPasswordCode).not.toBeCalled();
        expect(GleanMetrics.passwordReset.view).toHaveBeenCalledTimes(1);
        expect(GleanMetrics.passwordReset.submit).not.toHaveBeenCalled();
      });

      it('with an invalid email', async () => {
        const user = userEvent.setup();
        renderWithLocalizationProvider(
          <Subject requestResetPasswordCode={mockRequestResetPasswordCode} />
        );

        await expect(screen.getByRole('heading', { level: 1 })).toBeVisible();
        await waitFor(() => user.type(screen.getByRole('textbox'), 'boop'));

        await waitFor(() => user.click(screen.getByRole('button')));

        expect(screen.getByText('Valid email required')).toBeVisible();
        expect(mockRequestResetPasswordCode).not.toBeCalled();
        expect(GleanMetrics.passwordReset.view).toHaveBeenCalledTimes(1);
        expect(GleanMetrics.passwordReset.submit).not.toHaveBeenCalled();
      });
    });
  });
});

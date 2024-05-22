/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import GleanMetrics from '../../../lib/glean';
import { Subject } from './mocks';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { MozServices } from '../../../lib/types';
import userEvent from '@testing-library/user-event';
import { MOCK_EMAIL } from '../../mocks';

jest.mock('../../../lib/glean', () => ({
  __esModule: true,
  default: { resetPassword: { view: jest.fn(), submit: jest.fn() } },
}));

const mockRequestResetPasswordCode = jest.fn((email: string) =>
  Promise.resolve()
);

describe('ResetPassword', () => {
  beforeEach(() => {
    (GleanMetrics.resetPassword.view as jest.Mock).mockClear();
    (GleanMetrics.resetPassword.submit as jest.Mock).mockClear();
    mockRequestResetPasswordCode.mockClear();
  });

  describe('renders', () => {
    it('as expected with default service', async () => {
      renderWithLocalizationProvider(<Subject />);

      await expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'Password reset to continue to account settings'
      );
      expect(
        screen.getByRole('textbox', { name: 'Enter your email' })
      ).toBeVisible();
      expect(
        screen.getByRole('button', { name: 'Send me reset instructions' })
      ).toBeVisible();
      expect(screen.getByText('Remember your password?')).toBeVisible();
      expect(screen.getByRole('link', { name: 'Sign in' })).toBeVisible();
    });

    it('as expected with custom service', async () => {
      renderWithLocalizationProvider(
        <Subject serviceName={MozServices.FirefoxSync} />
      );
      const headingEl = await screen.findByRole('heading', { level: 1 });
      expect(headingEl).toHaveTextContent(
        `Password reset to continue to Firefox Sync`
      );
    });

    it('emits a Glean event on render', async () => {
      renderWithLocalizationProvider(<Subject />);
      await expect(screen.getByRole('heading', { level: 1 })).toBeVisible();
      expect(GleanMetrics.resetPassword.view).toHaveBeenCalledTimes(1);
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

      expect(GleanMetrics.resetPassword.view).toHaveBeenCalledTimes(1);
      expect(GleanMetrics.resetPassword.submit).toHaveBeenCalledTimes(1);
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
      expect(GleanMetrics.resetPassword.view).toHaveBeenCalledTimes(1);
      expect(GleanMetrics.resetPassword.submit).toHaveBeenCalledTimes(1);
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
        expect(GleanMetrics.resetPassword.view).toHaveBeenCalledTimes(1);
        expect(GleanMetrics.resetPassword.submit).not.toHaveBeenCalled();
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
        expect(GleanMetrics.resetPassword.view).toHaveBeenCalledTimes(1);
        expect(GleanMetrics.resetPassword.submit).not.toHaveBeenCalled();
      });
    });
  });
});

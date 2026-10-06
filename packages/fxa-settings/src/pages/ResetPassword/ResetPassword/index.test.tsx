/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen, waitFor } from '@testing-library/react';
import GleanMetrics from '../../../lib/glean';
import { Subject } from './mocks';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import userEvent from '@testing-library/user-event';
import { MOCK_EMAIL } from '../../mocks';
import { renderWithRouter } from '../../../models/mocks';
import ResetPassword from '.';
import { MozServices } from '../../../lib/types';

jest.mock('../../../lib/glean', () => ({
  __esModule: true,
  default: {
    passwordReset: {
      view: jest.fn(),
      submit: jest.fn(),
    },
  },
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
        'Forgot your password?'
      );
      expect(
        screen.getByRole('link', {
          name: 'Try signing in with Google, Apple, or a passkey instead.',
        })
      ).toHaveAttribute('href', '/');
      expect(
        screen.getByText(
          /Or enter your email and we’ll send you a code to reset your password\./
        )
      ).toBeVisible();
      expect(
        screen.getByRole('textbox', { name: 'Enter your email' })
      ).toBeVisible();
      expect(screen.getByRole('button', { name: 'Continue' })).toBeVisible();
      expect(
        screen.getByText(
          /Resetting your password may affect whether you can recover synced browser data\./
        )
      ).toBeVisible();
      expect(screen.getByRole('link', { name: /^Learn more/ })).toHaveAttribute(
        'href',
        'https://support.mozilla.org/kb/how-change-or-reset-your-mozilla-account-password'
      );
    });

    it.each([
      {
        name: 'Try signing in with Google, Apple, or a passkey instead.',
        gleanId: 'reset_password_signin_alternatives_link',
      },
      {
        name: /^Learn more/,
        gleanId: 'reset_password_data_recovery_learn_more_link',
      },
    ])('tags the $name link for Glean clicks', ({ name, gleanId }) => {
      renderWithLocalizationProvider(<Subject />);

      expect(screen.getByRole('link', { name })).toHaveAttribute(
        'data-glean-id',
        gleanId
      );
    });

    it('does not render the remember-password footer', async () => {
      renderWithLocalizationProvider(<Subject />);
      await expect(screen.getByRole('heading', { level: 1 })).toBeVisible();

      expect(
        screen.queryByRole('link', { name: 'Sign in' })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(/remember your password\?/i)
      ).not.toBeInTheDocument();
    });

    it('keeps the query params on the sign-in link', async () => {
      renderWithLocalizationProvider(
        <Subject initialEntries={['/reset_password?service=sync']} />
      );

      expect(
        screen.getByRole('link', {
          name: 'Try signing in with Google, Apple, or a passkey instead.',
        })
      ).toHaveAttribute('href', '/?service=sync');
    });

    it.each([
      { typed: ` ${MOCK_EMAIL} `, prefillEmail: MOCK_EMAIL },
      { typed: 'boop', prefillEmail: undefined },
    ])(
      'passes prefillEmail $prefillEmail when the sign-in link is clicked after typing "$typed"',
      async ({ typed, prefillEmail }) => {
        const user = userEvent.setup();
        const { router } = renderWithRouter(
          <ResetPassword
            requestResetPasswordCode={mockRequestResetPasswordCode}
            serviceName={MozServices.Default}
            setErrorMessage={jest.fn()}
            setCurrentSplitLayout={jest.fn()}
          />,
          { route: '/reset_password?service=sync' }
        );

        await user.type(screen.getByRole('textbox'), typed);
        await user.click(
          screen.getByRole('link', {
            name: 'Try signing in with Google, Apple, or a passkey instead.',
          })
        );

        expect(router.state.location.pathname).toBe('/');
        expect(router.state.location.search).toBe('?service=sync');
        expect(router.state.location.state).toEqual({ prefillEmail });
      }
    );

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

      await waitFor(() =>
        user.click(screen.getByRole('button', { name: 'Continue' }))
      );

      expect(mockRequestResetPasswordCode).toHaveBeenCalledWith(MOCK_EMAIL);

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

      await waitFor(() =>
        user.click(screen.getByRole('button', { name: 'Continue' }))
      );

      expect(mockRequestResetPasswordCode).toHaveBeenCalledWith(MOCK_EMAIL);
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
        await waitFor(() =>
          user.click(screen.getByRole('button', { name: 'Continue' }))
        );

        expect(screen.getByText('Valid email required')).toBeVisible();
        expect(mockRequestResetPasswordCode).not.toHaveBeenCalled();
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

        await waitFor(() =>
          user.click(screen.getByRole('button', { name: 'Continue' }))
        );

        expect(screen.getByText('Valid email required')).toBeVisible();
        expect(mockRequestResetPasswordCode).not.toHaveBeenCalled();
        expect(GleanMetrics.passwordReset.view).toHaveBeenCalledTimes(1);
        expect(GleanMetrics.passwordReset.submit).not.toHaveBeenCalled();
      });
    });
  });
});

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';

import { MOCK_TOTP_INFO, Subject } from './mocks';
import userEvent from '@testing-library/user-event';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import GleanMetrics from '../../../lib/glean';
import { JwtNotFoundError } from '../../../lib/cache';

const mockNavigate = jest.fn();
jest.mock('../../../lib/hooks/useNavigateWithQuery', () => ({
  useNavigateWithQuery: jest.fn(() => mockNavigate),
}));

const mockAlertBar = {
  success: jest.fn(),
  error: jest.fn(),
};
jest.mock('../../../models', () => ({
  ...jest.requireActual('../../../models'),
  useAlertBar: jest.fn(() => mockAlertBar),
}));

jest.mock('../../../lib/glean', () => ({
  __esModule: true,
  default: {
    accountPref: {
      ...jest.requireActual('../../../lib/glean').default.accountPref,
      twoStepAuthQrCodeSuccess: jest.fn(),
    },
  },
}));

const mockErrorHandler = jest.fn();
jest.mock('react-error-boundary', () => ({
  ...jest.requireActual('react-error-boundary'),
  useErrorHandler: () => mockErrorHandler,
}));

describe('Page2faChange', () => {
  it('renders as expected', async () => {
    renderWithLocalizationProvider(<Subject />);

    expect(
      await screen.findByRole('heading', {
        name: 'Change two-step authentication',
      })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', {
        name: 'Connect to your authenticator app',
      })
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        'Scan this QR code using any authenticator app, like Duo or Google Authenticator. This creates a new connection, any old connections won’t work anymore.'
      )
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('textbox', { name: 'Enter 6-digit code' })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('button', { name: 'Continue' })
    ).toBeInTheDocument();
  });

  it('navigates to home page and emits metrics on success', async () => {
    renderWithLocalizationProvider(
      <Subject
        account={{
          startReplaceTotpWithJwt: jest.fn().mockResolvedValue(MOCK_TOTP_INFO),
          confirmReplaceTotpWithJwt: jest
            .fn()
            .mockImplementation((_) => Promise.resolve()),
        }}
      />
    );

    const codeInput = await screen.findByRole('textbox', {
      name: 'Enter 6-digit code',
    });
    const continueButton = await screen.findByRole('button', {
      name: 'Continue',
    });
    await userEvent.type(codeInput, '000000');
    await userEvent.click(continueButton);
    await waitFor(() =>
      expect(mockAlertBar.success).toHaveBeenCalledWith(
        'Two-step authentication has been updated'
      )
    );
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        '/settings#two-step-authentication',
        { replace: true }
      );
    });

    expect(
      GleanMetrics.accountPref.twoStepAuthQrCodeSuccess
    ).toHaveBeenCalled();
  });

  it('navigates to home and shows error alert bar if failed to get TOTP info', async () => {
    renderWithLocalizationProvider(
      <Subject
        account={{
          startReplaceTotpWithJwt: jest.fn().mockRejectedValue(new Error()),
        }}
      />
    );

    await waitFor(() =>
      expect(mockAlertBar.error).toHaveBeenCalledWith(
        'There was an error replacing your two-step authentication app. Try again later.'
      )
    );
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        '/settings#two-step-authentication',
        { replace: true }
      );
    });
  });

  it('shows error banner if invalid code is entered', async () => {
    renderWithLocalizationProvider(
      <Subject
        account={{
          startReplaceTotpWithJwt: jest.fn().mockResolvedValue(MOCK_TOTP_INFO),
          confirmReplaceTotpWithJwt: jest.fn().mockRejectedValue(new Error()),
        }}
      />
    );
    const codeInput = await screen.findByRole('textbox', {
      name: 'Enter 6-digit code',
    });
    const continueButton = await screen.findByRole('button', {
      name: 'Continue',
    });
    await userEvent.type(codeInput, '000000');
    await userEvent.click(continueButton);

    expect(
      await screen.findByText(
        'Invalid or expired code. Check your authenticator app and try again.'
      )
    ).toBeInTheDocument();
  });

  it('invokes the MFA errorHandler if the error is due to an expired jwt', async () => {
    const missingJwtError = new JwtNotFoundError();
    renderWithLocalizationProvider(
      <Subject
        account={{
          startReplaceTotpWithJwt: jest.fn().mockResolvedValue(MOCK_TOTP_INFO),
          confirmReplaceTotpWithJwt: jest
            .fn()
            .mockRejectedValue(missingJwtError),
        }}
      />
    );
    const codeInput = await screen.findByRole('textbox', {
      name: 'Enter 6-digit code',
    });
    const continueButton = await screen.findByRole('button', {
      name: 'Continue',
    });
    await userEvent.type(codeInput, '000000');
    await userEvent.click(continueButton);

    expect(mockErrorHandler).toHaveBeenCalledWith(missingJwtError);
  });
});

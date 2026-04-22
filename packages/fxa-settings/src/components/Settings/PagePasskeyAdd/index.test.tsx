/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { PagePasskeyAdd } from '.';
import { Account, AppContext } from '../../../models';
import { mockAppContext, mockSettingsContext } from '../../../models/mocks';
import { SettingsContext } from '../../../models/contexts/SettingsContext';
import { MfaContext } from '../MfaGuard';
import {
  WebAuthnErrorCategory,
  WebAuthnErrorType,
} from '../../../lib/passkeys/webauthn-errors';

// Mock navigate
const mockNavigateWithQuery = jest.fn();
jest.mock('../../../lib/hooks/useNavigateWithQuery', () => ({
  useNavigateWithQuery: () => mockNavigateWithQuery,
}));

// Mock LoadingSpinner
jest.mock('fxa-react/components/LoadingSpinner', () => () => (
  <div data-testid="loading-spinner">Loading…</div>
));

// Mock Sentry
const mockCaptureException = jest.fn();
jest.mock('@sentry/browser', () => ({
  captureException: (...args: unknown[]) => mockCaptureException(...args),
}));

// Mock WebAuthn utilities
const mockCreateCredential = jest.fn();
jest.mock('../../../lib/passkeys/webauthn', () => ({
  createCredential: (...args: unknown[]) => mockCreateCredential(...args),
}));

const mockHandleWebAuthnError = jest.fn();
jest.mock('../../../lib/passkeys/webauthn-errors', () => ({
  ...jest.requireActual('../../../lib/passkeys/webauthn-errors'),
  handleWebAuthnError: (...args: unknown[]) => mockHandleWebAuthnError(...args),
}));

// Mock cache
jest.mock('../../../lib/cache', () => ({
  ...jest.requireActual('../../../lib/cache'),
  JwtTokenCache: {
    hasToken: jest.fn(() => true),
    getToken: jest.fn(() => 'mock-jwt'),
    subscribe: jest.fn(() => () => {}),
    getSnapshot: jest.fn(() => ({})),
    getKey: jest.fn(() => 'key'),
  },
  sessionToken: jest.fn(() => 'session-123'),
}));

// Mock auth client methods
const mockBeginPasskeyRegistration = jest.fn();
const mockCompletePasskeyRegistration = jest.fn();

const mockAlertSuccess = jest.fn();
const mockAlertError = jest.fn();

const mockCreationOptions = {
  rp: { name: 'Mozilla', id: 'accounts.firefox.com' },
  user: { id: 'dXNlcg', name: 'test@example.com', displayName: 'Test' },
  challenge: 'Y2hhbGxlbmdl',
  pubKeyCredParams: [{ alg: -7, type: 'public-key' as const }],
};

const mockCredential = {
  id: 'Y3JlZA',
  rawId: 'Y3JlZA',
  type: 'public-key' as const,
  response: {
    clientDataJSON: 'ZXlK',
    attestationObject: 'bzJO',
  },
};

function renderPage() {
  const account = {
    getCachedJwtByScope: jest.fn(() => 'mock-jwt'),
    refresh: jest.fn(),
  } as unknown as Account;

  const authClient = {
    beginPasskeyRegistration: mockBeginPasskeyRegistration,
    completePasskeyRegistration: mockCompletePasskeyRegistration,
  };

  const alertBarInfo = {
    success: mockAlertSuccess,
    error: mockAlertError,
    info: jest.fn(),
    show: jest.fn(),
    hide: jest.fn(),
    setType: jest.fn(),
    setContent: jest.fn(),
    visible: false,
    type: 'success' as const,
    content: null,
  };

  return render(
    <AppContext.Provider
      value={mockAppContext({
        account,
        authClient: authClient as any,
      })}
    >
      <SettingsContext.Provider
        value={mockSettingsContext({
          alertBarInfo: alertBarInfo as any,
        })}
      >
        <MfaContext.Provider value="passkey">
          <PagePasskeyAdd />
        </MfaContext.Provider>
      </SettingsContext.Provider>
    </AppContext.Provider>
  );
}

describe('PagePasskeyAdd', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBeginPasskeyRegistration.mockResolvedValue(mockCreationOptions);
    mockCreateCredential.mockResolvedValue(mockCredential);
    mockCompletePasskeyRegistration.mockResolvedValue({
      credentialId: 'cred-1',
      name: 'Test Passkey',
      createdAt: Date.now(),
      lastUsedAt: null,
      transports: ['internal'],
      aaguid: 'aaguid-1',
      backupEligible: true,
      backupState: false,
      prfEnabled: false,
    });
  });

  it('shows loading modal on mount', () => {
    // Make the ceremony hang so we can see the modal
    mockBeginPasskeyRegistration.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByTestId('page-passkey-add')).toBeInTheDocument();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('Creating passkey…')).toBeInTheDocument();
    expect(
      screen.getByText('Follow the prompts on your device.')
    ).toBeInTheDocument();
    expect(screen.getByTestId('passkey-add-cancel')).toBeInTheDocument();
  });

  it('completes ceremony and shows success alert', async () => {
    renderPage();
    await waitFor(() => {
      expect(mockAlertSuccess).toHaveBeenCalledWith('Passkey created');
    });
    expect(mockNavigateWithQuery).toHaveBeenCalledWith('/settings#security', {
      replace: true,
    });
    expect(mockBeginPasskeyRegistration).toHaveBeenCalledWith('mock-jwt');
    expect(mockCreateCredential).toHaveBeenCalledWith(mockCreationOptions);
    expect(mockCompletePasskeyRegistration).toHaveBeenCalledWith(
      'mock-jwt',
      mockCredential,
      'Y2hhbGxlbmdl'
    );
  });

  it('handles user cancel (NotAllowedError)', async () => {
    const cancelError = new DOMException('User cancelled', 'NotAllowedError');
    mockCreateCredential.mockRejectedValue(cancelError);
    mockHandleWebAuthnError.mockReturnValue({
      category: WebAuthnErrorCategory.UserAction,
      errorType: WebAuthnErrorType.NotAllowed,
      ftlId: 'passkey-registration-error-not-allowed',
      fallbackText:
        'Passkey setup failed or is unavailable. Try again or choose another method.',
      logToSentry: false,
    });

    renderPage();
    await waitFor(() => {
      expect(mockAlertError).toHaveBeenCalled();
    });
    expect(mockNavigateWithQuery).toHaveBeenCalledWith('/settings#security', {
      replace: true,
    });
  });

  it('handles timeout error', async () => {
    const timeoutError = new DOMException('Timeout', 'TimeoutError');
    mockCreateCredential.mockRejectedValue(timeoutError);
    mockHandleWebAuthnError.mockReturnValue({
      category: WebAuthnErrorCategory.UserAction,
      errorType: WebAuthnErrorType.Timeout,
      ftlId: 'passkey-registration-error-timeout',
      fallbackText: 'Passkey setup was canceled. Try again.',
      logToSentry: false,
    });

    renderPage();
    await waitFor(() => {
      expect(mockAlertError).toHaveBeenCalled();
    });
    expect(mockNavigateWithQuery).toHaveBeenCalledWith('/settings#security', {
      replace: true,
    });
  });

  it('handles server error on beginPasskeyRegistration', async () => {
    const serverError = new Error('Server error');
    mockBeginPasskeyRegistration.mockRejectedValue(serverError);

    renderPage();
    await waitFor(() => {
      expect(mockAlertError).toHaveBeenCalledWith(
        'System not available. Try again later.'
      );
    });
    expect(mockCaptureException).toHaveBeenCalledWith(serverError);
    expect(mockNavigateWithQuery).toHaveBeenCalledWith('/settings#security', {
      replace: true,
    });
  });

  it('handles server error on completePasskeyRegistration', async () => {
    const serverError = new Error('Completion failed');
    mockCompletePasskeyRegistration.mockRejectedValue(serverError);

    renderPage();
    await waitFor(() => {
      expect(mockAlertError).toHaveBeenCalledWith(
        'System not available. Try again later.'
      );
    });
    expect(mockCaptureException).toHaveBeenCalledWith(serverError);
  });

  it('cancel button navigates back to settings', () => {
    mockBeginPasskeyRegistration.mockReturnValue(new Promise(() => {}));
    renderPage();
    fireEvent.click(screen.getByTestId('passkey-add-cancel'));
    expect(mockNavigateWithQuery).toHaveBeenCalledWith('/settings#security', {
      replace: true,
    });
  });
});

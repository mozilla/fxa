/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LocationProvider } from '@reach/router';

import { MfaGuardPagePasskeyAdd, PagePasskeyAdd } from '.';
import { Account, AppContext } from '../../../models';
import { mockAppContext, mockSettingsContext } from '../../../models/mocks';
import { SettingsContext } from '../../../models/contexts/SettingsContext';
import { AlertBarInfo } from '../../../models/AlertBarInfo';
import { MfaContext } from '../MfaGuard';
import { createCredential } from '../../../lib/passkeys/webauthn';
import {
  WebAuthnErrorCategory,
  WebAuthnErrorType,
} from '../../../lib/passkeys/webauthn-errors';
import GleanMetrics from '../../../lib/glean';

// Mock navigate
const mockNavigateWithQuery = jest.fn();
jest.mock('../../../lib/hooks/useNavigateWithQuery', () => ({
  useNavigateWithQuery: () => mockNavigateWithQuery,
}));

// Mock LoadingSpinner
jest.mock('fxa-react/components/LoadingSpinner', () => () => (
  <div data-testid="loading-spinner">Loading…</div>
));

// Mock the alert helpers so the dispatcher tests below can assert which
// one was invoked.
jest.mock('../../../lib/passkeys/passkey-custom-error-messages', () => ({
  notAllowedPasskeyMessage: () => 'mock-not-allowed-message',
  timeoutPasskeyMessage: () => 'mock-timeout-message',
  unsupportedPasskeyMessage: () => 'mock-unsupported-message',
}));

// Mock Sentry
const mockCaptureException = jest.fn();
jest.mock('@sentry/browser', () => ({
  captureException: (...args: unknown[]) => mockCaptureException(...args),
}));

const mockCreateCredential = jest.fn() as jest.MockedFunction<
  typeof createCredential
>;
const mockIsWebAuthnLevel3Supported = jest.fn(() => true);
jest.mock('../../../lib/passkeys/webauthn', () => ({
  createCredential: (
    ...args: Parameters<typeof createCredential>
  ): ReturnType<typeof createCredential> => mockCreateCredential(...args),
  isWebAuthnLevel3Supported: () => mockIsWebAuthnLevel3Supported(),
}));

const mockHandleWebAuthnError = jest.fn();
jest.mock('../../../lib/passkeys/webauthn-errors', () => ({
  ...jest.requireActual('../../../lib/passkeys/webauthn-errors'),
  handleWebAuthnError: (...args: unknown[]) => mockHandleWebAuthnError(...args),
}));

// Mock Glean
jest.mock('../../../lib/glean', () => ({
  __esModule: true,
  default: {
    accountPref: {
      passkeyCreateView: jest.fn(),
      passkeyCreateSuccessView: jest.fn(),
      passkeyCreateSubmitFrontendError: jest.fn(),
    },
  },
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

let alertBarInfo: AlertBarInfo;
let mockAlertSuccess: jest.SpyInstance;
let mockAlertError: jest.SpyInstance;

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
  clientExtensionResults: {},
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

  return render(
    <AppContext.Provider
      value={mockAppContext({
        account,
        authClient: authClient as any,
      })}
    >
      <SettingsContext.Provider value={mockSettingsContext({ alertBarInfo })}>
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
    alertBarInfo = new AlertBarInfo();
    mockAlertSuccess = jest.spyOn(alertBarInfo, 'success');
    mockAlertError = jest.spyOn(alertBarInfo, 'error');
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
    expect(GleanMetrics.accountPref.passkeyCreateView).toHaveBeenCalled();
    expect(
      GleanMetrics.accountPref.passkeyCreateSuccessView
    ).toHaveBeenCalled();
    expect(mockNavigateWithQuery).toHaveBeenCalledWith('/settings#security', {
      replace: true,
    });
    expect(mockBeginPasskeyRegistration).toHaveBeenCalledWith('mock-jwt');
    expect(mockCreateCredential).toHaveBeenCalledWith(
      mockCreationOptions,
      expect.any(AbortSignal)
    );
    expect(mockCompletePasskeyRegistration).toHaveBeenCalledWith(
      'mock-jwt',
      mockCredential,
      'Y2hhbGxlbmdl'
    );
  });

  it('shows the not-allowed message and navigates to settings on NotAllowedError', async () => {
    const cancelError = new DOMException('User cancelled', 'NotAllowedError');
    mockCreateCredential.mockRejectedValue(cancelError);
    mockHandleWebAuthnError.mockReturnValue({
      category: WebAuthnErrorCategory.UserAction,
      errorType: WebAuthnErrorType.NotAllowed,
      ftlId: 'passkey-registration-error-not-allowed-v2',
      fallbackText: 'Passkey setup couldn’t be completed.',
      logToSentry: false,
    });

    renderPage();
    await waitFor(() => {
      expect(mockAlertError).toHaveBeenCalledTimes(1);
    });
    expect(mockAlertError).toHaveBeenCalledWith('mock-not-allowed-message');
    expect(
      GleanMetrics.accountPref.passkeyCreateSubmitFrontendError
    ).toHaveBeenCalledWith({
      event: { reason: 'not_allowed' },
    });
    expect(mockHandleWebAuthnError).toHaveBeenCalledWith(
      cancelError,
      'registration',
      expect.any(Function),
      { hadExcludeCredentials: false }
    );
    expect(mockNavigateWithQuery).toHaveBeenCalledWith('/settings#security', {
      replace: true,
    });
  });

  it('shows the not-allowed message and navigates to settings on AbortError', async () => {
    const abortError = new DOMException('Aborted externally', 'AbortError');
    mockCreateCredential.mockRejectedValue(abortError);
    mockHandleWebAuthnError.mockReturnValue({
      category: WebAuthnErrorCategory.UserAction,
      errorType: WebAuthnErrorType.Abort,
      ftlId: 'passkey-registration-error-not-allowed-v2',
      fallbackText: 'Passkey setup couldn’t be completed.',
      logToSentry: false,
    });

    renderPage();
    await waitFor(() => {
      expect(mockAlertError).toHaveBeenCalledTimes(1);
    });
    expect(mockAlertError).toHaveBeenCalledWith('mock-not-allowed-message');
    expect(
      GleanMetrics.accountPref.passkeyCreateSubmitFrontendError
    ).toHaveBeenCalledWith({
      event: { reason: 'not_allowed' },
    });
    expect(mockNavigateWithQuery).toHaveBeenCalledWith('/settings#security', {
      replace: true,
    });
  });

  it('forwards hadExcludeCredentials=true when the server-sent options listed existing passkeys', async () => {
    mockBeginPasskeyRegistration.mockResolvedValue({
      ...mockCreationOptions,
      excludeCredentials: [
        { id: 'Y3JlZDE', type: 'public-key', transports: ['internal'] },
      ],
    });
    const cancelError = new DOMException('not allowed', 'NotAllowedError');
    mockCreateCredential.mockRejectedValue(cancelError);
    mockHandleWebAuthnError.mockReturnValue({
      category: WebAuthnErrorCategory.UserAction,
      errorType: WebAuthnErrorType.NotAllowed,
      userMessageKey: 'passkey-registration-error-not-allowed-existing',
      logToSentry: false,
    });

    renderPage();
    await waitFor(() => {
      expect(mockAlertError).toHaveBeenCalled();
    });
    expect(mockHandleWebAuthnError).toHaveBeenCalledWith(
      cancelError,
      'registration',
      expect.any(Function),
      { hadExcludeCredentials: true }
    );
  });

  it('renders the unsupported-passkey alert (with Learn more link) on NotSupportedError', async () => {
    const notSupportedError = new DOMException(
      'not supported',
      'NotSupportedError'
    );
    mockCreateCredential.mockRejectedValue(notSupportedError);
    mockHandleWebAuthnError.mockReturnValue({
      category: WebAuthnErrorCategory.DevicePlatform,
      errorType: WebAuthnErrorType.NotSupported,
      ftlId: 'passkey-registration-error-not-supported-v3',
      fallbackText:
        'This device couldn’t complete the passkey setup. Try another device or method.',
      logToSentry: true,
    });

    renderPage();
    await waitFor(() => {
      expect(mockAlertError).toHaveBeenCalledTimes(1);
    });
    expect(mockAlertError).toHaveBeenCalledWith('mock-unsupported-message');
    // Defensive case: pre-check at MfaGuardPagePasskeyAdd is the
    // primary handler. If we reach here (race), don't auto-redirect — the user
    // can use Cancel to navigate away.
    expect(mockNavigateWithQuery).not.toHaveBeenCalled();
  });

  it('shows the timeout-specific alert and navigates to settings on TimeoutError', async () => {
    const timeoutError = new DOMException('Timeout', 'TimeoutError');
    mockCreateCredential.mockRejectedValue(timeoutError);
    mockHandleWebAuthnError.mockReturnValue({
      category: WebAuthnErrorCategory.UserAction,
      errorType: WebAuthnErrorType.Timeout,
      ftlId: 'passkey-registration-error-timeout-v2',
      fallbackText: 'Passkey setup timed out.',
      logToSentry: false,
    });

    renderPage();
    await waitFor(() => {
      expect(mockAlertError).toHaveBeenCalled();
    });
    expect(mockAlertError).toHaveBeenCalledWith('mock-timeout-message');
    expect(
      GleanMetrics.accountPref.passkeyCreateSubmitFrontendError
    ).toHaveBeenCalledWith({
      event: { reason: 'timeout' },
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
        'There was a problem creating your passkey. Try again later.'
      );
    });
    expect(
      GleanMetrics.accountPref.passkeyCreateSubmitFrontendError
    ).toHaveBeenCalledWith({
      event: { reason: 'server_error' },
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
        'There was a problem creating your passkey. Try again later.'
      );
    });
    expect(mockCaptureException).toHaveBeenCalledWith(serverError);
  });

  it('shows "Passkey limit reached" when completePasskeyRegistration returns errno 226', async () => {
    const limitError = {
      errno: 226,
      message: 'Maximum number of passkeys reached',
      code: 400,
    };
    mockCompletePasskeyRegistration.mockRejectedValue(limitError);

    renderPage();
    await waitFor(() => {
      expect(mockAlertError).toHaveBeenCalledWith('Passkey limit reached');
    });
    expect(
      GleanMetrics.accountPref.passkeyCreateSubmitFrontendError
    ).toHaveBeenCalledWith({
      event: { reason: 'auth_error_226' },
    });
    expect(mockCaptureException).not.toHaveBeenCalled();
    expect(mockNavigateWithQuery).toHaveBeenCalledWith('/settings#security', {
      replace: true,
    });
  });

  it('shows "Passkey limit reached" when beginPasskeyRegistration returns errno 226', async () => {
    const limitError = {
      errno: 226,
      message: 'Maximum number of passkeys reached',
      code: 400,
    };
    mockBeginPasskeyRegistration.mockRejectedValue(limitError);

    renderPage();
    await waitFor(() => {
      expect(mockAlertError).toHaveBeenCalledWith('Passkey limit reached');
    });
    expect(
      GleanMetrics.accountPref.passkeyCreateSubmitFrontendError
    ).toHaveBeenCalledWith({
      event: { reason: 'auth_error_226' },
    });
    expect(mockCaptureException).not.toHaveBeenCalled();
    expect(mockNavigateWithQuery).toHaveBeenCalledWith('/settings#security', {
      replace: true,
    });
  });

  it('shows rate-limit message when beginPasskeyRegistration returns 429 with retryAfterLocalized', async () => {
    mockBeginPasskeyRegistration.mockRejectedValue({
      errno: 114,
      code: 429,
      message: 'Client has sent too many requests',
      retryAfter: 60,
      retryAfterLocalized: 'in 1 minute',
    });

    renderPage();
    await waitFor(() => {
      expect(mockAlertError).toHaveBeenCalledWith(
        expect.stringMatching(/Please try again in 1 minute/)
      );
    });
    expect(
      GleanMetrics.accountPref.passkeyCreateSubmitFrontendError
    ).toHaveBeenCalledWith({
      event: { reason: 'auth_error_114' },
    });
    expect(mockCaptureException).not.toHaveBeenCalled();
    expect(mockNavigateWithQuery).toHaveBeenCalledWith('/settings#security', {
      replace: true,
    });
  });

  it('shows rate-limit message when beginPasskeyRegistration returns 429 without retryAfterLocalized', async () => {
    mockBeginPasskeyRegistration.mockRejectedValue({
      errno: 114,
      code: 429,
      message: 'Client has sent too many requests',
    });

    renderPage();
    await waitFor(() => {
      expect(mockAlertError).toHaveBeenCalledWith(
        expect.stringMatching(/Please try again later/)
      );
    });
    expect(
      GleanMetrics.accountPref.passkeyCreateSubmitFrontendError
    ).toHaveBeenCalledWith({
      event: { reason: 'auth_error_114' },
    });
    expect(mockCaptureException).not.toHaveBeenCalled();
  });

  it('shows localized message for a known non-throttle auth error', async () => {
    // errno 226 (PASSKEY_LIMIT_REACHED) is a known auth error.
    mockBeginPasskeyRegistration.mockRejectedValue({
      errno: 226,
      message: 'Passkey limit reached',
    });

    renderPage();
    await waitFor(() => {
      expect(mockAlertError).toHaveBeenCalledWith(
        expect.stringMatching(/Passkey limit reached/)
      );
    });
    expect(
      GleanMetrics.accountPref.passkeyCreateSubmitFrontendError
    ).toHaveBeenCalledWith({
      event: { reason: 'auth_error_226' },
    });
    expect(mockCaptureException).not.toHaveBeenCalled();
    expect(mockAlertError).not.toHaveBeenCalledWith(
      'System not available. Try again later.'
    );
  });

  it('cancel button shows cancellation banner and navigates back to settings', () => {
    mockBeginPasskeyRegistration.mockReturnValue(new Promise(() => {}));
    renderPage();
    fireEvent.click(screen.getByTestId('passkey-add-cancel'));
    expect(mockAlertError).toHaveBeenCalledWith(
      'Passkey setup was canceled. Try again.'
    );
    expect(mockNavigateWithQuery).toHaveBeenCalledWith('/settings#security', {
      replace: true,
    });
  });

  it('cancel button aborts the in-flight WebAuthn ceremony', async () => {
    let capturedSignal: AbortSignal | undefined;
    mockCreateCredential.mockImplementation((_opts, signal) => {
      capturedSignal = signal;
      return new Promise(() => {});
    });
    renderPage();
    await waitFor(() => expect(capturedSignal).toBeDefined());
    expect(capturedSignal!.aborted).toBe(false);
    fireEvent.click(screen.getByTestId('passkey-add-cancel'));
    expect(capturedSignal!.aborted).toBe(true);
  });

  it('cancel between createCredential and completePasskeyRegistration skips the server completion call', async () => {
    // Hold createCredential resolution so we can click cancel after it resolves
    // but before the success path proceeds.
    let resolveCreate: (value: typeof mockCredential) => void = () => {};
    mockCreateCredential.mockImplementation(
      () =>
        new Promise<typeof mockCredential>((resolve) => {
          resolveCreate = resolve;
        })
    );
    renderPage();
    await waitFor(() => expect(mockCreateCredential).toHaveBeenCalled());
    fireEvent.click(screen.getByTestId('passkey-add-cancel'));
    resolveCreate(mockCredential);
    // Yield twice so the awaited continuation runs and observes wasCanceled.
    await Promise.resolve();
    await Promise.resolve();
    expect(mockCompletePasskeyRegistration).not.toHaveBeenCalled();
    expect(mockAlertSuccess).not.toHaveBeenCalled();
    expect(mockAlertError).toHaveBeenCalledWith(
      'Passkey setup was canceled. Try again.'
    );
  });

  it('cancel does not double-fire alerts when the AbortError surfaces in the catch block', async () => {
    mockCreateCredential.mockImplementation(
      (_opts, signal) =>
        new Promise<typeof mockCredential>((_resolve, reject) => {
          signal?.addEventListener('abort', () => {
            reject(new DOMException('Aborted', 'AbortError'));
          });
        })
    );
    renderPage();
    await waitFor(() => expect(mockCreateCredential).toHaveBeenCalled());
    fireEvent.click(screen.getByTestId('passkey-add-cancel'));
    await Promise.resolve();
    await Promise.resolve();
    // Only the cancel banner — the catch block must not fire its own banner.
    expect(mockAlertError).toHaveBeenCalledTimes(1);
    expect(mockAlertError).toHaveBeenCalledWith(
      'Passkey setup was canceled. Try again.'
    );
    expect(mockHandleWebAuthnError).not.toHaveBeenCalled();
  });
});

describe('MfaGuardPagePasskeyAdd pre-check', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    alertBarInfo = new AlertBarInfo();
    mockAlertSuccess = jest.spyOn(alertBarInfo, 'success');
    mockAlertError = jest.spyOn(alertBarInfo, 'error');
    mockIsWebAuthnLevel3Supported.mockReturnValue(true);
  });

  function renderWrapper() {
    return render(
      <LocationProvider>
        <AppContext.Provider value={mockAppContext()}>
          <SettingsContext.Provider
            value={mockSettingsContext({ alertBarInfo })}
          >
            <MfaContext.Provider value="passkey">
              <MfaGuardPagePasskeyAdd />
            </MfaContext.Provider>
          </SettingsContext.Provider>
        </AppContext.Provider>
      </LocationProvider>
    );
  }

  it('pushes the unsupported alert and redirects to settings before MFA fires when WebAuthn is unsupported', () => {
    mockIsWebAuthnLevel3Supported.mockReturnValue(false);
    const { container } = renderWrapper();
    expect(mockAlertError).toHaveBeenCalledTimes(1);
    expect(mockNavigateWithQuery).toHaveBeenCalledWith('/settings#security', {
      replace: true,
    });
    // PagePasskeyAdd never mounts when unsupported.
    expect(container).toBeEmptyDOMElement();
    // MFA ceremony is skipped entirely.
    expect(mockBeginPasskeyRegistration).not.toHaveBeenCalled();
  });
});

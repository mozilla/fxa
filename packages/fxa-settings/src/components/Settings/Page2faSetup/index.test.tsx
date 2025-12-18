/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import { Page2faSetup } from '.';
import { Config } from '../../../lib/config';
import { Account, AppContext } from '../../../models';
import { mockAppContext } from '../../../models/mocks';
import { MfaContext } from '../MfaGuard';
import {
  MOCK_BACKUP_CODES,
  MOCK_FULL_PHONE_NUMBER,
} from '../../../pages/mocks';

// Component mocks (expose only minimal UI) ───────────────────────────────────

// Auth app verification
jest.mock('../FlowSetup2faApp', () => (props: any) => (
  <div data-testid="app-step">
    {/* Simulate user entering a TOTP code */}
    <button onClick={() => props.verifyCode('123456')}>verify</button>
  </div>
));

// Backup method choice
jest.mock('../FlowSetup2faBackupChoice', () => (props: any) => (
  <div data-testid="choice-step">
    <button onClick={() => props.onSubmitCb('code')}>choose-code</button>
    <button onClick={() => props.onSubmitCb('phone')}>choose-phone</button>
  </div>
));

// Backup code download
jest.mock('../FlowSetup2faBackupCodeDownload', () => (props: any) => (
  <div data-testid="download-step">
    <button onClick={props.onBackButtonClick}>back</button>
    <button onClick={props.onContinue}>continue</button>
  </div>
));

// Backup code confirm
jest.mock('../FlowSetup2faBackupCodeConfirm', () => (props: any) => (
  <div data-testid="confirm-step">
    <button onClick={() => props.verifyCode(MOCK_BACKUP_CODES[0])}>
      confirm-code
    </button>
  </div>
));

// Phone submit
jest.mock('../FlowSetupRecoveryPhoneSubmitNumber', () => (props: any) => (
  <div data-testid="phone-step">
    <button
      onClick={async () => {
        await props.verifyPhoneNumber(MOCK_FULL_PHONE_NUMBER);
        props.navigateForward();
      }}
    >
      submit-phone
    </button>
  </div>
));

// SMS confirm
jest.mock('../FlowSetupRecoveryPhoneConfirmCode', () => (props: any) => (
  <div data-testid="sms-step">
    <button
      onClick={async () => {
        await props.verifyRecoveryCode('000000');
      }}
    >
      confirm-sms
    </button>
  </div>
));

// Guard wrapper
jest.mock('../VerifiedSessionGuard', () => (props: any) => (
  <div data-testid="guard">{props.children}</div>
));

// Spinner
jest.mock('fxa-react/components/LoadingSpinner', () => () => (
  <div data-testid="loading-spinner">Loading…</div>
));

// Utility & hook mocks ───────────────────────────────────────────────────────

const mockGenerateRecoveryCodes = jest
  .fn()
  .mockResolvedValue(MOCK_BACKUP_CODES);

jest.mock('../../../lib/totp-utils', () => ({
  totpUtils: {
    generateRecoveryCodes: (...args: any[]) =>
      mockGenerateRecoveryCodes(...args),
  },
}));

const mockNavigateWithQuery = jest.fn();
jest.mock('../../../lib/hooks/useNavigateWithQuery', () => ({
  useNavigateWithQuery: () => mockNavigateWithQuery,
}));

jest.mock('../../../lib/glean', () => ({
  __esModule: true,
  default: {
    accountPref: {
      twoStepAuthQrCodeSuccess: jest.fn(),
    },
  },
}));

const mockUseTotpSetup = jest.fn();
jest.mock('../../../lib/hooks/useTotpSetup', () => ({
  useTotpSetup: () => mockUseTotpSetup(),
}));

// Shared config / helpers ────────────────────────────────────────────────────

const config: Config = {
  l10n: { strict: false },
  recoveryCodes: { count: 10, length: 10 },
} as unknown as Config;

const baseTotpInfo = { secret: 'SECRET', barcodeUri: 'otpauth://dummy' };

function renderWithAccount(
  account = { recoveryPhone: { available: false } } as unknown as Account
) {
  return render(
    <AppContext.Provider value={mockAppContext({ account, config })}>
      <MfaContext.Provider value="2fa">
        <Page2faSetup />
      </MfaContext.Provider>
    </AppContext.Provider>
  );
}

describe('Page2faSetup', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders a loading spinner while TOTP info is loading', () => {
    mockUseTotpSetup.mockReturnValue({
      totpInfo: null,
      loading: true,
      error: null,
    });
    renderWithAccount();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders the first step when TOTP info is ready', () => {
    mockUseTotpSetup.mockReturnValue({
      totpInfo: baseTotpInfo,
      loading: false,
      error: null,
    });
    renderWithAccount();
    expect(screen.getByTestId('app-step')).toBeInTheDocument();
  });

  it('renders error and navigates home if useTotpSetup returns error', () => {
    mockUseTotpSetup.mockReturnValue({
      totpInfo: null,
      loading: false,
      error: new Error('oops'),
    });
    renderWithAccount();
    expect(mockNavigateWithQuery).toHaveBeenCalled();
  });

  describe('backup‑code flow (no phone available)', () => {
    it('progresses through download & confirm and navigates home', async () => {
      const account = {
        recoveryPhone: { available: false },
        verifyTotpSetupCodeWithJwt: jest.fn(),
        completeTotpSetupWithJwt: jest.fn(),
        setRecoveryCodesWithJwt: jest.fn(),
      } as unknown as Account;
      mockUseTotpSetup.mockReturnValue({
        totpInfo: baseTotpInfo,
        loading: false,
        error: null,
      });

      renderWithAccount(account);

      // Step 1 → Step 3 (download)
      fireEvent.click(screen.getByText('verify'));
      await waitFor(() =>
        expect(account.verifyTotpSetupCodeWithJwt).toHaveBeenCalledWith(
          '123456'
        )
      );
      await waitFor(() =>
        expect(screen.getByTestId('download-step')).toBeInTheDocument()
      );

      // download → confirm
      fireEvent.click(screen.getByText('continue'));
      await waitFor(() =>
        expect(screen.getByTestId('confirm-step')).toBeInTheDocument()
      );

      // confirm backup code
      fireEvent.click(screen.getByText('confirm-code'));

      await waitFor(() => {
        expect(account.setRecoveryCodesWithJwt).toHaveBeenCalledWith(
          MOCK_BACKUP_CODES
        );
        expect(account.completeTotpSetupWithJwt).toHaveBeenCalled();
        expect(mockNavigateWithQuery).toHaveBeenCalled(); // navigated home
      });
    });
  });

  describe('recovery‑phone flow (phone available)', () => {
    it('progresses through phone & sms steps and navigates home', async () => {
      const account: Account = {
        recoveryPhone: { available: true },
        addRecoveryPhoneWithJwt: jest
          .fn()
          .mockResolvedValue({ nationalFormat: '+1 555‑0100' }),
        confirmRecoveryPhoneWithJwt: jest.fn(),
        verifyTotpSetupCodeWithJwt: jest.fn(),
        completeTotpSetupWithJwt: jest.fn(),
        refresh: jest.fn(),
      } as unknown as Account;

      mockUseTotpSetup.mockReturnValue({
        totpInfo: baseTotpInfo,
        loading: false,
        error: null,
      });

      renderWithAccount(account);

      // Step 1 → Step 2 (choice)
      fireEvent.click(screen.getByText('verify'));
      await waitFor(() =>
        expect(account.verifyTotpSetupCodeWithJwt).toHaveBeenCalledWith(
          '123456'
        )
      );
      await waitFor(() =>
        expect(screen.getByTestId('choice-step')).toBeInTheDocument()
      );

      // choose phone path → phone‑step
      fireEvent.click(screen.getByText('choose-phone'));
      await waitFor(() =>
        expect(screen.getByTestId('phone-step')).toBeInTheDocument()
      );

      // submit phone number → sms‑step
      fireEvent.click(screen.getByText('submit-phone'));
      await waitFor(() =>
        expect(screen.getByTestId('sms-step')).toBeInTheDocument()
      );

      // confirm SMS code – should trigger completeTotpSetupWithJwt + refresh
      fireEvent.click(screen.getByText('confirm-sms'));

      await waitFor(() => {
        expect(account.confirmRecoveryPhoneWithJwt).toHaveBeenCalledWith(
          '000000'
        );
        expect(account.completeTotpSetupWithJwt).toHaveBeenCalled();
        expect(mockNavigateWithQuery).toHaveBeenCalledWith(
          '/settings#connected-services',
          { replace: true },
          false
        );
      });
    });
  });
});

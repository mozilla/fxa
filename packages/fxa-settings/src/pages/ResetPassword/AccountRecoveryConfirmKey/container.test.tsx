/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { MemoryRouter } from 'react-router';
import { act } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';

import {
  MOCK_EMAIL,
  MOCK_KB,
  MOCK_RECOVERY_KEY,
  MOCK_RESET_TOKEN,
  MOCK_UID,
} from '../../mocks';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import AccountRecoveryConfirmKeyContainer from './container';
import { ResetPasswordIntegration } from '../interfaces';

const mockPasswordForgotVerifyCode = jest.fn();
const mockGetRecoveryKey = jest.fn();
const mockSensitiveDataClient: Record<string, unknown> = {};
jest.mock('../../../models/hooks', () => ({
  useAuthClient: () => ({
    passwordForgotVerifyCode: mockPasswordForgotVerifyCode,
    getRecoveryKey: mockGetRecoveryKey,
  }),
  useFtlMsgResolver: () => ({
    getMsg: (_id: string, fallback: string) => fallback,
  }),
  useSensitiveDataClient: () => mockSensitiveDataClient,
}));

jest.mock('../../../models', () => ({
  useConfig: () => ({ featureFlags: {} }),
}));

jest.mock('fxa-auth-client/lib/recoveryKey', () => ({
  getRecoveryKeyIdByUid: jest.fn().mockResolvedValue('recoveryKeyId'),
  decryptRecoveryKeyData: jest.fn(async () => ({ kB: MOCK_KB })),
}));

const mockNavigate = jest.fn();
jest.mock('../../../lib/hooks', () => ({
  useNavigateWithQuery: () => mockNavigate,
}));

let mockLocationState: Record<string, unknown> = {};
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useLocation: () => ({ state: mockLocationState }),
}));

let capturedProps: any;
jest.mock('.', () => (props: any) => {
  capturedProps = props;
  return null;
});

const mockIntegration: ResetPasswordIntegration = {
  isSync: () => false,
  getCmsInfo: () => undefined,
};

function renderComponent() {
  renderWithLocalizationProvider(
    <MemoryRouter>
      <AccountRecoveryConfirmKeyContainer integration={mockIntegration} />
    </MemoryRouter>
  );
}

describe('AccountRecoveryConfirmKeyContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(mockSensitiveDataClient).forEach(
      (key) => delete mockSensitiveDataClient[key]
    );
    capturedProps = undefined;
    mockLocationState = {
      code: 'code123',
      email: MOCK_EMAIL,
      token: 'passwordForgotToken',
      uid: MOCK_UID,
    };
    mockPasswordForgotVerifyCode.mockResolvedValue({
      accountResetToken: MOCK_RESET_TOKEN,
    });
    mockGetRecoveryKey.mockResolvedValue({ recoveryData: 'recoveryData' });
  });

  it('verifies the code for a recovery key reset, then fetches the bundle', async () => {
    renderComponent();
    await act(() => capturedProps.verifyRecoveryKey(MOCK_RECOVERY_KEY));

    expect(mockPasswordForgotVerifyCode).toHaveBeenCalledWith(
      'code123',
      'passwordForgotToken',
      { accountResetWithRecoveryKey: true, includeRecoveryKeyPrompt: false }
    );
    expect(mockGetRecoveryKey).toHaveBeenCalledWith(
      MOCK_RESET_TOKEN,
      'recoveryKeyId'
    );
    expect(mockNavigate).toHaveBeenCalledWith(
      '/account_recovery_reset_password',
      {
        state: {
          accountResetToken: MOCK_RESET_TOKEN,
          email: MOCK_EMAIL,
          kB: MOCK_KB,
          recoveryKeyId: 'recoveryKeyId',
        },
        replace: true,
      }
    );
    expect(mockSensitiveDataClient.DecryptedRecoveryKeyData).toEqual({
      kB: MOCK_KB,
    });
  });

  it('reuses an existing account reset token', async () => {
    mockLocationState.accountResetToken = MOCK_RESET_TOKEN;
    renderComponent();
    await act(() => capturedProps.verifyRecoveryKey(MOCK_RECOVERY_KEY));

    expect(mockPasswordForgotVerifyCode).not.toHaveBeenCalled();
    expect(mockGetRecoveryKey).toHaveBeenCalledWith(
      MOCK_RESET_TOKEN,
      'recoveryKeyId'
    );
  });

  it('shows the auth error for a known errno', async () => {
    mockGetRecoveryKey.mockRejectedValue({
      errno: AuthUiErrors.INVALID_RECOVERY_KEY.errno,
    });
    renderComponent();
    await act(() => capturedProps.verifyRecoveryKey(MOCK_RECOVERY_KEY));

    expect(capturedProps.errorMessage).toBe(
      AuthUiErrors.INVALID_RECOVERY_KEY.message
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('shows an unexpected error for an unknown errno', async () => {
    mockGetRecoveryKey.mockRejectedValue({ errno: 99999 });
    renderComponent();
    await act(() => capturedProps.verifyRecoveryKey(MOCK_RECOVERY_KEY));

    expect(capturedProps.errorMessage).toBe(
      AuthUiErrors.UNEXPECTED_ERROR.message
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

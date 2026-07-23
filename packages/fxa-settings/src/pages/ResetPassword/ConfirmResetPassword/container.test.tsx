/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { MemoryRouter } from 'react-router';
import { act } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';

import { MOCK_EMAIL, MOCK_PASSWORD_CHANGE_TOKEN, MOCK_UID } from '../../mocks';

import ConfirmResetPasswordContainer from './container';
import { ResetPasswordIntegration } from '../interfaces';
import { ConfirmResetPasswordProps } from './interfaces';

const mockVerifyOtp = jest.fn();
const mockRecoveryKeyStatus = jest.fn();
const mockTotpExists = jest.fn();
const mockSendOtp = jest.fn();
jest.mock('../../../models', () => ({
  __esModule: true,
  useAuthClient: () => ({
    passwordForgotVerifyOtp: mockVerifyOtp,
    passwordForgotRecoveryKeyStatus: mockRecoveryKeyStatus,
    checkTotpTokenExistsWithPasswordForgotToken: mockTotpExists,
    passwordForgotSendOtp: mockSendOtp,
  }),
  useConfig: () => ({
    featureFlags: {
      passkeysEnabled: true,
      passkeyAuthenticationEnabled: true,
    },
  }),
  useFtlMsgResolver: () => ({
    getMsg: (_id: string, fallback: string) => fallback,
  }),
}));

jest.mock('../../../lib/glean', () => ({
  __esModule: true,
  default: {
    passwordReset: {
      emailConfirmationSubmit: jest.fn(),
      emailConfirmationResendCode: jest.fn(),
    },
  },
}));

const mockNavigate = jest.fn();
jest.mock('../../../lib/hooks/useNavigateWithQuery', () => ({
  useNavigateWithQuery: () => mockNavigate,
}));

jest.mock('react-router', () => {
  const actual = jest.requireActual('react-router');
  return {
    ...actual,
    useLocation: () => ({
      pathname: '/confirm_reset_password',
      state: { email: MOCK_EMAIL, metricsContext: {} },
    }),
  };
});

let capturedProps: ConfirmResetPasswordProps | undefined;
jest.mock('.', () => (props: ConfirmResetPasswordProps) => {
  capturedProps = props;
  return null;
});

const mockIntegration: ResetPasswordIntegration = {
  isSync: () => false,
  getCmsInfo: () => undefined,
};

async function renderComponent() {
  renderWithLocalizationProvider(
    <MemoryRouter>
      <ConfirmResetPasswordContainer integration={mockIntegration} />
    </MemoryRouter>
  );
}

describe('ConfirmResetPasswordContainer', () => {
  beforeEach(() => {
    capturedProps = undefined;
    mockVerifyOtp.mockReset();
    mockRecoveryKeyStatus.mockReset();
    mockTotpExists.mockReset();
    mockNavigate.mockReset();
  });

  it('threads hasPasskey from verify_otp into navigation state', async () => {
    mockVerifyOtp.mockResolvedValueOnce({
      code: 'the-code',
      emailToHashWith: MOCK_EMAIL,
      token: MOCK_PASSWORD_CHANGE_TOKEN,
      uid: MOCK_UID,
      hasPasskey: true,
    });
    mockRecoveryKeyStatus.mockResolvedValueOnce({
      exists: false,
      estimatedSyncDeviceCount: 0,
    });
    mockTotpExists.mockResolvedValueOnce({ exists: false, verified: false });

    await renderComponent();

    await act(async () => {
      await capturedProps!.verifyCode('12345678');
    });

    expect(mockNavigate).toHaveBeenCalledWith('/complete_reset_password', {
      state: expect.objectContaining({
        uid: MOCK_UID,
        hasPasskey: true,
      }),
      replace: true,
    });
  });

  it('surfaces a localized error and does not navigate when verify_otp rejects', async () => {
    mockVerifyOtp.mockRejectedValueOnce('Some error');

    await renderComponent();

    await act(async () => {
      await capturedProps!.verifyCode('12345678');
    });

    expect(capturedProps!.errorMessage).toBe('Unexpected error');
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

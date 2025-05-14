/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { LocationProvider } from '@reach/router';
import { act } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';

import { MOCK_EMAIL, MOCK_PASSWORD_CHANGE_TOKEN, MOCK_UID } from '../../mocks';

import ResetPasswordRecoveryPhoneContainer from './container';

const mockRecoveryPhoneResetPasswordConfirm = jest.fn();
const mockRecoveryPhonePasswordResetSendCode = jest.fn();
const mockRecoveryPhoneGetWithPasswordForgotToken = jest.fn();
jest.mock('../../../models', () => ({
  __esModule: true,
  useAuthClient: () => ({
    recoveryPhoneResetPasswordConfirm: mockRecoveryPhoneResetPasswordConfirm,
    recoveryPhonePasswordResetSendCode: mockRecoveryPhonePasswordResetSendCode,
    recoveryPhoneGetWithPasswordForgotToken: mockRecoveryPhoneGetWithPasswordForgotToken,
  }),
  useFtlMsgResolver: () => ({
    getMsg: (_id: string, fallback: string) => fallback,
  }),
  useConfig: () => ({
    featureFlags: { recoveryPhonePasswordReset2fa: true },
  }),
}));

const mockNavigate = jest.fn();
jest.mock('../../../lib/hooks/useNavigateWithQuery', () => ({
  useNavigateWithQuery: () => mockNavigate,
}));

let mockLocationState = {
  code: 'ignored',
  email: MOCK_EMAIL,
  token: MOCK_PASSWORD_CHANGE_TOKEN,
  emailToHashWith: MOCK_EMAIL,
  recoveryKeyExists: false,
  estimatedSyncDeviceCount: 2,
  uid: MOCK_UID,
};

jest.mock('@reach/router', () => {
  const actual = jest.requireActual('@reach/router');
  return {
    ...actual,
    useLocation: () => ({
      pathname: '/reset_password_recovery_phone',
      state: mockLocationState,
    }),
  };
});

let capturedProps: any;
jest.mock('.', () => (props: any) => {
  capturedProps = props;
  return null;
});

async function renderComponent() {
  renderWithLocalizationProvider(
    <LocationProvider>
      <ResetPasswordRecoveryPhoneContainer />
    </LocationProvider>
  );
}

describe('ResetPasswordRecoveryPhoneContainer', () => {
  beforeEach(() => {
    capturedProps = undefined;
    mockRecoveryPhoneResetPasswordConfirm.mockReset();
    mockRecoveryPhonePasswordResetSendCode.mockReset();
  });

  it('calls authClient then navigates on success', async () => {
    mockRecoveryPhoneResetPasswordConfirm.mockResolvedValueOnce({ success: true });

    await renderComponent();

    await act(async () => {
      await capturedProps.verifyCode('123456');
    });

    expect(mockRecoveryPhoneResetPasswordConfirm).toHaveBeenCalledWith(
      MOCK_PASSWORD_CHANGE_TOKEN,
      '123456'
    );

    expect(mockNavigate).toHaveBeenCalledWith('/complete_reset_password', {
      state: expect.objectContaining({
        token: MOCK_PASSWORD_CHANGE_TOKEN,
        email: MOCK_EMAIL,
        uid: MOCK_UID,
      }),
      replace: true,
    });
  });
});

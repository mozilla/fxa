/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { LocationProvider } from '@reach/router';
import { act } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';

import { MOCK_EMAIL, MOCK_PASSWORD_CHANGE_TOKEN, MOCK_UID } from '../../mocks';

import ConfirmTotpResetPasswordContainer from './container';

const mockCheckTotp = jest.fn();
jest.mock('../../../models', () => ({
  __esModule: true,
  useAuthClient: () => ({
    checkTotpTokenCodeWithPasswordForgotToken: mockCheckTotp,
  }),
  useFtlMsgResolver: () => ({
    getMsg: (_id: string, fallback: string) => fallback,
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
      pathname: '/confirm_totp_reset_password',
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
      <ConfirmTotpResetPasswordContainer />
    </LocationProvider>
  );
}

describe('ConfirmTotpResetPasswordContainer', () => {
  beforeEach(() => {
    capturedProps = undefined;
    mockCheckTotp.mockReset();
    mockNavigate.mockReset();
  });

  it('calls authClient then navigates on success', async () => {
    mockCheckTotp.mockResolvedValueOnce({ success: true });

    await renderComponent();

    await act(async () => {
      await capturedProps.verifyCode('123456');
    });

    expect(mockCheckTotp).toHaveBeenCalledWith(
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

  it('sets localized error message when authClient returns success: false', async () => {
    mockCheckTotp.mockResolvedValueOnce({ success: false });

    await renderComponent();

    await act(async () => {
      await capturedProps.verifyCode('000000');
    });

    expect(capturedProps.codeErrorMessage).toBe('Valid code required');
  });

  it('forwards location.state when onTroubleWithCode is invoked', async () => {
    mockCheckTotp.mockResolvedValueOnce({ success: true });

    await renderComponent();

    capturedProps.onTroubleWithCode();

    expect(mockNavigate).toHaveBeenCalledWith(
      '/reset_password_totp_recovery_choice',
      {
        state: expect.objectContaining({
          token: MOCK_PASSWORD_CHANGE_TOKEN,
          email: MOCK_EMAIL,
          uid: MOCK_UID,
        }),
        replace: false,
      }
    );
  });
});

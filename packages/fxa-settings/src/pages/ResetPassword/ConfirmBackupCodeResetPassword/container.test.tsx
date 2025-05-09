/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { LocationProvider } from '@reach/router';
import { act } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { MOCK_EMAIL, MOCK_PASSWORD_CHANGE_TOKEN, MOCK_UID } from '../../mocks';
import ConfirmBackupCodeResetPasswordContainer from './container';

const mockConsume = jest.fn();
jest.mock('../../../models', () => ({
  __esModule: true,
  useAuthClient: () => ({
    consumeRecoveryCodeWithPasswordForgotToken: mockConsume,
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
    useLocation: () => {
      return {
        pathname: '/confirm_backup_code_reset_password',
        state: mockLocationState,
      };
    },
  };
});

let capturedProps: any;
jest.mock('.', () => (props: any) => {
  capturedProps = props;
  return null;
});

async function render() {
  renderWithLocalizationProvider(
    <LocationProvider>
      <ConfirmBackupCodeResetPasswordContainer />
    </LocationProvider>
  );
}

describe('ConfirmBackupCodeResetPasswordContainer', () => {
  beforeEach(() => {
    capturedProps = undefined;
    mockConsume.mockReset();
    mockNavigate.mockReset();
  });

  it('calls authClient then navigates on success', async () => {
    mockConsume.mockResolvedValueOnce(undefined);

    render();

    await act(async () => {
      await capturedProps.verifyBackupCode('BACKUPCODE');
    });

    expect(mockConsume).toHaveBeenCalledWith(
      MOCK_PASSWORD_CHANGE_TOKEN,
      'BACKUPCODE'
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

  it('sets localized error message when authClient throws', async () => {
    mockConsume.mockRejectedValueOnce('Some error');

    render();

    await act(async () => {
      await capturedProps.verifyBackupCode('INVALDCODE');
    });

    expect(capturedProps.codeErrorMessage).toBe('Unexpected error');
  });
});

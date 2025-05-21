/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as ModelsModule from '../../../models';
import * as ReachRouterModule from '@reach/router';
import * as ResetPasswordRecoveryChoiceModule from './index';

import { waitFor } from '@testing-library/react';
import { LocationProvider } from '@reach/router';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import {
  MOCK_MASKED_PHONE_NUMBER_WITH_COPY,
  mockLoadingSpinnerModule,
} from '../../mocks';
import ResetPasswordRecoveryChoiceContainer from './container';
import AuthClient from 'fxa-auth-client/lib/client';

jest.mock('../../../models', () => {
  return {
    ...jest.requireActual('../../../models'),
    useAuthClient: jest.fn(),
  };
});

const mockAuthClient = new AuthClient('http://localhost:9000', {
  keyStretchVersion: 2,
});

function mockModelsModule({
  mockGetRecoveryCodesExist = jest.fn().mockResolvedValue({
    hasBackupCodes: true,
    count: 3,
  }),
  mockRecoveryPhoneGet = jest.fn().mockResolvedValue({
    exists: true,
    phoneNumber: MOCK_MASKED_PHONE_NUMBER_WITH_COPY,
  }),
  mockRecoveryPhonePasswordResetSendCode = jest.fn().mockResolvedValue(true),
}) {
  mockAuthClient.getRecoveryCodesExistWithPasswordForgotToken =
    mockGetRecoveryCodesExist;
  mockAuthClient.recoveryPhoneGetWithPasswordForgotToken = mockRecoveryPhoneGet;
  mockAuthClient.recoveryPhonePasswordResetSendCode =
    mockRecoveryPhonePasswordResetSendCode;
  (ModelsModule.useAuthClient as jest.Mock).mockImplementation(
    () => mockAuthClient
  );
}

function mockResetPasswordRecoveryChoiceModule() {
  jest.spyOn(ResetPasswordRecoveryChoiceModule, 'default');
}

const mockLocation = (pathname: string, mockLocationState: Object) => {
  return {
    ...global.window.location,
    pathname,
    state: mockLocationState,
  };
};

const mockNavigate = jest.fn();
function mockReachRouter(pathname = '', mockLocationState = {}) {
  mockNavigate.mockReset();
  jest.spyOn(ReachRouterModule, 'useNavigate').mockReturnValue(mockNavigate);
  jest
    .spyOn(ReachRouterModule, 'useLocation')
    .mockImplementation(() => mockLocation(pathname, mockLocationState));
}

function applyDefaultMocks() {
  jest.resetAllMocks();
  jest.restoreAllMocks();
  mockModelsModule({});
  mockResetPasswordRecoveryChoiceModule();
  mockLoadingSpinnerModule();
  mockReachRouter('reset_password_totp_recovery_choice', {
    token: 'tok',
  });
}

function render() {
  renderWithLocalizationProvider(
    <LocationProvider>
      <ResetPasswordRecoveryChoiceContainer />
    </LocationProvider>
  );
}

describe('ResetPasswordRecoveryChoice container', () => {
  beforeEach(() => {
    applyDefaultMocks();
  });

  describe('initial state', () => {
    it('redirects if page is reached without location state', async () => {
      mockReachRouter('reset_password_totp_recovery_choice');
      render();
      expect(ResetPasswordRecoveryChoiceModule.default).not.toBeCalled();
      expect(mockNavigate).toBeCalledWith('/reset_password');
    });
  });

  describe('fetches recovery method data', () => {
    it('fetches recovery codes and phone number successfully', async () => {
      render();
      await waitFor(() => {
        expect(
          mockAuthClient.getRecoveryCodesExistWithPasswordForgotToken
        ).toHaveBeenCalled();
        expect(
          mockAuthClient.recoveryPhoneGetWithPasswordForgotToken
        ).toHaveBeenCalled();
        expect(ResetPasswordRecoveryChoiceModule.default).toBeCalled();
      });
    });

    it('passes the correct props to the child component', async () => {
      render();
      await waitFor(() => {
        expect(ResetPasswordRecoveryChoiceModule.default).toBeCalledWith(
          expect.objectContaining({
            lastFourPhoneDigits: '1234',
            numBackupCodes: 3,
            completeResetPasswordLocationState: { token: 'tok' },
          }),
          {}
        );
      });
    });

    it('handles absence of recovery phone gracefully', async () => {
      mockModelsModule({
        mockRecoveryPhoneGet: jest.fn().mockResolvedValue({ exists: false }),
      });
      render();
      await waitFor(() => {
        expect(
          mockAuthClient.getRecoveryCodesExistWithPasswordForgotToken
        ).toHaveBeenCalled();
        expect(
          mockAuthClient.recoveryPhoneGetWithPasswordForgotToken
        ).toHaveBeenCalled();
        expect(ResetPasswordRecoveryChoiceModule.default).not.toBeCalled();
        expect(mockNavigate).toBeCalledWith(
          '/confirm_backup_code_reset_password',
          {
            replace: true,
            state: { token: 'tok' },
          }
        );
      });
    });
  });
});

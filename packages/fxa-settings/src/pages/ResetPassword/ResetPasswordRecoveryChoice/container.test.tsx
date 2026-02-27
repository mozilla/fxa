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
  MOCK_MASKED_NUMBER_ENDING_IN_1234,
  mockLoadingSpinnerModule,
} from '../../mocks';
import ResetPasswordRecoveryChoiceContainer from './container';
import AuthClient from 'fxa-auth-client/lib/client';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';

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
    phoneNumber: MOCK_MASKED_NUMBER_ENDING_IN_1234,
  }),
  mockRecoveryPhonePasswordResetSendCode = jest.fn().mockResolvedValue(true),
}) {
  mockAuthClient.getRecoveryCodesExist = mockGetRecoveryCodesExist;
  mockAuthClient.recoveryPhoneGet = mockRecoveryPhoneGet;
  mockAuthClient.recoveryPhonePasswordResetSendCode =
    mockRecoveryPhonePasswordResetSendCode;
  (ModelsModule.useAuthClient as jest.Mock).mockImplementation(
    () => mockAuthClient
  );
}

let mockResetPasswordRecoveryChoice: jest.SpyInstance;

function mockResetPasswordRecoveryChoiceModule() {
  mockResetPasswordRecoveryChoice = jest.spyOn(
    ResetPasswordRecoveryChoiceModule,
    'default'
  );
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
    kind: 'kind',
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

  afterEach(() => {
    jest.clearAllMocks();
    if (mockResetPasswordRecoveryChoice) {
      mockResetPasswordRecoveryChoice.mockClear();
    }
  });

  describe('initial state', () => {
    it('redirects if page is reached without location state', async () => {
      mockReachRouter('reset_password_totp_recovery_choice');
      render();
      expect(mockResetPasswordRecoveryChoice).not.toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/reset_password');
    });
  });

  describe('fetches recovery method data', () => {
    it('fetches recovery codes and phone number successfully', async () => {
      render();
      await waitFor(() => {
        expect(mockAuthClient.getRecoveryCodesExist).toHaveBeenCalled();
        expect(mockAuthClient.recoveryPhoneGet).toHaveBeenCalled();
        expect(mockResetPasswordRecoveryChoice).toHaveBeenCalled();
      });
    });

    it('passes the correct props to the child component', async () => {
      render();
      await waitFor(() => {
        expect(mockResetPasswordRecoveryChoice).toHaveBeenCalledTimes(1);
        expect(mockResetPasswordRecoveryChoice).toHaveBeenCalledWith(
          {
            lastFourPhoneDigits: '1234',
            maskedPhoneNumber: 'Number ending in 1234',
            handlePhoneChoice: expect.any(Function),
            numBackupCodes: 3,
            completeResetPasswordLocationState: { token: 'tok', kind: 'kind' },
          },
          {}
        );
      });
    });

    it('auto-sends code and navigates when only phone available (0 backup codes)', async () => {
      mockModelsModule({
        mockGetRecoveryCodesExist: jest.fn().mockResolvedValue({
          hasBackupCodes: false,
          count: 0,
        }),
      });
      render();
      await waitFor(() => {
        expect(
          mockAuthClient.recoveryPhonePasswordResetSendCode
        ).toHaveBeenCalledWith('tok', 'kind');
        expect(mockNavigate).toHaveBeenCalledWith(
          '/reset_password_recovery_phone',
          {
            state: {
              token: 'tok',
              kind: 'kind',
              lastFourPhoneDigits: '1234',
              numBackupCodes: 0,
              sendError: undefined,
            },
            replace: true,
          }
        );
      });
    });

    it('auto-sends code and navigates with error when send fails', async () => {
      mockModelsModule({
        mockGetRecoveryCodesExist: jest.fn().mockResolvedValue({
          hasBackupCodes: false,
          count: 0,
        }),
        mockRecoveryPhonePasswordResetSendCode: jest
          .fn()
          .mockRejectedValue(AuthUiErrors.SMS_SEND_RATE_LIMIT_EXCEEDED),
      });
      render();
      await waitFor(() => {
        expect(
          mockAuthClient.recoveryPhonePasswordResetSendCode
        ).toHaveBeenCalledWith('tok', 'kind');
        expect(mockNavigate).toHaveBeenCalledWith(
          '/reset_password_recovery_phone',
          {
            state: {
              token: 'tok',
              kind: 'kind',
              lastFourPhoneDigits: '1234',
              numBackupCodes: 0,
              sendError: AuthUiErrors.SMS_SEND_RATE_LIMIT_EXCEEDED,
            },
            replace: true,
          }
        );
      });
    });

    it('handles absence of recovery phone gracefully', async () => {
      mockModelsModule({
        mockRecoveryPhoneGet: jest.fn().mockResolvedValue({ exists: false }),
      });
      render();
      await waitFor(() => {
        expect(mockAuthClient.getRecoveryCodesExist).toHaveBeenCalled();
        expect(mockAuthClient.recoveryPhoneGet).toHaveBeenCalled();
        expect(mockResetPasswordRecoveryChoice).not.toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith(
          '/confirm_backup_code_reset_password',
          {
            replace: true,
            state: { token: 'tok', kind: 'kind' },
          }
        );
      });
    });

    it('auto-sends to phone when backup codes fetch fails but phone succeeds', async () => {
      mockModelsModule({
        mockGetRecoveryCodesExist: jest
          .fn()
          .mockRejectedValue(new Error('Network error')),
      });
      render();
      await waitFor(() => {
        expect(
          mockAuthClient.recoveryPhonePasswordResetSendCode
        ).toHaveBeenCalledWith('tok', 'kind');
        expect(mockNavigate).toHaveBeenCalledWith(
          '/reset_password_recovery_phone',
          {
            state: {
              token: 'tok',
              kind: 'kind',
              lastFourPhoneDigits: '1234',
              numBackupCodes: 0,
              sendError: undefined,
            },
            replace: true,
          }
        );
      });
    });

    it('redirects to backup codes page when phone fetch fails but backup codes succeed', async () => {
      mockModelsModule({
        mockRecoveryPhoneGet: jest
          .fn()
          .mockRejectedValue(new Error('Network error')),
      });
      render();
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(
          '/confirm_backup_code_reset_password',
          {
            replace: true,
            state: { token: 'tok', kind: 'kind' },
          }
        );
      });
    });

    it('redirects to backup codes page when both backup codes and phone fetch fail', async () => {
      mockModelsModule({
        mockGetRecoveryCodesExist: jest
          .fn()
          .mockRejectedValue(new Error('Backup codes network error')),
        mockRecoveryPhoneGet: jest
          .fn()
          .mockRejectedValue(new Error('Phone network error')),
      });
      render();
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(
          '/confirm_backup_code_reset_password',
          {
            replace: true,
            state: { token: 'tok', kind: 'kind' },
          }
        );
      });
    });
  });
});

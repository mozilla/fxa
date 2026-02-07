/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as ReachRouterModule from '@reach/router';
import * as CacheModule from '../../../lib/cache';
import * as SigninRecoveryCodeModule from './index';

import { LocationProvider } from '@reach/router';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import SigninRecoveryCodeContainer from './container';
import { createMockWebIntegration } from '../../../lib/integrations/mocks';
import { Integration, useAuthClient, useSensitiveDataClient } from '../../../models';
import { mockSensitiveDataClient as createMockSensitiveDataClient } from '../../../models/mocks';
import {
  MOCK_STORED_ACCOUNT,
  MOCK_BACKUP_CODE,
  mockLoadingSpinnerModule,
  MOCK_UNWRAP_BKEY,
  MOCK_KEY_FETCH_TOKEN,
} from '../../mocks';
import { SigninRecoveryCodeProps } from './interfaces';
import { mockSigninLocationState } from '../mocks';
import { waitFor } from '@testing-library/react';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import { SensitiveData } from '../../../lib/sensitive-data-client';

let integration: Integration;
function mockWebIntegration() {
  integration = createMockWebIntegration() as Integration;
}

jest.mock('../../../lib/glean', () => ({
  __esModule: true,
  default: {
    loginBackupCode: {
      view: jest.fn(),
      submit: jest.fn(),
      success: jest.fn(),
    },
    isDone: jest.fn(),
  },
}));

jest.mock('../../../models', () => {
  return {
    ...jest.requireActual('../../../models'),
    useAuthClient: jest.fn(),
    useSensitiveDataClient: jest.fn(),
  };
});

let currentSigninRecoveryCodeProps: SigninRecoveryCodeProps | undefined;
const mockSensitiveDataClient = createMockSensitiveDataClient();
const mockAuthClient = {
  consumeRecoveryCode: jest.fn(),
  recoveryPhoneSigninSendCode: jest.fn(),
};
function mockSigninRecoveryCodeModule() {
  currentSigninRecoveryCodeProps = undefined;
  jest
    .spyOn(SigninRecoveryCodeModule, 'default')
    .mockImplementation((props) => {
      currentSigninRecoveryCodeProps = props;
      return <div>signin recovery code mock</div>;
    });
}

function mockCache(opts: any = {}, isEmpty = false) {
  jest.spyOn(CacheModule, 'currentAccount').mockReturnValue(
    isEmpty
      ? undefined
      : {
          sessionToken: '123',
          ...(opts || {}),
        }
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

function resetMockSensitiveDataClient() {
  (useSensitiveDataClient as jest.Mock).mockImplementation(
    () => mockSensitiveDataClient
  );
  mockSensitiveDataClient.getDataType = jest.fn().mockReturnValue({
    keyFetchToken: MOCK_KEY_FETCH_TOKEN,
    unwrapBKey: MOCK_UNWRAP_BKEY,
  });
}

function resetMockAuthClient() {
  (useAuthClient as jest.Mock).mockReturnValue(mockAuthClient);
  mockAuthClient.consumeRecoveryCode.mockReset();
  mockAuthClient.recoveryPhoneSigninSendCode.mockReset();
}

function applyDefaultMocks() {
  jest.resetAllMocks();
  jest.restoreAllMocks();
  mockSigninRecoveryCodeModule();
  mockLoadingSpinnerModule();
  mockCache();
  mockReachRouter('signin_recovery_code', {
    signinState: mockSigninLocationState,
  });
  mockWebIntegration();
  resetMockSensitiveDataClient();
  resetMockAuthClient();
}

function render() {
  renderWithLocalizationProvider(
    <LocationProvider>
      <SigninRecoveryCodeContainer
        {...{
          integration,
        }}
      />
    </LocationProvider>
  );
}

describe('SigninRecoveryCode container', () => {
  beforeEach(() => {
    applyDefaultMocks();
  });
  describe('initial state', () => {
    it('redirects if page is reached without location state', async () => {
      mockReachRouter('signin_recovery_code');
      mockCache({}, true);
      render();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('redirects if there is no sessionToken', async () => {
      mockReachRouter('signin_recovery_code');
      mockCache({ sessionToken: '' });
      render();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('retrieves the session token from local storage if no location state', async () => {
      mockReachRouter('signin_recovery_code', {});
      mockCache(MOCK_STORED_ACCOUNT);
      render();
      expect(mockNavigate).not.toHaveBeenCalledWith('/');
    });

    it('reads data from sensitive data client', () => {
      render();
      expect(mockSensitiveDataClient.getDataType).toHaveBeenCalledWith(
        SensitiveData.Key.Auth
      );
    });
  });

  describe('submitRecoveryCode', () => {
    it('successful', async () => {
      mockAuthClient.consumeRecoveryCode.mockResolvedValue({ remaining: 3 });
      render();
      expect(currentSigninRecoveryCodeProps).toBeDefined();
      await waitFor(async () => {
        const response =
          await currentSigninRecoveryCodeProps?.submitRecoveryCode(
            MOCK_BACKUP_CODE
          );
        expect(response?.data?.consumeRecoveryCode).toEqual({
          remaining: 3,
        });
      });
      expect(mockAuthClient.consumeRecoveryCode).toHaveBeenCalledWith(
        mockSigninLocationState.sessionToken,
        MOCK_BACKUP_CODE
      );
    });

    it('handles errors', async () => {
      const error = new Error('Invalid recovery code');
      (error as any).errno = AuthUiErrors.INVALID_RECOVERY_CODE.errno;
      mockAuthClient.consumeRecoveryCode.mockRejectedValue(error);
      render();
      expect(currentSigninRecoveryCodeProps).toBeDefined();
      await waitFor(async () => {
        const response =
          await currentSigninRecoveryCodeProps?.submitRecoveryCode(
            MOCK_BACKUP_CODE
          );

        expect(response?.data?.consumeRecoveryCode).toBeUndefined();
        expect(response?.error?.errno).toEqual(
          AuthUiErrors.INVALID_RECOVERY_CODE.errno
        );
      });
    });
  });
});

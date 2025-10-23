/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as ReactUtils from 'fxa-react/lib/utils';
import * as SigninPushCodeModule from '.';
import * as CacheModule from '../../../lib/cache';
import { SigninPushCodeProps } from './interfaces';

import { LocationProvider } from '@reach/router';
import { waitFor } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { Integration, useSensitiveDataClient } from '../../../models';
import { mockSensitiveDataClient as createMockSensitiveDataClient } from '../../../models/mocks';
import {
  MOCK_EMAIL,
  MOCK_KEY_FETCH_TOKEN,
  MOCK_STORED_ACCOUNT,
  MOCK_UNWRAP_BKEY,
} from '../../mocks';
import SigninPushCodeContainer from './container';
import {
  createMockSigninLocationState,
  createMockSyncIntegration,
} from './mocks';

import { MozServices } from '../../../lib/types';

let integration: Integration;

function mockSyncDesktopIntegration() {
  integration = createMockSyncIntegration() as Integration;
}

function applyDefaultMocks() {
  jest.resetAllMocks();
  jest.restoreAllMocks();

  mockReactUtilsModule();
  mockSyncDesktopIntegration();

  mockSigninPushCodeModule();
  mockCurrentAccount();
  resetMockSensitiveDataClient();
}

const mockSensitiveDataClient = createMockSensitiveDataClient();
mockSensitiveDataClient.setDataType = jest.fn();
let mockHasTotpAuthClient = false;
let mockSessionStatus = 'verified';
let mockSendLoginPushRequest = jest.fn().mockResolvedValue({});
jest.mock('../../../models', () => {
  return {
    ...jest.requireActual('../../../models'),
    useAuthClient: () => {
      return {
        checkTotpTokenExists: jest
          .fn()
          .mockResolvedValue({ verified: mockHasTotpAuthClient }),
        sessionStatus: jest.fn().mockResolvedValue({
          state: mockSessionStatus,
        }),
        sendLoginPushRequest: mockSendLoginPushRequest,
      };
    },
    useSensitiveDataClient: jest.fn(),
  };
});

// Set this when testing location state
let mockLocationState = {};
const mockLocation = () => {
  return {
    pathname: '/signin_push_code',
    state: mockLocationState,
  };
};
const mockNavigate = jest.fn();
jest.mock('@reach/router', () => {
  return {
    __esModule: true,
    ...jest.requireActual('@reach/router'),
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation(),
  };
});

let currentSigninPushCodeProps: SigninPushCodeProps | undefined;
let moduleMock: jest.SpyInstance;
function mockSigninPushCodeModule() {
  currentSigninPushCodeProps = undefined;
  moduleMock = jest
    .spyOn(SigninPushCodeModule, 'default')
    .mockImplementation((props: SigninPushCodeProps) => {
      currentSigninPushCodeProps = props;
      return <div>signin push code mock</div>;
    });
}

function mockReactUtilsModule() {
  jest.spyOn(ReactUtils, 'hardNavigate').mockImplementation(() => {});
}

// Set this when testing local storage
function mockCurrentAccount(storedAccount = { uid: '123' }) {
  jest.spyOn(CacheModule, 'currentAccount').mockReturnValue(storedAccount);
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

async function render() {
  renderWithLocalizationProvider(
    <LocationProvider>
      <SigninPushCodeContainer
        {...{
          integration,
          serviceName: MozServices.FirefoxSync,
        }}
      />
    </LocationProvider>
  );
}

describe('SigninPushCode container', () => {
  beforeEach(() => {
    applyDefaultMocks();
  });

  describe('initial states', () => {
    describe('email', () => {
      it('can be set from router state', async () => {
        mockLocationState = createMockSigninLocationState();
        render();
        await waitFor(() => {
          expect(CacheModule.currentAccount).not.toHaveBeenCalled();
        });
        expect(currentSigninPushCodeProps?.signinState.email).toBe(MOCK_EMAIL);
        expect(SigninPushCodeModule.default).toHaveBeenCalled();
      });
      it('router state takes precedence over local storage', async () => {
        mockLocationState = createMockSigninLocationState();
        render();
        expect(CacheModule.currentAccount).not.toHaveBeenCalled();
        await waitFor(() => {
          expect(currentSigninPushCodeProps?.signinState.email).toBe(
            MOCK_EMAIL
          );
        });
        expect(SigninPushCodeModule.default).toHaveBeenCalled();
      });
      it('is read from localStorage if email is not provided via router state', async () => {
        mockLocationState = {};
        mockCurrentAccount(MOCK_STORED_ACCOUNT);
        render();
        expect(CacheModule.currentAccount).toHaveBeenCalled();
        await waitFor(() => {
          expect(currentSigninPushCodeProps?.signinState.email).toBe(
            MOCK_STORED_ACCOUNT.email
          );
        });
        expect(SigninPushCodeModule.default).toHaveBeenCalled();
      });
      it('is handled if not provided in location state or local storage', async () => {
        mockLocationState = {};
        render();
        expect(CacheModule.currentAccount).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/');
        expect(SigninPushCodeModule.default).not.toHaveBeenCalled();
      });
    });

    describe('totp status', () => {
      beforeEach(() => {
        mockLocationState = createMockSigninLocationState();
      });

      it('redirects to totp screen if user has totp enabled', async () => {
        mockHasTotpAuthClient = true;
        render();

        await waitFor(() => {
          expect(mockNavigate).toHaveBeenCalledWith('/signin_totp_code', {
            state: mockLocationState,
          });
        });
      });

      it('does not redirect with totp false', async () => {
        mockHasTotpAuthClient = false;
        render();

        await waitFor(() => {
          expect(mockNavigate).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe('render', () => {
    beforeEach(() => {
      moduleMock.mockRestore();
    });

    it('sends push notification', async () => {
      mockSessionStatus = 'false';
      mockLocationState = createMockSigninLocationState();
      render();

      await waitFor(() => expect(mockSendLoginPushRequest).toHaveBeenCalled());
    });

    it('navigates when session verified', async () => {
      mockSessionStatus = 'verified';
      mockLocationState = createMockSigninLocationState();
      render();

      await waitFor(() =>
        expect(ReactUtils.hardNavigate).toHaveBeenCalledWith(
          '/pair?showSuccessMessage=true',
          undefined,
          undefined,
          false
        )
      );
    });
  });
});

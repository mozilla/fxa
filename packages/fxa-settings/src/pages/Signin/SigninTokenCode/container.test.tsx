/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as SigninTokenCodeModule from '.';
import * as ReactUtils from 'fxa-react/lib/utils';
import * as CacheModule from '../../../lib/cache';
import * as OAuthFlowRecoveryModule from '../../../lib/hooks/useOAuthFlowRecovery';

import { SigninTokenCodeProps } from './interfaces';
import { Integration, useSensitiveDataClient } from '../../../models';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { MemoryRouter } from 'react-router';
import SigninTokenCodeContainer from './container';
import { screen, waitFor } from '@testing-library/react';
import {
  MOCK_EMAIL,
  MOCK_KEY_FETCH_TOKEN,
  MOCK_STORED_ACCOUNT,
  MOCK_UNWRAP_BKEY,
} from '../../mocks';
import { createMockWebIntegration } from '../../../lib/integrations/mocks';
import {
  createMockSigninLocationState,
  createOAuthNativeIntegration,
} from './mocks';
import { mockSensitiveDataClient as createMockSensitiveDataClient } from '../../../models/mocks';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';

let integration: Integration;
const mockSensitiveDataClient = createMockSensitiveDataClient();

function mockWebIntegration() {
  integration = createMockWebIntegration() as Integration;
}

function applyDefaultMocks() {
  jest.resetAllMocks();
  jest.restoreAllMocks();

  mockReactUtilsModule();
  mockWebIntegration();

  mockSigninTokenCodeModule();
  mockCurrentAccount();
  resetMockSensitiveDataClient();

  mockCheckTotpTokenExists.mockResolvedValue({ verified: false });
}

const mockCheckTotpTokenExists = jest.fn();
const mockAuthClient = { checkTotpTokenExists: mockCheckTotpTokenExists };
jest.mock('../../../models', () => {
  return {
    ...jest.requireActual('../../../models'),
    useAuthClient: () => mockAuthClient,
    useSensitiveDataClient: jest.fn(),
  };
});

// Set this when testing location state
let mockLocationState = {};
const mockLocation = () => {
  return {
    pathname: '/signin_token_code',
    state: mockLocationState,
  };
};
const mockNavigate = jest.fn();
jest.mock('react-router', () => {
  return {
    __esModule: true,
    ...jest.requireActual('react-router'),
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation(),
  };
});

let currentSigninTokenCodeProps: SigninTokenCodeProps | undefined;
function mockSigninTokenCodeModule() {
  currentSigninTokenCodeProps = undefined;
  jest
    .spyOn(SigninTokenCodeModule, 'default')
    .mockImplementation((props: SigninTokenCodeProps) => {
      currentSigninTokenCodeProps = props;
      return <div>signin token code mock</div>;
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
  mockSensitiveDataClient.AuthData = {
    keyFetchToken: MOCK_KEY_FETCH_TOKEN,
    unwrapBKey: MOCK_UNWRAP_BKEY,
  };
  mockSensitiveDataClient.KeyStretchUpgradeData = undefined;
}

async function render() {
  renderWithLocalizationProvider(
    <MemoryRouter>
      <SigninTokenCodeContainer
        {...{
          integration,
        }}
      />
    </MemoryRouter>
  );
}

describe('SigninTokenCode container', () => {
  beforeEach(() => {
    applyDefaultMocks();
  });

  describe('initial states', () => {
    describe('email', () => {
      it('can be set from router state', async () => {
        mockLocationState = createMockSigninLocationState();
        render();
        await waitFor(() =>
          expect(screen.getByText('signin token code mock')).toBeInTheDocument()
        );
        await waitFor(() => {
          expect(CacheModule.currentAccount).not.toHaveBeenCalled();
        });
        expect(currentSigninTokenCodeProps?.signinState.email).toBe(MOCK_EMAIL);
        expect(currentSigninTokenCodeProps?.integration).toBe(integration);
        expect(SigninTokenCodeModule.default).toHaveBeenCalled();
      });
      it('router state takes precedence over local storage', async () => {
        mockLocationState = createMockSigninLocationState();
        render();
        expect(CacheModule.currentAccount).not.toHaveBeenCalled();
        await waitFor(() => {
          expect(currentSigninTokenCodeProps?.signinState.email).toBe(
            MOCK_EMAIL
          );
        });
        expect(SigninTokenCodeModule.default).toHaveBeenCalled();
      });
      it('is read from localStorage if email is not provided via router state', async () => {
        mockLocationState = {};
        mockCurrentAccount(MOCK_STORED_ACCOUNT);
        render();
        expect(CacheModule.currentAccount).toHaveBeenCalled();
        await waitFor(() => {
          expect(currentSigninTokenCodeProps?.signinState.email).toBe(
            MOCK_STORED_ACCOUNT.email
          );
        });
        expect(SigninTokenCodeModule.default).toHaveBeenCalled();
      });
      it('is handled if not provided in location state or local storage', async () => {
        mockLocationState = {};
        render();
        expect(CacheModule.currentAccount).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/');
        expect(SigninTokenCodeModule.default).not.toHaveBeenCalled();
      });
    });

    describe('totp status', () => {
      beforeEach(() => {
        mockLocationState = createMockSigninLocationState();
      });

      it('redirects to totp screen if user has totp enabled', async () => {
        mockCheckTotpTokenExists.mockResolvedValue({ verified: true });
        render();

        await waitFor(() => {
          expect(mockNavigate).toHaveBeenCalledWith('/signin_totp_code', {
            state: mockLocationState,
          });
        });
      });

      it('does not redirect with totp false', async () => {
        render();

        await waitFor(() => {
          expect(mockNavigate).not.toHaveBeenCalled();
        });
      });

      it('redirects to the root when the session token is invalid', async () => {
        mockCheckTotpTokenExists.mockRejectedValue(AuthUiErrors.INVALID_TOKEN);
        render();

        await waitFor(() => {
          expect(mockNavigate).toHaveBeenCalledWith('/');
        });
      });

      it('does not throw when the rejection reason is undefined', async () => {
        mockCheckTotpTokenExists.mockRejectedValue(undefined);
        render();

        await waitFor(() => {
          expect(mockCheckTotpTokenExists).toHaveBeenCalled();
        });
        expect(mockNavigate).not.toHaveBeenCalled();
      });

      it('recovers an OAuth native integration when the session token is invalid', async () => {
        integration = createOAuthNativeIntegration() as Integration;
        const attemptOAuthFlowRecovery = jest.fn();
        jest
          .spyOn(OAuthFlowRecoveryModule, 'useOAuthFlowRecovery')
          .mockReturnValue({
            isRecovering: false,
            recoveryFailed: false,
            attemptOAuthFlowRecovery,
          });
        mockCheckTotpTokenExists.mockRejectedValue(AuthUiErrors.INVALID_TOKEN);
        render();

        await waitFor(() => {
          expect(attemptOAuthFlowRecovery).toHaveBeenCalledTimes(1);
        });
        expect(mockNavigate).not.toHaveBeenCalled();
      });

      it('does not redirect on any other error', async () => {
        mockCheckTotpTokenExists.mockRejectedValue(
          AuthUiErrors.UNEXPECTED_ERROR
        );
        render();

        await waitFor(() => {
          expect(mockCheckTotpTokenExists).toHaveBeenCalled();
        });
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });
  });
});

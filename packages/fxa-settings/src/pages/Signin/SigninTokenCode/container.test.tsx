/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as SigninTokenCodeModule from '.';
import * as ReactUtils from 'fxa-react/lib/utils';
import * as CacheModule from '../../../lib/cache';

import { SigninTokenCodeProps } from './interfaces';
import { Integration, useSensitiveDataClient } from '../../../models';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { LocationProvider } from '@reach/router';
import SigninTokenCodeContainer from './container';
import { screen, waitFor } from '@testing-library/react';
import {
  MOCK_EMAIL,
  MOCK_KEY_FETCH_TOKEN,
  MOCK_STORED_ACCOUNT,
  MOCK_UNWRAP_BKEY,
} from '../../mocks';
import { createMockWebIntegration } from '../../../lib/integrations/mocks';
import { createMockSigninLocationState } from './mocks';
import { mockSensitiveDataClient as createMockSensitiveDataClient } from '../../../models/mocks';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';

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
}

let mockHasTotpAuthClient = false;
jest.mock('../../../models', () => {
  return {
    ...jest.requireActual('../../../models'),
    useAuthClient: () => {
      return {
        checkTotpTokenExists: jest
          .fn()
          .mockResolvedValue({ verified: mockHasTotpAuthClient }),
      };
    },
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
jest.mock('@reach/router', () => {
  return {
    __esModule: true,
    ...jest.requireActual('@reach/router'),
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
  mockSensitiveDataClient.getDataType = jest.fn().mockReturnValue({
    keyFetchToken: MOCK_KEY_FETCH_TOKEN,
    unwrapBKey: MOCK_UNWRAP_BKEY,
  });
  mockSensitiveDataClient.KeyStretchUpgradeData = undefined;
}

async function render(mocks: Array<MockedResponse>) {
  renderWithLocalizationProvider(
    <MockedProvider mocks={mocks} addTypename={false}>
      <LocationProvider>
        <SigninTokenCodeContainer
          {...{
            integration,
          }}
        />
      </LocationProvider>
    </MockedProvider>
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
        render([]);
        await waitFor(() =>
          expect(screen.getByText('signin token code mock')).toBeInTheDocument()
        );
        await waitFor(() => {
          expect(CacheModule.currentAccount).not.toBeCalled();
        });
        expect(currentSigninTokenCodeProps?.signinState.email).toBe(MOCK_EMAIL);
        expect(currentSigninTokenCodeProps?.integration).toBe(integration);
        expect(SigninTokenCodeModule.default).toBeCalled();
      });
      it('router state takes precedence over local storage', async () => {
        mockLocationState = createMockSigninLocationState();
        render([]);
        expect(CacheModule.currentAccount).not.toBeCalled();
        await waitFor(() => {
          expect(currentSigninTokenCodeProps?.signinState.email).toBe(
            MOCK_EMAIL
          );
        });
        expect(SigninTokenCodeModule.default).toBeCalled();
      });
      it('is read from localStorage if email is not provided via router state', async () => {
        mockLocationState = {};
        mockCurrentAccount(MOCK_STORED_ACCOUNT);
        render([]);
        expect(CacheModule.currentAccount).toBeCalled();
        await waitFor(() => {
          expect(currentSigninTokenCodeProps?.signinState.email).toBe(
            MOCK_STORED_ACCOUNT.email
          );
        });
        expect(SigninTokenCodeModule.default).toBeCalled();
      });
      it('is handled if not provided in location state or local storage', async () => {
        mockLocationState = {};
        render([]);
        expect(CacheModule.currentAccount).toBeCalled();
        expect(mockNavigate).toBeCalledWith('/');
        expect(SigninTokenCodeModule.default).not.toBeCalled();
      });
    });

    describe('totp status', () => {
      beforeEach(() => {
        mockLocationState = createMockSigninLocationState();
      });

      it('redirects to totp screen if user has totp enabled', async () => {
        mockHasTotpAuthClient = true;
        render([]);

        await waitFor(() => {
          expect(mockNavigate).toBeCalledWith('/signin_totp_code', {
            state: mockLocationState,
          });
        });
      });

      it('does not redirect with totp false', async () => {
        mockHasTotpAuthClient = false;
        render([]);

        await waitFor(() => {
          expect(mockNavigate).not.toBeCalled();
        });
      });
    });
  });
});

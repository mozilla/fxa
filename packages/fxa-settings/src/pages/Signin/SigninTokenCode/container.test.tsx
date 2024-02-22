/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as ApolloModule from '@apollo/client';
import * as SigninTokenCodeModule from '.';
import * as ReactUtils from 'fxa-react/lib/utils';
import * as CacheModule from '../../../lib/cache';

import { SigninTokenCodeProps } from './interfaces';
import { Integration } from '../../../models';
import { MOCK_NO_TOTP, MOCK_TOTP_STATUS } from '../mocks';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { LocationProvider } from '@reach/router';
import SigninTokenCodeContainer from './container';
import { screen, waitFor } from '@testing-library/react';
import { MOCK_EMAIL, MOCK_STORED_ACCOUNT } from '../../mocks';
import { createMockWebIntegration } from '../../../lib/integrations/mocks';
import { createMockSigninLocationState } from './mocks';

let integration: Integration;

function mockWebIntegration() {
  integration = createMockWebIntegration() as Integration;
}

function applyDefaultMocks() {
  jest.resetAllMocks();
  jest.restoreAllMocks();

  mockReactUtilsModule();
  mockWebIntegration();
  mockTotpStatusUseQuery();

  mockSigninTokenCodeModule();
  mockCurrentAccount();
}

jest.mock('../../../models', () => {
  return {
    ...jest.requireActual('../../../models'),
    useAuthClient: jest.fn(),
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
  jest
    .spyOn(ReactUtils, 'hardNavigateToContentServer')
    .mockImplementation(() => {});
  jest.spyOn(ReactUtils, 'hardNavigate').mockImplementation(() => {});
}

// Set this when testing local storage
function mockCurrentAccount(storedAccount = { uid: '123' }) {
  jest.spyOn(CacheModule, 'currentAccount').mockReturnValue(storedAccount);
}

let mockTotpStatusQuery = jest.fn();
// default for testing is no totp set up for the account
function mockTotpStatusUseQuery() {
  mockTotpStatusQuery.mockImplementation(() => {
    return {
      data: MOCK_NO_TOTP,
      loading: false,
    };
  });

  jest.spyOn(ApolloModule, 'useQuery').mockReturnValue(mockTotpStatusQuery());
}

async function render() {
  renderWithLocalizationProvider(
    <LocationProvider>
      <SigninTokenCodeContainer
        {...{
          integration,
        }}
      />
    </LocationProvider>
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
          expect(mockTotpStatusQuery).toReturnWith({
            data: MOCK_NO_TOTP,
            loading: false,
          })
        );
        await waitFor(() =>
          expect(screen.getByText('signin token code mock')).toBeInTheDocument()
        );
        await waitFor(() => {
          expect(CacheModule.currentAccount).not.toBeCalled();
        });
        expect(currentSigninTokenCodeProps?.signinLocationState.email).toBe(
          MOCK_EMAIL
        );
        expect(currentSigninTokenCodeProps?.integration).toBe(integration);
        expect(SigninTokenCodeModule.default).toBeCalled();
      });
      it('router state takes precedence over local storage', async () => {
        mockLocationState = createMockSigninLocationState();
        render();
        expect(CacheModule.currentAccount).not.toBeCalled();
        await waitFor(() => {
          expect(currentSigninTokenCodeProps?.signinLocationState.email).toBe(
            MOCK_EMAIL
          );
        });
        expect(SigninTokenCodeModule.default).toBeCalled();
      });
      it('is read from localStorage if email is not provided via router state', async () => {
        mockLocationState = {};
        mockCurrentAccount(MOCK_STORED_ACCOUNT);
        render();
        expect(CacheModule.currentAccount).toBeCalled();
        await waitFor(() => {
          expect(currentSigninTokenCodeProps?.signinLocationState.email).toBe(
            MOCK_STORED_ACCOUNT.email
          );
        });
        expect(SigninTokenCodeModule.default).toBeCalled();
      });
      it('is handled if not provided in location state or local storage', async () => {
        mockLocationState = {};
        render();
        expect(CacheModule.currentAccount).toBeCalled();
        expect(ReactUtils.hardNavigateToContentServer).toBeCalledWith('/');
        expect(SigninTokenCodeModule.default).not.toBeCalled();
      });
    });

    describe('totp status', () => {
      beforeEach(() => {
        mockLocationState = createMockSigninLocationState();
      });

      it('displays loading spinner when loading', () => {
        mockTotpStatusQuery.mockImplementation(() => {
          return {
            data: null,
            loading: true,
          };
        });
        jest
          .spyOn(ApolloModule, 'useQuery')
          .mockReturnValue(mockTotpStatusQuery());

        render();
        expect(mockTotpStatusQuery).toBeCalled();
        screen.getByLabelText('Loading…');
        expect(SigninTokenCodeModule.default).not.toBeCalled();
      });

      it('redirects to totp screen if user has totp enabled', () => {
        mockTotpStatusQuery.mockImplementation(() => ({
          data: MOCK_TOTP_STATUS,
          loading: false,
        }));
        jest
          .spyOn(ApolloModule, 'useQuery')
          .mockReturnValue(mockTotpStatusQuery());

        render();
        expect(mockTotpStatusQuery).toBeCalled();
        expect(mockNavigate).toBeCalledWith('/signin_totp_code');
        expect(SigninTokenCodeModule.default).not.toBeCalled();
      });
    });
  });
});

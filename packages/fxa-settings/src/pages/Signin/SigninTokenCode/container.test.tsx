/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as ApolloModule from '@apollo/client';
import * as SigninTokenCodeModule from '.';
import * as ReactUtils from 'fxa-react/lib/utils';
import * as CacheModule from '../../../lib/cache';

import { SigninTokenCodeIntegration, SigninTokenCodeProps } from './interfaces';
import { IntegrationType } from '../../../models';
import VerificationReasons from '../../../constants/verification-reasons';
import { MOCK_TOTP_STATUS, MOCK_TOTP_STATUS_VERIFIED } from '../mocks';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { LocationProvider } from '@reach/router';
import SigninTokenCodeContainer from './container';
import { screen, waitFor } from '@testing-library/react';
import { MOCK_STORED_ACCOUNT } from '../../mocks';

let integration: SigninTokenCodeIntegration;

function mockWebIntegration() {
  integration = {
    type: IntegrationType.Web,
    isSync: () => false,
  };
}

function applyDefaultMocks() {
  jest.resetAllMocks();
  jest.restoreAllMocks();

  mockReactUtilsModule();
  mockWebIntegration();
  mockApolloClientModule();
  mockLocationState = {};

  mockSigninTokenCodeModule();
  mockCurrentAccount();
}

// Set this when testing location state
let mockLocationState = {};
const mockLocation = () => {
  return {
    pathname: '/signin_token_code',
    search: '?' + new URLSearchParams(mockLocationState),
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
}

// Set this when testing local storage
function mockCurrentAccount(storedAccount = { uid: '123' }) {
  jest.spyOn(CacheModule, 'currentAccount').mockReturnValue(storedAccount);
}

let mockTotpStatusQuery = jest.fn();
function mockApolloClientModule() {
  mockTotpStatusUseQuery();
}

function mockTotpStatusUseQuery() {
  mockTotpStatusQuery.mockImplementation(() => {
    return {
      data: MOCK_TOTP_STATUS,
      loading: false,
    };
  });

  jest.spyOn(ApolloModule, 'useQuery').mockReturnValue(mockTotpStatusQuery());
}

const MOCK_ROUTER_STATE_EMAIL = 'from@routerstate.com';
const MOCK_LOCATION_STATE_COMPLETE = {
  email: MOCK_ROUTER_STATE_EMAIL,
  verificationReason: VerificationReasons.SIGN_IN,
};

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
        mockLocationState = MOCK_LOCATION_STATE_COMPLETE;
        render();
        await waitFor(() => {
          expect(CacheModule.currentAccount).not.toBeCalled();
        });
        expect(currentSigninTokenCodeProps?.email).toBe(
          MOCK_ROUTER_STATE_EMAIL
        );
        expect(currentSigninTokenCodeProps?.integration).toBe(integration);
        expect(currentSigninTokenCodeProps?.verificationReason).toBe(
          MOCK_LOCATION_STATE_COMPLETE.verificationReason
        );
        expect(SigninTokenCodeModule.default).toBeCalled();
      });
      it('router state takes precedence over local storage', async () => {
        mockLocationState = MOCK_LOCATION_STATE_COMPLETE;
        render();
        expect(CacheModule.currentAccount).not.toBeCalled();
        await waitFor(() => {
          expect(currentSigninTokenCodeProps?.email).toBe(
            MOCK_ROUTER_STATE_EMAIL
          );
        });
        expect(SigninTokenCodeModule.default).toBeCalled();
      });
      it('is read from localStorage if email is not provided via router state', async () => {
        mockCurrentAccount(MOCK_STORED_ACCOUNT);
        render();
        expect(CacheModule.currentAccount).toBeCalled();
        await waitFor(() => {
          expect(currentSigninTokenCodeProps?.email).toBe(
            MOCK_STORED_ACCOUNT.email
          );
        });
        expect(SigninTokenCodeModule.default).toBeCalled();
      });
      it('is handled if not provided in location state or local storage', async () => {
        render();
        expect(CacheModule.currentAccount).toBeCalled();
        expect(ReactUtils.hardNavigateToContentServer).toBeCalledWith('/');
        expect(SigninTokenCodeModule.default).not.toBeCalled();
      });
    });

    describe('totp status', () => {
      beforeEach(() => {
        mockLocationState = MOCK_LOCATION_STATE_COMPLETE;
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
          data: MOCK_TOTP_STATUS_VERIFIED,
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

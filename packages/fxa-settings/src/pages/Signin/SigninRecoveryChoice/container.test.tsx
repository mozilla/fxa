/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as ModelsModule from '../../../models';
import * as ReachRouterModule from '@reach/router';
import * as CacheModule from '../../../lib/cache';
import * as SigninRecoveryChoiceModule from './index';

import { waitFor } from '@testing-library/react';
import { LocationProvider } from '@reach/router';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import {
  MOCK_MASKED_PHONE_NUMBER_WITH_COPY,
  MOCK_STORED_ACCOUNT,
  mockLoadingSpinnerModule,
} from '../../mocks';
import { mockSigninLocationState } from '../mocks';
import SigninRecoveryChoiceContainer from './container';
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
  mockRecoveryPhoneSigninSendCode = jest.fn().mockResolvedValue(true),
}) {
  mockAuthClient.getRecoveryCodesExist = mockGetRecoveryCodesExist;
  mockAuthClient.recoveryPhoneGet = mockRecoveryPhoneGet;
  mockAuthClient.recoveryPhoneSigninSendCode = mockRecoveryPhoneSigninSendCode;
  (ModelsModule.useAuthClient as jest.Mock).mockImplementation(
    () => mockAuthClient
  );
}

function mockSigninRecoveryChoiceModule() {
  jest.spyOn(SigninRecoveryChoiceModule, 'default');
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

function applyDefaultMocks() {
  jest.resetAllMocks();
  jest.restoreAllMocks();
  mockModelsModule({});
  mockSigninRecoveryChoiceModule();
  mockLoadingSpinnerModule();
  mockCache();
  mockReachRouter('signin_recovery_choice', mockSigninLocationState);
}

function render() {
  renderWithLocalizationProvider(
    <LocationProvider>
      <SigninRecoveryChoiceContainer />
    </LocationProvider>
  );
}

describe('SigninRecoveryChoice container', () => {
  beforeEach(() => {
    applyDefaultMocks();
  });

  describe('initial state', () => {
    it('redirects if page is reached without location state or cached account', async () => {
      mockReachRouter(undefined, 'signin_recovery_choice');
      mockCache({}, true);
      await render();
      expect(SigninRecoveryChoiceModule.default).not.toBeCalled();
      expect(mockNavigate).toBeCalledWith('/signin');
    });

    it('redirects if there is no sessionToken', async () => {
      mockReachRouter('signin_recovery_choice');
      mockCache({ sessionToken: '' });
      await render();
      expect(SigninRecoveryChoiceModule.default).not.toBeCalled();
      expect(mockNavigate).toBeCalledWith('/signin');
    });

    it('retrieves the session token from local storage if no location state', async () => {
      mockReachRouter('signin_recovery_choice', {});
      mockCache(MOCK_STORED_ACCOUNT);
      await waitFor(() => render());
      expect(mockNavigate).not.toBeCalled();
      expect(SigninRecoveryChoiceModule.default).toBeCalled();
    });
  });

  describe('fetches recovery method data', () => {
    it('fetches recovery codes and phone number successfully', async () => {
      render();
      await waitFor(() => {
        expect(mockAuthClient.getRecoveryCodesExist).toHaveBeenCalled();
        expect(mockAuthClient.recoveryPhoneGet).toHaveBeenCalled();
        expect(SigninRecoveryChoiceModule.default).toBeCalled();
      });
    });

    it('passes the correct props to the child component', async () => {
      render();
      await waitFor(() => {
        expect(SigninRecoveryChoiceModule.default).toBeCalledWith(
          expect.objectContaining({
            lastFourPhoneDigits: '1234',
            numBackupCodes: 3,
            signinState: mockSigninLocationState,
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
        expect(mockAuthClient.getRecoveryCodesExist).toHaveBeenCalled();
        expect(mockAuthClient.recoveryPhoneGet).toHaveBeenCalled();
        expect(SigninRecoveryChoiceModule.default).not.toBeCalled();
        expect(mockNavigate).toBeCalledWith('/signin_recovery_code', {
          replace: true,
          state: { signinState: mockSigninLocationState },
        });
      });
    });
  });
});

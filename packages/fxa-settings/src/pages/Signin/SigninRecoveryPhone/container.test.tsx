/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as ReachRouterModule from '@reach/router';
import * as SigninRecoveryPhoneModule from './index';

import { AppContext, Integration } from '../../../models';
import { mockAppContext } from '../../../models/mocks';
import SigninRecoveryPhoneContainer from './container';
import {
  createMockSigninWebIntegration,
  MOCK_OAUTH_FLOW_HANDLER_RESPONSE,
  mockSigninLocationState,
} from '../mocks';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { SigninRecoveryPhoneProps } from './interfaces';
import { storeAccountData } from '../../../lib/storage-utils';
import { handleNavigation } from '../utils';

const mockRecoveryPhoneSigninConfirm = jest.fn().mockImplementation(() => {
  return Promise.resolve();
});

const mockRecoveryPhoneSigninSendCode = jest.fn().mockImplementation(() => {
  return Promise.resolve();
});

jest.mock('../../../models', () => ({
  ...jest.requireActual('../../../models'),
  useAuthClient: () => {
    return {
      recoveryPhoneSigninConfirm: mockRecoveryPhoneSigninConfirm,
      recoveryPhoneSigninSendCode: mockRecoveryPhoneSigninSendCode,
    };
  },
}));

const mockFinishOAuthFlowHandler = jest
  .fn()
  .mockReturnValueOnce(MOCK_OAUTH_FLOW_HANDLER_RESPONSE);

jest.mock('../../../lib/hooks', () => ({
  useFinishOAuthFlowHandler: jest.fn(() => ({
    finishOAuthFlowHandler: mockFinishOAuthFlowHandler,
    oAuthDataError: null,
  })),
  useNavigateWithQuery: jest.fn(),
  useWebRedirect: jest.fn(),
}));

jest.mock('../../../lib/error-utils', () => ({
  getHandledError: jest.fn().mockImplementation((err) => ({
    error: {
      errno: err?.errno || 1,
      message: 'error',
    },
  })),
  getLocalizedErrorMessage: jest.fn().mockImplementation((err) => err.message),
}));

jest.mock('../../../lib/storage-utils', () => ({
  storeAccountData: jest.fn(),
}));

jest.mock('../utils', () => ({
  ...jest.requireActual('../utils'),
  handleNavigation: jest.fn(),
}));

let mockNavigate = jest.fn();
function mockReachRouter(pathname = '', mockLocationState = {}) {
  jest.spyOn(ReachRouterModule, 'useNavigate').mockReturnValue(mockNavigate);
  jest.spyOn(ReachRouterModule, 'useLocation').mockImplementation(() => ({
    ...global.window.location,
    pathname,
    state: mockLocationState,
  }));
}

let currentPageProps: SigninRecoveryPhoneProps | undefined;
function mockSigninRecoveryPhoneModule() {
  jest
    .spyOn(SigninRecoveryPhoneModule, 'default')
    .mockImplementation((props) => {
      currentPageProps = props;
      return <div>signin recovery phone mock</div>;
    });
}

function applyDefaultMocks() {
  jest.resetAllMocks();
  jest.restoreAllMocks();

  mockSigninRecoveryPhoneModule();
  mockReachRouter('/signin_recovery_phone', {
    signinState: mockSigninLocationState,
    lastFourPhoneDigits: '1234',
  });
}

const renderSigninRecoveryPhoneContainer = (
  integration = createMockSigninWebIntegration() as Integration
) => {
  renderWithLocalizationProvider(
    <ReachRouterModule.LocationProvider>
      <AppContext.Provider value={mockAppContext()}>
        <SigninRecoveryPhoneContainer {...{ integration }} />
      </AppContext.Provider>
    </ReachRouterModule.LocationProvider>
  );
};

describe('SigninRecoveryPhoneContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    applyDefaultMocks();
  });

  describe('pre-render navigation', () => {
    it('navigates to /signin if signinState is missing', () => {
      mockReachRouter('/signin_recovery_phone', {
        lastFourPhoneDigits: '1234',
      });
      renderSigninRecoveryPhoneContainer();

      expect(mockNavigate).toHaveBeenCalledWith('/signin');
    });

    it('navigates to /signin if lastFourPhoneDigits is missing', () => {
      mockReachRouter('/signin_recovery_phone', {
        signinState: mockSigninLocationState,
      });
      renderSigninRecoveryPhoneContainer();

      expect(mockNavigate).toHaveBeenCalledWith('/signin');
    });
  });

  describe('with web integration', () => {
    it('renders SigninRecoveryPhone component with proper props', async () => {
      renderSigninRecoveryPhoneContainer();
      expect(SigninRecoveryPhoneModule.default).toHaveBeenCalled();

      expect(currentPageProps).toEqual({
        lastFourPhoneDigits: '1234',
        resendCode: expect.any(Function),
        verifyCode: expect.any(Function),
      });
    });

    it('calls verifyCode correctly', async () => {
      renderSigninRecoveryPhoneContainer();

      await currentPageProps?.verifyCode('123456');
      expect(mockRecoveryPhoneSigninConfirm).toHaveBeenCalledWith(
        mockSigninLocationState.sessionToken,
        '123456'
      );
      expect(storeAccountData).toHaveBeenCalledWith({
        email: mockSigninLocationState.email,
        sessionToken: mockSigninLocationState.sessionToken,
        uid: mockSigninLocationState.uid,
        verified: true,
      });

      expect(handleNavigation).toHaveBeenCalled();
    });

    it('calls resendCode correctly', async () => {
      renderSigninRecoveryPhoneContainer();

      await currentPageProps?.resendCode();
      expect(mockRecoveryPhoneSigninSendCode).toHaveBeenCalledWith(
        mockSigninLocationState.sessionToken
      );
    });
  });
});

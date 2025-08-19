/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as ApolloClientModule from '@apollo/client';
import * as InlineRecoverySetupFlowModule from '.';
import * as utils from 'fxa-react/lib/utils';

import { ApolloClient } from '@apollo/client';
import { LocationProvider } from '@reach/router';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { AuthUiError } from '../../lib/auth-errors/auth-errors';
import { MozServices } from '../../lib/types';
import {
  IntegrationType,
  OAuthIntegration,
  useSensitiveDataClient,
} from '../../models';
import { mockSensitiveDataClient as createMockSensitiveDataClient } from '../../models/mocks';
import {
  MOCK_QUERY_PARAMS,
  MOCK_SIGNIN_LOCATION_STATE,
  MOCK_SIGNIN_RECOVERY_LOCATION_STATE,
} from '../InlineTotpSetup/mocks';
import InlineRecoverySetupFlowContainer from './container';
import AuthClient from 'fxa-auth-client/browser';
import { waitFor } from '@testing-library/react';
import {
  MOCK_CLIENT_ID,
  MOCK_NO_TOTP,
  MOCK_OAUTH_FLOW_HANDLER_RESPONSE,
  MOCK_TOTP_STATUS_VERIFIED,
} from '../Signin/mocks';
import {
  useFinishOAuthFlowHandler,
  useOAuthKeysCheck,
} from '../../lib/oauth/hooks';
import { SensitiveData } from '../../lib/sensitive-data-client';
import { mockWindowLocation } from 'fxa-react/lib/test-utils/mockWindowLocation';

let mockLocationState = {};
const search = '?' + new URLSearchParams(MOCK_QUERY_PARAMS);

mockWindowLocation({
  pathname: '/inline_recovery_setup',
  search,
});

const mockLocationHook = () => {
  return {
    pathname: '/inline_recovery_setup',
    search,
    state: mockLocationState,
  };
};

const mockNavigateHook = jest.fn();
jest.mock('@reach/router', () => {
  return {
    __esModule: true,
    ...jest.requireActual('@reach/router'),
    useNavigate: () => mockNavigateHook,
    useLocation: () => mockLocationHook(),
  };
});

jest.mock('../../lib/oauth/hooks.tsx', () => {
  return {
    __esModule: true,
    useFinishOAuthFlowHandler: jest.fn(),
    useOAuthKeysCheck: jest.fn(),
  };
});

const mockSensitiveDataClient = createMockSensitiveDataClient();
mockSensitiveDataClient.getDataType = jest.fn();
const mockAuthClient = new AuthClient('http://localhost:9000', {
  keyStretchVersion: 1,
});
let mockSessionHook: () => any = () => ({ token: 'ABBA' });
let accountRefreshFn = jest.fn();
let recoveryPhoneFn = jest
  .fn()
  .mockImplementationOnce(() => {
    throw Error('no');
  })
  .mockImplementation(() => ({ available: true }));
let addRecoveryPhoneFn = jest
  .fn()
  .mockResolvedValue({ nationalFormat: '+12345678900' });
let confirmRecoveryPhoneFn = jest.fn();
let setRecoveryCodesFn = jest.fn();
let mockAccount = new (class {
  get recoveryPhone() {
    return recoveryPhoneFn();
  }
  async refresh(x: string) {
    return accountRefreshFn(x);
  }
  async addRecoveryPhone(x: string) {
    return addRecoveryPhoneFn(x);
  }
  async confirmRecoveryPhone(...args: any[]) {
    return confirmRecoveryPhoneFn(...args);
  }
  async setRecoveryCodes(codes: string[]) {
    return setRecoveryCodesFn(codes);
  }
})();
jest.mock('../../models', () => {
  return {
    ...jest.requireActual('../../models'),
    useSession: jest.fn(() => mockSessionHook()),
    useAuthClient: jest.fn(() => mockAuthClient),
    useSensitiveDataClient: jest.fn(),
    useAccount: jest.fn(() => mockAccount),
    useConfig: jest.fn(() => ({ recoveryCodes: { count: 8, length: 10 } })),
  };
});

let mockGetCode = jest.fn().mockReturnValue('215364');
jest.mock('../../lib/totp', () => {
  return {
    ...jest.requireActual('../../lib/totp'),
    getCode: jest.fn((...args) => mockGetCode(...args)),
  };
});
let mockGenerateCodes = jest.fn((...args) => ['wibble', 'quux']);
jest.mock('../../lib/totp-utils', () => {
  return {
    totpUtils: {
      ...jest.requireActual('../../lib/totp-utils').totpUtils,
      generateRecoveryCodes: (...args: any) => mockGenerateCodes(...args),
    },
  };
});

jest.mock('./index', () => {
  return {
    __esModule: true,
    default: jest.fn(),
  };
});

let mockVerifyTotpMutation = jest
  .fn()
  .mockResolvedValue({ data: { verifyTotp: { success: true } } });

let mockTotpStatusQuery = jest.fn();
function setMocks() {
  mockLocationState = {};
  mockSessionHook = () => ({ token: 'ABBA' });

  jest.spyOn(ApolloClientModule, 'useMutation').mockReturnValue([
    async (...args: any[]) => {
      return mockVerifyTotpMutation(...args);
    },
    {
      loading: false,
      called: true,
      client: {} as ApolloClient<any>,
      reset: () => {},
    },
  ]);
  mockTotpStatusQuery.mockImplementation(() => {
    return {
      data: MOCK_NO_TOTP,
      loading: false,
    };
  });
  jest
    .spyOn(ApolloClientModule, 'useQuery')
    .mockReturnValue(mockTotpStatusQuery());
  (InlineRecoverySetupFlowModule.default as jest.Mock).mockReset();
  mockNavigateHook.mockReset();
  (useFinishOAuthFlowHandler as jest.Mock).mockImplementation(() => ({
    finishOAuthFlowHandler: jest
      .fn()
      .mockReturnValueOnce(MOCK_OAUTH_FLOW_HANDLER_RESPONSE),
    oAuthDataError: null,
  }));
  (useSensitiveDataClient as jest.Mock).mockImplementation(
    () => mockSensitiveDataClient
  );
  (useOAuthKeysCheck as jest.Mock).mockImplementation(() => ({
    oAuthKeysCheckError: null,
  }));
  recoveryPhoneFn.mockClear();
}

const defaultProps = {
  isSignedIn: true,
  integration: {
    type: IntegrationType.OAuthWeb,
    returnOnError: () => true,
    getService: () => undefined,
    getClientId: () => MOCK_CLIENT_ID,
    getRedirectWithErrorUrl: (error: AuthUiError) =>
      `https://localhost:8080/?error=${error.errno}`,
  } as OAuthIntegration,
  serviceName: MozServices.Default,
};

function render(props = {}) {
  renderWithLocalizationProvider(
    <LocationProvider>
      <InlineRecoverySetupFlowContainer {...{ ...defaultProps, ...props }} />
    </LocationProvider>
  );
}

describe('InlineRecoverySetupFlowContainer', () => {
  beforeEach(() => {
    setMocks();
  });

  describe('redirects away', () => {
    it('redirects when user is not signed in', async () => {
      mockLocationState = MOCK_SIGNIN_RECOVERY_LOCATION_STATE;
      render({ isSignedIn: false });
      await waitFor(() => {
        expect(mockNavigateHook).toHaveBeenCalledWith(`/signup${search}`);
      });
    });

    it('redirects when there is no signin state', () => {
      render();
      expect(mockNavigateHook).toHaveBeenCalledWith(`/signup${search}`);
    });

    it('redirects when there is no totp token', () => {
      mockLocationState = MOCK_SIGNIN_LOCATION_STATE;
      render();
      expect(mockNavigateHook).toHaveBeenCalledWith(`/signup${search}`);
    });

    it('redirects when totp is already active', async () => {
      mockSessionHook = () => ({ isSessionVerified: async () => true });
      mockTotpStatusQuery.mockImplementation(() => {
        return {
          data: MOCK_TOTP_STATUS_VERIFIED,
          loading: false,
        };
      });
      jest
        .spyOn(ApolloClientModule, 'useQuery')
        .mockReturnValue(mockTotpStatusQuery());
      mockLocationState = MOCK_SIGNIN_RECOVERY_LOCATION_STATE;

      render();
      expect(mockNavigateHook).toHaveBeenCalledWith(
        `/signin_totp_code${search}`,
        {
          state: MOCK_SIGNIN_LOCATION_STATE,
        }
      );
    });
  });

  describe('renders', () => {
    beforeEach(() => {
      mockLocationState = {
        ...MOCK_SIGNIN_RECOVERY_LOCATION_STATE,
        totp: {
          ...MOCK_SIGNIN_RECOVERY_LOCATION_STATE.totp,
          recoveryCodes: [],
        },
      };
    });

    it('invokes InlineRecoverySetupFlow with the correct props', async () => {
      render();
      await waitFor(() => {
        expect(InlineRecoverySetupFlowModule.default).toHaveBeenCalled();
        const args = (InlineRecoverySetupFlowModule.default as jest.Mock).mock
          .calls[0][0];
        expect(args.backupCodes).toEqual([]);
        expect(args.serviceName).toBe(defaultProps.serviceName);
        expect(args.email).toBe(MOCK_SIGNIN_RECOVERY_LOCATION_STATE.email);
        expect(args.currentStep).toBe(1);
        expect(args.backupMethod).toBe(null);
      });
    });

    it('loads the account', async () => {
      render();
      await waitFor(() => {
        expect(accountRefreshFn).toHaveBeenCalledWith('account');
      });
    });

    it('reads data from sensitive data client', async () => {
      render();
      expect(mockSensitiveDataClient.getDataType).toHaveBeenCalledWith(
        SensitiveData.Key.Auth
      );
    });

    describe('callbacks', () => {
      let args: any;

      beforeEach(async () => {
        render();
        await waitFor(() => {
          expect(InlineRecoverySetupFlowModule.default).toHaveBeenCalled();
        });
        args = (InlineRecoverySetupFlowModule.default as jest.Mock).mock
          .calls[0][0];
      });

      describe('backupChoiceCb', () => {
        it('creates recovery codes when code is selected', async () => {
          await waitFor(async () => {
            await args.backupChoiceCb('code');
          });
          expect(mockGenerateCodes).toHaveBeenCalledWith(8, 10);
        });
      });

      describe('verifyPhoneNumber, sendSmsCode, and verifySmsCode', () => {
        it('adds phone number and enables totp', async () => {
          await waitFor(async () => {
            await args.verifyPhoneNumber('12345678900');
          });
          args = (InlineRecoverySetupFlowModule.default as jest.Mock).mock
            .calls[
            (InlineRecoverySetupFlowModule.default as jest.Mock).mock.calls
              .length - 1
          ][0];
          await waitFor(async () => {
            await args.sendSmsCode();
          });
          expect(addRecoveryPhoneFn).toHaveBeenCalledTimes(2);
          expect(addRecoveryPhoneFn).toHaveBeenNthCalledWith(1, '12345678900');
          expect(addRecoveryPhoneFn).toHaveBeenNthCalledWith(2, '12345678900');

          await waitFor(async () => {
            await args.verifySmsCode('010431');
          });
          expect(confirmRecoveryPhoneFn).toHaveBeenCalledWith(
            '010431',
            '12345678900',
            true
          );
          expect(mockGetCode).toHaveBeenCalled();
          expect(mockVerifyTotpMutation).toHaveBeenCalled();
          expect(
            mockVerifyTotpMutation.mock.calls[0][0].variables.input.code
          ).toBe('215364');
        });
      });

      describe('completeBackupCodeSetup', () => {
        it('sets recovery codes and enables totp', async () => {
          await waitFor(async () => {
            await args.backupChoiceCb('code');
          });
          args = (InlineRecoverySetupFlowModule.default as jest.Mock).mock
            .calls[
            (InlineRecoverySetupFlowModule.default as jest.Mock).mock.calls
              .length - 1
          ][0];
          await waitFor(async () => {
            await args.completeBackupCodeSetup('wibble');
          });
          expect(setRecoveryCodesFn).toHaveBeenCalledWith(['wibble', 'quux']);
          expect(mockGetCode).toHaveBeenCalled();
          expect(mockVerifyTotpMutation).toHaveBeenCalled();
          expect(
            mockVerifyTotpMutation.mock.calls[0][0].variables.input.code
          ).toBe('215364');
        });
      });

      describe('successfulSetupHandler', () => {
        it('calls finishOAuthFlowHandler and navigates to RP', async () => {
          const hardNavigateSpy = jest
            .spyOn(utils, 'hardNavigate')
            .mockImplementation(() => {});

          const successfulSetupHandler = args.successfulSetupHandler;
          await waitFor(async () => {
            await successfulSetupHandler();
          });

          expect(hardNavigateSpy).toHaveBeenCalledWith(
            MOCK_OAUTH_FLOW_HANDLER_RESPONSE.redirect
          );
        });
      });
    });
  });
});

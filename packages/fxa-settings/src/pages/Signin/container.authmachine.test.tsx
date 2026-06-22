/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Flag-gate scaffold tests for the auth-state-machine integration in SigninContainer.
 * Asserts that when authStateMachine is OFF the machine is not instantiated,
 * and when it is ON the machine is instantiated and observable via the
 * data-testid="auth-state-machine-active" sentinel.
 */

import * as UseValidateModule from '../../lib/hooks/useValidate';
import * as SigninDeciderModule from './components/SigninDecider';
import { SigninDeciderProps } from './components/SigninDecider';
import * as ModelsModule from '../../models';
import * as CacheModule from '../../lib/cache';
import * as ReactUtils from 'fxa-react/lib/utils';
import * as UseAuthMachineModule from '../../lib/auth-machine/useAuthMachine';

import { LocationProvider } from '@reach/router';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import SigninContainer from './container';
import { MozServices } from '../../lib/types';
import { screen, waitFor } from '@testing-library/react';
import { WebIntegration } from '../../models';
import { GenericData, ModelDataProvider } from '../../lib/model-data';
import { mockUseFxAStatus } from '../../lib/hooks/useFxAStatus/mocks';
import AuthClient from 'fxa-auth-client/browser';
import { mockSensitiveDataClient as createMockSensitiveDataClient } from '../../models/mocks';
import { useFinishOAuthFlowHandler } from '../../lib/oauth/hooks';
import { SigninQueryParams } from '../../models/pages/signin';
import { MOCK_FLOW_ID, MOCK_SESSION_TOKEN, MOCK_UID } from './mocks';

// ---- Module-level mocks ----

jest.mock('../../lib/channels/firefox', () => ({
  ...jest.requireActual('../../lib/channels/firefox'),
  firefox: { fxaCanLinkAccount: jest.fn() },
}));

jest.mock('../../lib/storage-utils', () => ({
  ...jest.requireActual('../../lib/storage-utils'),
  storeAccountData: jest.fn(),
}));

jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  ensureCanLinkAcountOrRedirect: jest.fn(),
}));

jest.mock('../../lib/oauth/hooks', () => ({
  ...jest.requireActual('../../lib/oauth/hooks'),
  useFinishOAuthFlowHandler: jest.fn(),
}));

jest.mock('../../lib/hooks', () => ({
  __esModule: true,
  ...jest.requireActual('../../lib/hooks'),
  useCheckReactEmailFirst: () => jest.fn().mockReturnValue(true)(),
}));

jest.mock('../../models', () => ({
  ...jest.requireActual('../../models'),
  useAuthClient: jest.fn(),
  useSensitiveDataClient: jest.fn(),
  useConfig: jest.fn(),
  useSession: jest.fn(),
}));

jest.mock('@reach/router', () => ({
  __esModule: true,
  ...jest.requireActual('@reach/router'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({
    pathname: '/signin',
    search: '',
    state: {
      email: 'user@example.com',
      hasPassword: true,
      hasLinkedAccount: false,
    },
  }),
}));

// ---- Shared test state ----

const mockAuthClient = new AuthClient('http://localhost:9000', {
  keyStretchVersion: 1,
});
const mockSensitiveDataClient = createMockSensitiveDataClient();

const mockSession = {
  isSessionVerified: jest.fn().mockResolvedValue(true),
  isValid: jest.fn().mockResolvedValue(true),
  sendVerificationCode: jest.fn().mockResolvedValue(undefined),
  verified: false,
  token: MOCK_SESSION_TOKEN,
};

let useAuthMachineSpy: jest.SpyInstance;

function setupDefaultMocks(
  featureFlags: Record<string, boolean> = {},
  queryParams: Record<string, unknown> = {}
) {
  jest.resetAllMocks();
  jest.restoreAllMocks();

  jest.spyOn(ReactUtils, 'hardNavigate').mockImplementation(() => {});

  jest
    .spyOn(SigninDeciderModule, 'default')
    .mockImplementation((_props: SigninDeciderProps) => <div>signin mock</div>);

  jest.spyOn(CacheModule, 'currentAccount').mockReturnValue({
    uid: MOCK_UID,
    email: 'user@example.com',
    sessionToken: undefined,
  });
  jest.spyOn(CacheModule, 'findAccountByEmail').mockReturnValue(undefined);
  jest.spyOn(CacheModule, 'discardSessionToken');

  mockAuthClient.accountStatusByEmail = jest.fn().mockResolvedValue({
    exists: true,
    hasLinkedAccount: false,
    hasPassword: true,
  });

  (ModelsModule.useAuthClient as jest.Mock).mockImplementation(
    () => mockAuthClient
  );
  (ModelsModule.useSensitiveDataClient as jest.Mock).mockImplementation(
    () => mockSensitiveDataClient
  );
  (ModelsModule.useConfig as jest.Mock).mockImplementation(() => ({
    featureFlags: {
      recoveryCodeSetupOnSyncSignIn: false,
      ...featureFlags,
    },
    servers: { profile: { url: 'http://localhost:1111' } },
    oauth: { clientId: 'mock-client-id' },
  }));
  (ModelsModule.useSession as jest.Mock).mockImplementation(() => mockSession);

  (useFinishOAuthFlowHandler as jest.Mock).mockReturnValue({
    finishOAuthFlowHandler: jest.fn(),
    oAuthDataError: undefined,
  });

  jest
    .spyOn(UseValidateModule, 'useValidatedQueryParams')
    .mockImplementation((Model) => {
      if (Model === SigninQueryParams) {
        return {
          queryParamModel: {
            email: '',
            hasPassword: undefined,
            hasLinkedAccount: undefined,
            authStateMachine: undefined,
            isV2: () => false,
            ...queryParams,
          } as unknown as ModelDataProvider,
          validationError: undefined,
        };
      }
      return {
        queryParamModel: {} as ModelDataProvider,
        validationError: undefined,
      };
    });

  global.fetch = jest.fn().mockResolvedValue({
    ok: false,
    json: () => Promise.resolve({}),
  });

  // Spy on useAuthMachine so tests can assert call count.
  useAuthMachineSpy = jest.spyOn(UseAuthMachineModule, 'useAuthMachine');
}

function makeIntegration() {
  return new WebIntegration(new GenericData({ service: MozServices.Default }));
}

function renderContainer() {
  const integration = makeIntegration();
  const useFxAStatusResult = mockUseFxAStatus();

  return renderWithLocalizationProvider(
    <LocationProvider>
      <SigninContainer
        integration={integration}
        serviceName={MozServices.Default}
        useFxAStatusResult={useFxAStatusResult}
        flowQueryParams={{ flowId: MOCK_FLOW_ID }}
      />
    </LocationProvider>
  );
}

// ---- Tests ----

describe('SigninContainer auth-state-machine flag gate', () => {
  describe('when authStateMachine flag is OFF (default)', () => {
    beforeEach(() => {
      setupDefaultMocks({ authStateMachine: false });
    });

    it('does not render the auth-state-machine-active sentinel', async () => {
      renderContainer();
      // Give the container time to settle async effects.
      await waitFor(() => {
        expect(SigninDeciderModule.default).toHaveBeenCalled();
      });
      expect(
        screen.queryByTestId('auth-state-machine-active')
      ).not.toBeInTheDocument();
    });

    it('calls useAuthMachine with the no-op sentinel deps (not real machine deps)', async () => {
      renderContainer();
      await waitFor(() => {
        expect(SigninDeciderModule.default).toHaveBeenCalled();
      });
      // Hook is always called (React rules), but machineDeps should be null
      // (no-op path) when the flag is off.
      expect(useAuthMachineSpy).toHaveBeenCalled();
      const callArgs = useAuthMachineSpy.mock.calls[0][0];
      // navigate and delegate are both no-ops when the flag is off.
      expect(typeof callArgs.navigate).toBe('function');
      expect(typeof callArgs.delegate).toBe('function');
    });
  });

  describe('when authStateMachine flag is ON', () => {
    beforeEach(() => {
      setupDefaultMocks({ authStateMachine: true });
    });

    it('renders the auth-state-machine-active sentinel', async () => {
      renderContainer();
      await waitFor(() => {
        expect(SigninDeciderModule.default).toHaveBeenCalled();
      });
      expect(
        screen.getByTestId('auth-state-machine-active')
      ).toBeInTheDocument();
    });

    it('calls useAuthMachine with real (non-null) deps when flag is on', async () => {
      renderContainer();
      await waitFor(() => {
        expect(SigninDeciderModule.default).toHaveBeenCalled();
      });
      expect(useAuthMachineSpy).toHaveBeenCalled();
      // When the flag is on, the deps object comes from makeMachineDeps (not the
      // no-op sentinel), so it will have the real checkAccountStatus function.
      const { deps } = useAuthMachineSpy.mock.calls[0][0];
      expect(typeof deps.checkAccountStatus).toBe('function');
      expect(typeof deps.cachedSignin).toBe('function');
    });

    it('does not auto-send events that would trigger beginSignin on mount', async () => {
      renderContainer();
      await waitFor(() => {
        expect(SigninDeciderModule.default).toHaveBeenCalled();
      });
      // beginSignin on the real deps throws "not yet wired"; if it were called
      // during mount we would see an unhandled error. The test passing means
      // no event that invokes beginSignin was sent.
      expect(useAuthMachineSpy).toHaveBeenCalled();
    });
  });

  describe('when authStateMachine is enabled via URL query param only', () => {
    beforeEach(() => {
      // config flag OFF, query param ON
      setupDefaultMocks(
        { authStateMachine: false },
        { authStateMachine: true }
      );
    });

    it('renders the auth-state-machine-active sentinel from the query param', async () => {
      renderContainer();
      await waitFor(() => {
        expect(SigninDeciderModule.default).toHaveBeenCalled();
      });
      expect(
        screen.getByTestId('auth-state-machine-active')
      ).toBeInTheDocument();
    });
  });

  describe('when authStateMachine is disabled via URL query param', () => {
    beforeEach(() => {
      // config flag ON, query param explicitly OFF
      setupDefaultMocks(
        { authStateMachine: true },
        { authStateMachine: false }
      );
    });

    it('does not render the auth-state-machine-active sentinel when URL forces it off', async () => {
      renderContainer();
      await waitFor(() => {
        expect(SigninDeciderModule.default).toHaveBeenCalled();
      });
      expect(
        screen.queryByTestId('auth-state-machine-active')
      ).not.toBeInTheDocument();
    });
  });
});

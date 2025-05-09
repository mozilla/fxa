/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * This is our first POC for container tests. There's more comments than normal in this file, because it is
 * establishing the patterns going forward for future container tests. Comment blocks starting with TIP give
 * some guidance around common testing practices
 *
 * A couple things to keep in mind:
 *  - These tests should only be validating logic inside the container!
 *  - These tests will need to mock the containers dependencies
 *  - These tests should not:
 *    - Validate logic in the presentation layer
 *    - Validate logic used in hooks
 *    - Validate functionality of third party libraries
 *    - Require any external APIs or database
 *
 * The basic steps should be as follows:
 *  1. Identify what needs to be mocked and import modules
 *  2. Set up functions that initialize mocks and can be reused or overridden, preferably using jest.spyOn.
 *  4. Write tests, be sure mocks & spies are reset prior to each suite.
 *  5. Assert on mocked functions and spies.
 */

import React from 'react';

// TIP - Import modules for mocking. Not that `* as` lend themselves to using jest.spyOn.
import * as SignupModule from './index';
import * as ModelsModule from '../../models';
import * as ApolloModule from '@apollo/client';
import * as UseValidateModule from '../../lib/hooks/useValidate';
import * as FirefoxModule from '../../lib/channels/firefox';
import * as CryptoModule from 'fxa-auth-client/lib/crypto';
import * as ReachRouterModule from '@reach/router';

// Typical imports
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { screen, waitFor } from '@testing-library/react';
import SignupContainer from './container';
import { IntegrationType } from '../../models';
import { MozServices } from '../../lib/types';
import { FirefoxCommand } from '../../lib/channels/firefox';
import { Constants } from '../../lib/constants';
import { SignupIntegration, SignupProps } from './interfaces';
import { AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import { GraphQLError } from 'graphql';
import { ApolloClient } from '@apollo/client';
import { ModelDataProvider } from '../../lib/model-data';
import AuthClient from 'fxa-auth-client/browser';
import { LocationProvider } from '@reach/router';
import { mockLoadingSpinnerModule, MOCK_FLOW_ID } from '../mocks';

// TIP - Sometimes, we want to mock inputs. In this case they can be mocked directly and
// often times a mocking util isn't even necessary. Note that using the Dependency Inversion
// Principle, will limit the amount you need to mock. Here, we let the container specify
// the SignupContainerIntegration interface which is a subset (and therefore compatible)
// larger and often more specific interfaces like Integration, OAuthIntegration, etc...
let integration: SignupIntegration;
function mockIntegration() {
  integration = {
    type: IntegrationType.SyncDesktopV3,
    getService: () => MozServices.Default,
    getClientId: () => undefined,
    isSync: () => true,
    wantsKeys: () => true,
    isDesktopRelay: () => false,
  };
}
let serviceName: MozServices;
function mockServiceName() {
  serviceName = MozServices.Default;
}

// TIP - Note that we don't actually want to render the Signup or LoadingSpinner react components,
// since we aren't testing their logic. There fore it's fine to just return something super
// simple. And check assumptions about props if necessary.
let currentSignupProps: SignupProps | undefined;
function mockSignupModule() {
  currentSignupProps = undefined;
  jest
    .spyOn(SignupModule, 'Signup')
    .mockImplementation((props: SignupProps) => {
      currentSignupProps = props;
      return <div>signup mock</div>;
    });
}

// TIP - Most modules can be easily mocked via jest.spyOn. As you can see this very clean.
function mockUseValidateModule() {
  jest.spyOn(UseValidateModule, 'useValidatedQueryParams').mockReturnValue({
    queryParamModel: {
      email: 'foo@bar.com',
      isV2: () => false,
    } as unknown as ModelDataProvider,
    validationError: undefined,
  });
}

function mockFirefoxModule() {
  FirefoxModule.firefox.addEventListener = jest.fn();
  FirefoxModule.firefox.send = jest.fn();
}

function mockCryptoModule() {
  jest.spyOn(CryptoModule, 'getCredentials').mockResolvedValue({
    authPW: 'apw123',
    unwrapBKey: 'ubk123',
  });

  jest.spyOn(CryptoModule, 'getCredentialsV2').mockResolvedValue({
    clientSalt:
      'identity.mozilla.com/picl/v1/quickStretchV2:0123456789abcdef0123456789abcdef',
    authPW: 'apwV2123',
    unwrapBKey: 'ubkV2123',
  });
}

const mockNavigate = jest.fn();
function mockReachRouterModule() {
  jest.spyOn(ReachRouterModule, 'useNavigate').mockReturnValue(mockNavigate);
}

// TIP - Sometimes it's useful to have inner mocks. In this case, we hold a reference to
// mockBeginSignupMutation, so it can be asserted against and redefined as needed.
let mockBeginSignupMutation = jest.fn();
function mockApolloClientModule() {
  mockBeginSignupMutation.mockImplementation(async () => {
    return {
      data: {
        unwrapBKey: 'foo',
        signUp: {
          uid: 'uid123',
          keyFetchToken: 'kft123',
          sessionToken: 'st123',
        },
      },
    };
  });

  jest.spyOn(ApolloModule, 'useMutation').mockReturnValue([
    async (...args: any[]) => {
      return mockBeginSignupMutation(...args);
    },
    {
      loading: false,
      called: true,
      client: {} as ApolloClient<any>,
      reset: () => {},
    },
  ]);
}

// TIP - Occasionally, due to how a module is constructed, jest.spyOn will not work.
// In this case, use the following pattern. The jest.mock approach generally works,
// but as you can see, it's quite a bit noisier.
jest.mock('../../models', () => {
  return {
    ...jest.requireActual('../../models'),
    useAuthClient: jest.fn(),
  };
});
function mockModelsModule() {
  let mockAuthClient = new AuthClient('localhost:9000', {
    keyStretchVersion: 1,
  });
  mockAuthClient.accountStatusByEmail = jest
    .fn()
    .mockResolvedValue({ exists: true });
  (ModelsModule.useAuthClient as jest.Mock).mockImplementation(
    () => mockAuthClient
  );
}

// TIP - Finally, we should create a helper function, so the defacto
// mock behaviors can be easily applied. Once applied, they can
// always be overridden as needed.
function applyMocks() {
  // TIP - Important! Clear previous mock states
  jest.resetAllMocks();
  jest.restoreAllMocks();

  // Run default mocks
  mockIntegration();
  mockServiceName();
  mockSignupModule();
  mockApolloClientModule();
  mockModelsModule();
  mockUseValidateModule();
  mockFirefoxModule();
  mockCryptoModule();
  mockReachRouterModule();
  mockLoadingSpinnerModule();
}

// TIP - Since render looks more or less the same each time, we can tease this out
// as a helper function.
async function render(text?: string) {
  // Even though we aren't testing presentation, there still might be presentation
  // state/context driven by react or l10n that's required. Therefore we will invoke the
  // container component as follows.
  renderWithLocalizationProvider(
    <LocationProvider>
      <SignupContainer
        {...{
          integration,
          serviceName,
        }}
        flowQueryParams={{ flowId: MOCK_FLOW_ID }}
      />
    </LocationProvider>
  );

  // TIP - Wait for the expected mocked test to show up.
  await screen.findByText(text || 'signup mock');

  // TIP/HACK -To work around the fact that the container uses, requestAnimationFrame...
  // Turns out that can create some pretty erratic test behavior...
  await new Promise((r) => setTimeout(r, 100));
}

// TIP - It's easier to target test suites that don't have spaces in their names.
describe('sign-up-container', () => {
  // TIP - Always run applyMocks, this will fire before every test.
  beforeEach(() => {
    applyMocks();
  });

  // TIP - Using nested describe is often helpful. It makes the test easier to
  // read and creates a natural partitioning of testing cases that are typically
  // more understandable than a bunch of individual tests. They are also
  // easier to focus and skip.
  describe('default-state', () => {
    it('renders', async () => {
      await render();
      expect(screen.queryByText('loading spinner mock')).toBeNull();
      expect(SignupModule.Signup).toBeCalled();
    });
  });

  describe('error-states', () => {
    it('handles invalid email', async () => {
      // In this case want to mimic a bad email value
      jest
        .spyOn(UseValidateModule, 'useValidatedQueryParams')
        .mockImplementation((_params) => {
          return {
            queryParamModel: {
              email: 'invalid',
            } as unknown as ModelDataProvider,
            validationError: {
              property: 'email',
            },
          };
        });
      await render('loading spinner mock');

      // TODO: Determine if email is valid: https://github.com/mozilla/fxa/pull/16131#discussion_r1418122670
      expect(mockNavigate).toBeCalledWith('/');
    });

    it('handles empty email', async () => {
      // In this case want to mimic a bad email value
      jest
        .spyOn(UseValidateModule, 'useValidatedQueryParams')
        .mockImplementation((_params) => {
          return {
            queryParamModel: {
              email: '',
            } as unknown as ModelDataProvider,
            validationError: {
              property: 'email',
            },
          };
        });
      await render('loading spinner mock');

      // TODO: Show that email is invalid: https://github.com/mozilla/fxa/pull/16131#discussion_r1418122670
      expect(mockNavigate).toBeCalledWith('/');
    });
  });

  describe('web-channel-interactions', () => {
    describe('SyncDesktopV3 integration', () => {
      beforeEach(() => {
        // here we override some key behaviors to alter the containers behavior
        serviceName = MozServices.FirefoxSync;
        integration.getService = () => 'sync';
        integration.type = IntegrationType.SyncDesktopV3;
      });

      it('added event listeners', async () => {
        await render();
        expect(FirefoxModule.firefox.addEventListener).toBeCalled();
      });

      it('sent command', async () => {
        await render();
        expect(FirefoxModule.firefox.send).toBeCalledWith(
          FirefoxCommand.FxAStatus,
          {
            context: Constants.FX_DESKTOP_V3_CONTEXT,
            isPairing: false,
            service: Constants.SYNC_SERVICE,
          }
        );
      });
    });

    describe('OAuth native integration with Sync', () => {
      beforeEach(() => {
        serviceName = MozServices.FirefoxSync;
        integration.getService = () => 'sync';
        integration.isSync = () => true;
        integration.type = IntegrationType.OAuthNative;
      });
      it('adds event listeners and sends', async () => {
        await render();
        expect(FirefoxModule.firefox.addEventListener).toBeCalled();
        expect(FirefoxModule.firefox.send).toBeCalledWith(
          FirefoxCommand.FxAStatus,
          {
            context: Constants.OAUTH_CONTEXT,
            isPairing: false,
            service: Constants.SYNC_SERVICE,
          }
        );
      });
    });

    describe('Web integration, default service', () => {
      beforeEach(() => {
        integration.type = IntegrationType.Web;
        integration.getService = () => MozServices.Default;
        integration.isSync = () => false;
      });

      it('did not add event listeners and send command', async () => {
        await render();
        expect(FirefoxModule.firefox.addEventListener).not.toBeCalled();
      });

      it('did not send command', async () => {
        await render();
        expect(FirefoxModule.firefox.send).not.toBeCalled();
      });
    });
  });

  describe('begin-sign-up-handler', () => {
    beforeEach(() => {
      serviceName = MozServices.FirefoxSync;
      integration.getService = () => 'sync';
      integration.type = IntegrationType.SyncDesktopV3;
    });

    it('runs handler and invokes sign up mutation', async () => {
      await render();
      expect(currentSignupProps).toBeDefined();
      const handlerResult = await currentSignupProps?.beginSignupHandler(
        'foo@mozilla.com',
        'test123'
      );

      expect(mockBeginSignupMutation).toBeCalledWith({
        variables: {
          input: {
            email: 'foo@mozilla.com',
            authPW: 'apw123',
            options: {
              verificationMethod: 'email-otp',
              keys: true,
              service: 'sync',
              metricsContext: {
                flowId: MOCK_FLOW_ID,
              },
            },
          },
        },
      });
      expect(handlerResult?.data?.unwrapBKey).toBeDefined();
      expect(handlerResult?.data?.signUp?.uid).toEqual('uid123');
      expect(handlerResult?.data?.signUp?.keyFetchToken).toEqual('kft123');
      expect(handlerResult?.data?.signUp?.sessionToken).toEqual('st123');
    });

    it('handles error fetching credentials', async () => {
      jest
        .spyOn(CryptoModule, 'getCredentials')
        .mockImplementation(async () => {
          throw new Error('BOOM');
        });

      await render();
      const result = await currentSignupProps?.beginSignupHandler(
        'foo@mozilla.com',
        'test123'
      );

      expect(result?.data).toBeUndefined();
      expect(result?.error?.message).toEqual(
        AuthUiErrors.UNEXPECTED_ERROR.message
      );
    });

    it('handles error on gql mutation', async () => {
      mockBeginSignupMutation.mockImplementation(async () => {
        const gqlError = new GraphQLError(
          AuthUiErrors.UNEXPECTED_ERROR.message
        );
        const error: GraphQLError = Object.assign(gqlError, {
          extensions: {
            ...(gqlError.extensions || {}),
            errno: AuthUiErrors.UNEXPECTED_ERROR.errno,
          },
        });
        throw new ApolloModule.ApolloError({
          graphQLErrors: [error],
        });
      });

      await render();
      await waitFor(async () => {
        const result = await currentSignupProps?.beginSignupHandler(
          'foo@mozilla.com',
          'test123'
        );

        expect(result?.data).toBeUndefined();
        expect(result?.error?.message).toEqual(
          AuthUiErrors.UNEXPECTED_ERROR.message
        );
      });
    });
  });
});

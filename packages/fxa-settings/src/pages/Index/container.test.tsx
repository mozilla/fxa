/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as ModelsModule from '../../models';
import * as IndexModule from './index';
import * as ReactUtils from 'fxa-react/lib/utils';
import * as cache from '../../lib/cache';

import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { LocationProvider } from '@reach/router';
import { useValidatedQueryParams } from '../../lib/hooks/useValidate';
import { Integration, IntegrationType } from '../../models';
import { IndexContainer } from './container';
import { MozServices } from '../../lib/types';
import AuthClient from 'fxa-auth-client/browser';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { IndexProps } from './interfaces';
import { MOCK_EMAIL } from '../mocks';
import { AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import { checkEmailDomain } from '../../lib/email-domain-validator';
import GleanMetrics from '../../lib/glean';
import { IndexQueryParams } from '../../models/pages/index';

let mockLocationState = {};
let mockNavigate = jest.fn();
jest.mock('@reach/router', () => {
  const actual = jest.requireActual('@reach/router');
  return {
    ...actual,
    useLocation: () => {
      return {
        pathname: '/',
        state: mockLocationState,
      };
    },
    useNavigate: () => mockNavigate,
  };
});

jest.mock('../../lib/hooks/useValidate', () => ({
  useValidatedQueryParams: jest.fn(),
}));

jest.mock('../../models', () => {
  const originalModule = jest.requireActual('../../models');
  return {
    __esModule: true,
    ...originalModule,
    useAuthClient: jest.fn(),
  };
});

jest.mock('../../lib/channels/firefox', () => ({
  fxaCanLinkAccount: jest.fn(),
}));

jest.mock('../../lib/email-domain-validator', () => ({
  checkEmailDomain: jest.fn(),
}));

jest.mock('fxa-react/components/LoadingSpinner', () => () => (
  <div>LoadingSpinner</div>
));

const mockAuthClient = new AuthClient('http://localhost:9000', {
  keyStretchVersion: 2,
});

function mockModelsModule() {
  mockAuthClient.accountStatusByEmail = jest.fn().mockResolvedValue({
    exists: true,
    hasLinkedAccount: false,
    hasPassword: true,
  });
  (ModelsModule.useAuthClient as jest.Mock).mockImplementation(
    () => mockAuthClient
  );
}

function mockReactUtilsModule() {
  jest.spyOn(ReactUtils, 'hardNavigate').mockImplementation(() => {});
}

let currentIndexProps: IndexProps | undefined;
function mockIndexModule() {
  currentIndexProps = undefined;
  jest.spyOn(IndexModule, 'default').mockImplementation((props: IndexProps) => {
    currentIndexProps = props;
    return <div>email-first mock</div>;
  });
}

describe('IndexContainer', () => {
  let mockUseValidatedQueryParams: jest.Mock;
  let mockUseAuthClient: jest.Mock;

  let integration: Integration;

  function mockWebIntegration() {
    integration = {
      type: IntegrationType.Web,
      getService: () => MozServices.Default,
      getClientId: () => undefined,
      isSync: () => false,
      wantsKeys: () => false,
      isDesktopSync: () => false,
      isDesktopRelay: () => false,
      data: {},
    } as Integration;
  }

  function mockUnsupportedContextIntegration() {
    integration = {
      type: IntegrationType.Web,
      getService: () => MozServices.Default,
      getClientId: () => undefined,
      isSync: () => false,
      wantsKeys: () => false,
      isDesktopSync: () => false,
      isDesktopRelay: () => false,
      data: { context: 'fx_desktop_v2' },
    } as Integration;
  }

  beforeEach(() => {
    mockIndexModule();
    mockModelsModule();
    mockReactUtilsModule();
    mockWebIntegration();
    mockNavigate.mockClear();
    mockUseValidatedQueryParams = useValidatedQueryParams as jest.Mock;
    mockUseValidatedQueryParams.mockReturnValue({
      queryParamModel: {},
      validationError: null,
    });

    mockUseAuthClient = ModelsModule.useAuthClient as jest.Mock;
    mockUseAuthClient.mockReturnValue({
      accountStatusByEmail: jest.fn().mockResolvedValue({
        exists: true,
        hasLinkedAccount: false,
        hasPassword: true,
      }),
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should check query parameters', () => {
    const { container } = renderWithLocalizationProvider(
      <LocationProvider>
        <IndexContainer
          {...{ integration, serviceName: MozServices.Default }}
        />
      </LocationProvider>
    );
    expect(container).toBeDefined();
    expect(mockUseValidatedQueryParams).toBeCalledWith(IndexQueryParams, false);
  });

  it('should render the Index component when no redirection is required', async () => {
    const { container } = renderWithLocalizationProvider(
      <LocationProvider>
        <IndexContainer
          {...{ integration, serviceName: MozServices.Default }}
        />
      </LocationProvider>
    );
    expect(container).toBeDefined();
    expect(IndexModule.default).toBeCalled();
    await waitFor(() => {
      expect(currentIndexProps?.prefillEmail).toBe(undefined);
    });
  });

  it('should pass the prefill email as prop to index when provided by location state', async () => {
    mockLocationState = { prefillEmail: MOCK_EMAIL };
    const { container } = renderWithLocalizationProvider(
      <LocationProvider>
        <IndexContainer
          {...{ integration, serviceName: MozServices.Default }}
        />
      </LocationProvider>
    );
    expect(container).toBeDefined();
    expect(IndexModule.default).toBeCalled();
    await waitFor(() => {
      expect(currentIndexProps?.prefillEmail).toBe(MOCK_EMAIL);
    });
  });

  describe('redirections', () => {
    it('should prioritize prefillEmail over email and prevent redirection', async () => {
      mockLocationState = { prefillEmail: MOCK_EMAIL };
      mockUseValidatedQueryParams.mockReturnValue({
        queryParamModel: { email: 'test@example.com' },
        validationError: null,
      });

      const { container } = renderWithLocalizationProvider(
        <LocationProvider>
          <IndexContainer
            {...{ integration, serviceName: MozServices.Default }}
          />
        </LocationProvider>
      );
      expect(container).toBeDefined();
      expect(IndexModule.default).toBeCalled();
      await waitFor(() => {
        expect(currentIndexProps?.prefillEmail).not.toBe('test@example.com');
        expect(currentIndexProps?.prefillEmail).toBe(MOCK_EMAIL);
      });
      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });

    it('should redirect to signin when email exists and prefillEmail is not provided', async () => {
      mockLocationState = {};
      mockUseValidatedQueryParams.mockReturnValue({
        queryParamModel: { email: 'test@example.com' },
        validationError: null,
      });
      render(
        <IndexContainer
          {...{ integration, serviceName: MozServices.Default }}
        />
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledTimes(1);
      });
      // Glean event not emitted on automatic redirect, only on successful manual submission
      const gleanSubmitSuccessSpy = jest.spyOn(
        GleanMetrics.emailFirst,
        'submitSuccess'
      );
      expect(gleanSubmitSuccessSpy).not.toHaveBeenCalled();
      const [calledUrl, options] = mockNavigate.mock.calls[0];
      expect(calledUrl).toMatch(/\/signin$/);
      expect(options).toEqual({
        state: {
          email: 'test@example.com',
          hasLinkedAccount: false,
          hasPassword: true,
        },
      });
    });

    it('should redirect to signup when email is provided but does not exist', async () => {
      mockLocationState = {};
      mockUseAuthClient.mockReturnValue({
        accountStatusByEmail: jest.fn().mockResolvedValue({
          exists: false,
          hasLinkedAccount: false,
          hasPassword: false,
        }),
      });
      mockUseValidatedQueryParams.mockReturnValue({
        queryParamModel: { email: 'test@example.com' },
        validationError: null,
      });
      render(
        <IndexContainer
          {...{ integration, serviceName: MozServices.Default }}
        />
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledTimes(1);
      });
      // Glean event not emitted on automatic redirect, only on successful manual submission
      const gleanSubmitSuccessSpy = jest.spyOn(
        GleanMetrics.emailFirst,
        'submitSuccess'
      );
      expect(gleanSubmitSuccessSpy).not.toHaveBeenCalled();
      const [calledUrl, options] = mockNavigate.mock.calls[0];
      expect(calledUrl).toMatch(/\/signup$/);
      expect(options).toEqual({
        state: {
          email: 'test@example.com',
          emailStatusChecked: true,
        },
      });
    });

    it('should suggest currentAccount email when available and redirect to signin', async () => {
      mockLocationState = {}; // no prefillEmail

      // Mock currentAccount with a valid email
      jest.spyOn(cache, 'currentAccount').mockReturnValue({
        uid: 'abc123',
        email: 'current@example.com',
        lastLogin: Date.now(),
      });

      // Ensure lastStoredAccount returns null so it doesn’t interfere
      jest.spyOn(cache, 'lastStoredAccount').mockReturnValue(undefined);

      mockUseValidatedQueryParams.mockReturnValue({
        queryParamModel: {}, // no email query param
        validationError: null,
      });

      const mockAccountStatus = {
        exists: true,
        hasLinkedAccount: false,
        hasPassword: true,
      };

      mockUseAuthClient.mockReturnValue({
        accountStatusByEmail: jest.fn().mockResolvedValue(mockAccountStatus),
      });

      render(
        <IndexContainer
          {...{ integration, serviceName: MozServices.Default }}
        />
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledTimes(1);
      });

      const [calledUrl, options] = mockNavigate.mock.calls[0];
      expect(calledUrl).toMatch(/\/signin$/);
      expect(options).toEqual({
        state: {
          email: 'current@example.com',
          hasLinkedAccount: false,
          hasPassword: true,
        },
      });
    });

    it('should suggest lastStoredAccount email if no currentAccount is present', async () => {
      mockLocationState = {}; // no prefillEmail

      // Mock no currentAccount but a lastStoredAccount exists
      jest.spyOn(cache, 'currentAccount').mockReturnValue(undefined);
      jest.spyOn(cache, 'lastStoredAccount').mockReturnValue({
        uid: 'stored123',
        email: 'stored@example.com',
        lastLogin: Date.now(),
      });

      mockUseValidatedQueryParams.mockReturnValue({
        queryParamModel: {}, // no email query param
        validationError: null,
      });

      const mockAccountStatus = {
        exists: true,
        hasLinkedAccount: false,
        hasPassword: true,
      };

      mockUseAuthClient.mockReturnValue({
        accountStatusByEmail: jest.fn().mockResolvedValue(mockAccountStatus),
      });

      render(
        <IndexContainer
          {...{ integration, serviceName: MozServices.Default }}
        />
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledTimes(1);
      });

      const [calledUrl, options] = mockNavigate.mock.calls[0];
      expect(calledUrl).toMatch(/\/signin$/);
      expect(options).toEqual({
        state: {
          email: 'stored@example.com',
          hasLinkedAccount: false,
          hasPassword: true,
        },
      });
    });

    it('should redirect if context is unsupported', async () => {
      mockUnsupportedContextIntegration();
      render(
        <IndexContainer
          {...{ integration, serviceName: MozServices.Default }}
        />
      );

      await waitFor(() => {
        expect(ReactUtils.hardNavigate).toHaveBeenCalledWith(
          '/update_firefox',
          {},
          true
        );
      });
    });
  });

  describe('signUpOrSignInHandler', () => {
    describe('success', () => {
      it('with a new valid email', async () => {
        mockUseAuthClient.mockReturnValue({
          accountStatusByEmail: jest.fn().mockResolvedValue({
            exists: false,
            hasLinkedAccount: false,
            hasPassword: false,
          }),
        });

        render(
          <IndexContainer
            {...{ integration, serviceName: MozServices.Default }}
          />
        );

        await waitFor(() => {
          expect(currentIndexProps?.signUpOrSignInHandler).toBeDefined();
        });

        const result =
          await currentIndexProps?.signUpOrSignInHandler(MOCK_EMAIL);

        expect(result?.error).toBeNull();
        await waitFor(() => {
          expect(mockNavigate).toHaveBeenCalledTimes(1);
        });
        const [calledUrl, options] = mockNavigate.mock.calls[0];
        expect(calledUrl).toMatch(/\/signup$/);
        expect(options).toEqual({
          state: {
            email: MOCK_EMAIL,
            emailStatusChecked: true,
          },
        });

        const gleanSubmitSuccessSpy = jest.spyOn(
          GleanMetrics.emailFirst,
          'submitSuccess'
        );
        expect(gleanSubmitSuccessSpy).toHaveBeenCalledTimes(1);
        expect(gleanSubmitSuccessSpy).toHaveBeenCalledWith({
          event: { reason: 'registration' },
        });
      });

      it('with an existing email', async () => {
        mockUseAuthClient.mockReturnValue({
          accountStatusByEmail: jest.fn().mockResolvedValue({
            exists: true,
            hasLinkedAccount: false,
            hasPassword: true,
          }),
        });

        render(
          <IndexContainer
            {...{ integration, serviceName: MozServices.Default }}
          />
        );

        await waitFor(() => {
          expect(currentIndexProps?.signUpOrSignInHandler).toBeDefined();
        });

        const result =
          await currentIndexProps?.signUpOrSignInHandler(MOCK_EMAIL);

        expect(result?.error).toBeNull();
        await waitFor(() => {
          expect(mockNavigate).toHaveBeenCalledTimes(1);
        });
        const [calledUrl, options] = mockNavigate.mock.calls[0];
        expect(calledUrl).toMatch(/\/signin$/);
        expect(options).toEqual({
          state: {
            email: MOCK_EMAIL,
            hasLinkedAccount: false,
            hasPassword: true,
          },
        });

        const gleanSubmitSuccessSpy = jest.spyOn(
          GleanMetrics.emailFirst,
          'submitSuccess'
        );
        expect(gleanSubmitSuccessSpy).toHaveBeenCalledTimes(1);
        expect(gleanSubmitSuccessSpy).toHaveBeenCalledWith({
          event: { reason: 'login' },
        });
      });
    });

    describe('errors', () => {
      it('should return an error when signUpOrSignInHandler is called with an invalid email', async () => {
        mockUseAuthClient.mockReturnValue({
          accountStatusByEmail: jest.fn().mockResolvedValue({
            exists: false,
            hasLinkedAccount: false,
            hasPassword: false,
          }),
        });
        render(
          <IndexContainer
            {...{ integration, serviceName: MozServices.Default }}
          />
        );

        await waitFor(() => {
          expect(currentIndexProps?.signUpOrSignInHandler).toBeDefined();
        });
        // You might need to extract this handler from the component via a ref or by exposing it for testing.
        const result =
          await currentIndexProps?.signUpOrSignInHandler('invalid-email');
        expect(result?.error?.errno).toEqual(AuthUiErrors.EMAIL_REQUIRED.errno);

        // no Glean event emitted with this error type
        const gleanSubmitFailSpy = jest.spyOn(
          GleanMetrics.emailFirst,
          'submitFail'
        );
        expect(gleanSubmitFailSpy).not.toHaveBeenCalled();
      });

      it('should return an error when signUpOrSignInHandler is called with an email mask', async () => {
        mockUseAuthClient.mockReturnValue({
          accountStatusByEmail: jest.fn().mockResolvedValue({
            exists: false,
            hasLinkedAccount: false,
            hasPassword: false,
          }),
        });
        render(
          <IndexContainer
            {...{ integration, serviceName: MozServices.Default }}
          />
        );

        await waitFor(() => {
          expect(currentIndexProps?.signUpOrSignInHandler).toBeDefined();
        });
        // You might need to extract this handler from the component via a ref or by exposing it for testing.
        const result = await currentIndexProps?.signUpOrSignInHandler(
          'test@relay.firefox.com'
        );
        expect(result?.error?.errno).toEqual(
          AuthUiErrors.EMAIL_MASK_NEW_ACCOUNT.errno
        );

        // no Glean event emitted with this error type
        const gleanSubmitFailSpy = jest.spyOn(
          GleanMetrics.emailFirst,
          'submitFail'
        );
        expect(gleanSubmitFailSpy).not.toHaveBeenCalled();
      });

      it('should return an error when signUpOrSignInHandler is called with a firefox.com email', async () => {
        mockUseAuthClient.mockReturnValue({
          accountStatusByEmail: jest.fn().mockResolvedValue({
            exists: false,
            hasLinkedAccount: false,
            hasPassword: false,
          }),
        });
        render(
          <IndexContainer
            {...{ integration, serviceName: MozServices.Default }}
          />
        );

        await waitFor(() => {
          expect(currentIndexProps?.signUpOrSignInHandler).toBeDefined();
        });
        // You might need to extract this handler from the component via a ref or by exposing it for testing.
        const result =
          await currentIndexProps?.signUpOrSignInHandler('test@firefox.com');
        expect(result?.error?.errno).toEqual(
          AuthUiErrors.DIFFERENT_EMAIL_REQUIRED_FIREFOX_DOMAIN.errno
        );

        // no Glean event emitted with this error type
        const gleanSubmitFailSpy = jest.spyOn(
          GleanMetrics.emailFirst,
          'submitFail'
        );
        expect(gleanSubmitFailSpy).not.toHaveBeenCalled();
      });

      it('should return an error when signUpOrSignInHandler is called with an invalid email domain', async () => {
        mockUseAuthClient.mockReturnValue({
          accountStatusByEmail: jest.fn().mockResolvedValue({
            exists: false,
            hasLinkedAccount: false,
            hasPassword: false,
          }),
        });
        // let's just mock an error response from the check email validator
        (checkEmailDomain as jest.Mock).mockRejectedValueOnce(
          AuthUiErrors.INVALID_EMAIL_DOMAIN
        );

        render(
          <IndexContainer
            {...{ integration, serviceName: MozServices.Default }}
          />
        );

        await waitFor(() => {
          expect(currentIndexProps?.signUpOrSignInHandler).toBeDefined();
        });
        // You might need to extract this handler from the component via a ref or by exposing it for testing.
        const result = await currentIndexProps?.signUpOrSignInHandler(
          'mockinvaliddomain@invalid.invalid'
        );
        expect(result?.error?.errno).toEqual(
          AuthUiErrors.INVALID_EMAIL_DOMAIN.errno
        );

        const gleanSubmitFailSpy = jest.spyOn(
          GleanMetrics.emailFirst,
          'submitFail'
        );
        expect(gleanSubmitFailSpy).toHaveBeenCalledTimes(1);
      });
    });
  });
});

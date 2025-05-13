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
import { Integration, IntegrationType, WebIntegration } from '../../models';
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
import { GenericData, ModelValidationErrors } from '../../lib/model-data';

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
    // Leaving for historical record. Remove once baked.
    // integration = {
    //   type: IntegrationType.Web,
    //   getService: () => MozServices.Default,
    //   getClientId: () => undefined,
    //   isSync: () => false,
    //   wantsKeys: () => false,
    //   isDesktopSync: () => false,
    //   isDesktopRelay: () => false,
    //   data: {},
    // } as Integration;

    integration = new WebIntegration(
      new GenericData({
        service: MozServices.Default,
      })
    );

    expect(integration.type).toEqual(IntegrationType.Web);
    expect(integration.getService()).toEqual(MozServices.Default);
    expect(integration.getClientId()).toEqual(undefined);
    expect(integration.isSync()).toBeFalsy();
    expect(integration.wantsKeys()).toBeFalsy();
    expect(integration.isDesktopSync()).toBeFalsy();
    expect(integration.isDesktopRelay()).toBeFalsy();
  }

  function mockUnsupportedContextIntegration() {
    // Leaving for historical record. Remove once baked.
    // integration = {
    //   type: IntegrationType.Web,
    //   getService: () => MozServices.Default,
    //   getClientId: () => undefined,
    //   isSync: () => false,
    //   wantsKeys: () => false,
    //   isDesktopSync: () => false,
    //   isDesktopRelay: () => false,
    //   data: { context: 'fx_desktop_v2' },
    // } as Integration;

    integration = new WebIntegration(
      new GenericData({
        context: 'fx_desktop_v2',
        service: MozServices.Default,
      })
    );

    expect(integration.type).toEqual(IntegrationType.Web);
    expect(integration.getService()).toEqual(MozServices.Default);
    expect(integration.getClientId()).toEqual(undefined);
    expect(integration.isSync()).toBeFalsy();
    expect(integration.wantsKeys()).toBeFalsy();
    expect(integration.isDesktopSync()).toBeFalsy();
    expect(integration.isDesktopRelay()).toBeFalsy();
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

  it('should display LoadingSpinner at initial load and remove when ready', async () => {
    // Mock the initial state and dependencies
    mockLocationState = {};
    mockUseValidatedQueryParams.mockReturnValue({
      queryParamModel: { email: 'test@example.com' },
      validationError: null,
    });

    // simulate rejecting from auth client after a delay
    const rejectingMock = jest.fn(() => new Promise((_, reject) => {
      setTimeout(() => reject('mock delayed error'), 50);
    }));

    mockUseAuthClient.mockReturnValue({
      accountStatusByEmail: rejectingMock,
    })

    const { getByText, queryByText } = renderWithLocalizationProvider(
      <LocationProvider>
        <IndexContainer
          {...{ integration, serviceName: MozServices.Default }}
        />
      </LocationProvider>
    );

    // Assert that the LoadingSpinner is rendered initially
    expect(getByText('LoadingSpinner')).toBeInTheDocument();

    // Wait for the mock to be called and
    // then check that the LoadingSpinner is removed
    await waitFor(() => {
      expect(rejectingMock).toHaveBeenCalledTimes(1);
      expect(queryByText('LoadingSpinner')).not.toBeInTheDocument();
    });

    expect(IndexModule.default).toHaveBeenCalled();
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

    it('should render Index with emailSuggestionError when provided email fails email validation', async () => {
      // No prefillEmail so query param email is used
      mockLocationState = {};
      // Provide an invalid email via query params (missing '@' makes it fail validation)
      mockUseValidatedQueryParams.mockReturnValue({
        queryParamModel: { email: 'invalid-email' },
        validationError: new Error() as ModelValidationErrors,
      });

      renderWithLocalizationProvider(
        <LocationProvider>
          <IndexContainer
            {...{ integration, serviceName: MozServices.Default }}
          />
        </LocationProvider>
      );

      await waitFor(() => {
        expect(currentIndexProps).toBeDefined();
      });

      expect(mockNavigate).not.toHaveBeenCalled();

      expect(currentIndexProps?.tooltipErrorMessage).toBeDefined();
      expect(currentIndexProps?.tooltipErrorMessage).toEqual(
        AuthUiErrors.EMAIL_REQUIRED.message
      );
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

  describe('processEmailSubmission', () => {
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
          expect(currentIndexProps?.processEmailSubmission).toBeDefined();
        });

        await currentIndexProps?.processEmailSubmission(MOCK_EMAIL);

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
          expect(currentIndexProps?.processEmailSubmission).toBeDefined();
        });

        await currentIndexProps?.processEmailSubmission(MOCK_EMAIL);

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
      it('when called with an invalid email', async () => {
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
          expect(currentIndexProps?.processEmailSubmission).toBeDefined();
        });
        await currentIndexProps?.processEmailSubmission('invalid-email');
        await waitFor(() => {
          expect(currentIndexProps?.tooltipErrorMessage).toBeDefined();
          expect(currentIndexProps?.tooltipErrorMessage).toEqual(
            AuthUiErrors.EMAIL_REQUIRED.message
          );
        });

        const gleanSubmitFailSpy = jest.spyOn(
          GleanMetrics.emailFirst,
          'submitFail'
        );
        expect(gleanSubmitFailSpy).not.toHaveBeenCalled();
      });

      it('when called with an email mask', async () => {
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
          expect(currentIndexProps?.processEmailSubmission).toBeDefined();
        });
        await currentIndexProps?.processEmailSubmission(
          'test@relay.firefox.com'
        );
        await waitFor(() => {
          expect(currentIndexProps?.tooltipErrorMessage).toBeDefined();
          expect(currentIndexProps?.tooltipErrorMessage).toEqual(
            AuthUiErrors.EMAIL_MASK_NEW_ACCOUNT.message
          );
        });

        // no Glean event emitted with this error type
        const gleanSubmitFailSpy = jest.spyOn(
          GleanMetrics.emailFirst,
          'submitFail'
        );
        expect(gleanSubmitFailSpy).toHaveBeenCalledWith({
          event: { reason: 'registration' },
        });
      });

      it('when called with a firefox.com email', async () => {
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
          expect(currentIndexProps?.processEmailSubmission).toBeDefined();
        });
        await currentIndexProps?.processEmailSubmission('test@firefox.com');
        await waitFor(() => {
          expect(currentIndexProps?.tooltipErrorMessage).toBeDefined();
          expect(currentIndexProps?.tooltipErrorMessage).toEqual(
            AuthUiErrors.DIFFERENT_EMAIL_REQUIRED_FIREFOX_DOMAIN.message
          );
        });

        // no Glean event emitted with this error type
        const gleanSubmitFailSpy = jest.spyOn(
          GleanMetrics.emailFirst,
          'submitFail'
        );
        expect(gleanSubmitFailSpy).toHaveBeenCalledWith({
          event: { reason: 'registration' },
        });
      });

      it('when called with an invalid email domain', async () => {
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
          expect(currentIndexProps?.processEmailSubmission).toBeDefined();
        });
        await currentIndexProps?.processEmailSubmission(
          'mockinvaliddomain@invalid.invalid'
        );
        await waitFor(() => {
          expect(currentIndexProps?.tooltipErrorMessage).toBeDefined();
          expect(currentIndexProps?.tooltipErrorMessage).toEqual(
            'Mistyped email? invalid.invalid isn’t a valid email service'
          );
        });

        const gleanSubmitFailSpy = jest.spyOn(
          GleanMetrics.emailFirst,
          'submitFail'
        );
        expect(gleanSubmitFailSpy).toHaveBeenCalledWith({
          event: { reason: 'registration' },
        });
      });
    });
  });
});

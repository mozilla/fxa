/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { ReactNode } from 'react';
import { act, screen, waitFor } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { navigate } from '@reach/router';
import App from '.';
import * as Metrics from '../../lib/metrics';
import {
  AppContext,
  useInitialMetricsQueryState,
  useLocalSignedInQueryState,
  useIntegration,
  useInitialSettingsState,
  useClientInfoState,
  useProductInfoState,
  useSession,
  Account,
  IntegrationType,
} from '../../models';
import {
  MOCK_ACCOUNT,
  createAppContext,
  mockAppContext,
  renderWithRouter,
} from '../../models/mocks';
import { firefox } from '../../lib/channels/firefox';

import GleanMetrics from '../../lib/glean';
import config from '../../lib/config';
import { currentAccount } from '../../lib/cache';
import { MozServices } from '../../lib/types';
import mockUseSyncEngines from '../../lib/hooks/useSyncEngines/mocks';
import useSyncEngines from '../../lib/hooks/useSyncEngines';
import sentryMetrics from 'fxa-shared/sentry/browser';
import { OAuthError } from '../../lib/oauth';

jest.mock('@reach/router', () => {
  return {
    ...jest.requireActual('@reach/router'),
    navigate: jest.fn(),
  };
});

jest.mock('../../lib/hooks/useSyncEngines', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('fxa-shared/sentry/browser', () => ({
  __esModule: true,
  default: {
    enable: jest.fn(),
    disable: jest.fn(),
    captureException: jest.fn(),
  },
}));

jest.mock('../../models/contexts/SettingsContext', () => ({
  ...jest.requireActual('../../models/contexts/SettingsContext'),
  initializeSettingsContext: jest.fn().mockImplementation(() => {
    const context = {
      alertBarInfo: jest.fn(),
      navigatorLanguages: jest.fn(),
    };

    return context;
  }),
}));

jest.mock('../../lib/channels/firefox', () => ({
  ...jest.requireActual('../../lib/channels/firefox'),
  firefox: {
    requestSignedInUser: jest.fn(),
  },
}));

jest.mock('../../lib/cache', () => ({
  ...jest.requireActual('../../lib/cache'),
  currentAccount: jest.fn(),
}));

const mockSessionStatus = jest.fn();
jest.mock('../../models', () => ({
  ...jest.requireActual('../../models'),
  useInitialMetricsQueryState: jest.fn(),
  useLocalSignedInQueryState: jest.fn(),
  useInitialSettingsState: jest.fn(),
  useClientInfoState: jest.fn(),
  useProductInfoState: jest.fn(),
  useIntegration: jest.fn(),
  useSession: jest.fn(),
  useAuthClient: jest.fn(() => ({
    sessionStatus: mockSessionStatus,
  })),
}));

jest.mock('react-markdown', () => {});
jest.mock('rehype-raw', () => {});

jest.mock('../Settings/ScrollToTop', () => ({
  __esModule: true,
  ScrollToTop: ({ children }: { children: ReactNode }) => (
    <span data-testid="ScrollTop">{children}</span>
  ),
}));

jest.mock('../../lib/glean', () => ({
  __esModule: true,
  default: {
    initialize: jest.fn(),
    getEnabled: jest.fn(),
    useGlean: jest.fn().mockReturnValue({ enabled: true }),
    accountPref: { view: jest.fn(), promoMonitorView: jest.fn() },
    emailFirst: { view: jest.fn(), engage: jest.fn() },
    pageLoad: jest.fn(),
  },
}));

const mockMetricsQueryAccountAmplitude = {
  recoveryKey: true,
  totpActive: true,
  hasSecondaryVerifiedEmail: false,
};

const mockMetricsQueryAccountResult = {
  account: {
    uid: 'abc123',
    recoveryKey: { exists: true },
    metricsEnabled: true,
    emails: [
      {
        email: 'blabidi@blabidiboo.com',
        isPrimary: true,
        verified: true,
      },
    ],
    totp: {
      exists: true,
      verified: true,
    },
  },
};

const mockMetricsQueryAccountGlean = {
  uid: 'abc123',
  metricsEnabled: true,
};

const DEVICE_ID = 'yoyo';
const BEGIN_TIME = 123456;
const FLOW_ID = 'abc123';
const updatedFlowQueryParams = {
  deviceId: DEVICE_ID,
  flowBeginTime: BEGIN_TIME,
  flowId: FLOW_ID,
};

beforeEach(() => {
  const mockIntersectionObserver = jest.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    disconnect: () => null,
  });
  window.IntersectionObserver = mockIntersectionObserver;
});

describe('metrics', () => {
  let flowInit: jest.SpyInstance;

  beforeEach(() => {
    //@ts-ignore
    delete window.location;
    //@ts-ignore
    window.location = {
      ...window.location,
      replace: jest.fn(),
    };

    flowInit = jest.spyOn(Metrics, 'init');
    (useSyncEngines as jest.Mock).mockReturnValue(mockUseSyncEngines());
  });

  afterEach(() => {
    flowInit.mockReset();
    (useSyncEngines as jest.Mock).mockRestore();
  });

  it('Initializes metrics flow data when present', async () => {
    (useInitialMetricsQueryState as jest.Mock).mockReturnValue({
      data: mockMetricsQueryAccountResult,
      loading: false,
    });
    (useLocalSignedInQueryState as jest.Mock).mockReturnValue({
      data: { isSignedIn: true },
    });
    (useIntegration as jest.Mock).mockReturnValue({
      isSync: jest.fn(),
      isFirefoxClientServiceRelay: jest.fn(),
      getServiceName: jest.fn(),
      getClientId: jest.fn(),
      getCmsInfo: jest.fn(),
      data: {},
    });

    const flowInit = jest.spyOn(Metrics, 'init');
    const userPreferencesInit = jest.spyOn(Metrics, 'initUserPreferences');

    await act(async () => {
      renderWithLocalizationProvider(
        <AppContext.Provider
          value={{ ...mockAppContext(), ...createAppContext() }}
        >
          <App flowQueryParams={updatedFlowQueryParams} />
        </AppContext.Provider>
      );
    });

    expect(flowInit).toHaveBeenCalledWith(true, {
      deviceId: DEVICE_ID,
      flowId: FLOW_ID,
      flowBeginTime: BEGIN_TIME,
    });
    expect(userPreferencesInit).toHaveBeenCalledWith(
      mockMetricsQueryAccountAmplitude
    );
    expect(window.location.replace).not.toHaveBeenCalled();
  });
});

describe('glean', () => {
  beforeEach(() => {
    (useSyncEngines as jest.Mock).mockReturnValue(mockUseSyncEngines());
  });

  afterEach(() => {
    (useSyncEngines as jest.Mock).mockRestore();
  });
  it('Initializes glean', async () => {
    (useInitialMetricsQueryState as jest.Mock).mockReturnValueOnce({
      data: mockMetricsQueryAccountResult,
    });
    const mockIntegration = {
      isSync: jest.fn(),
      isFirefoxClientServiceRelay: jest.fn(),
      getServiceName: jest.fn(),
      getClientId: jest.fn(),
      data: {},
      getCmsInfo: jest.fn(),
    };
    (useIntegration as jest.Mock).mockReturnValue(mockIntegration);
    (useLocalSignedInQueryState as jest.Mock).mockReturnValueOnce({
      data: { isSignedIn: true },
    });

    await act(async () => {
      renderWithLocalizationProvider(
        <AppContext.Provider
          value={{ ...mockAppContext(), ...createAppContext() }}
        >
          <App flowQueryParams={updatedFlowQueryParams} />
        </AppContext.Provider>
      );
    });

    expect(GleanMetrics.initialize).toHaveBeenCalledWith(
      {
        ...config.glean,
        enabled: mockMetricsQueryAccountGlean.metricsEnabled,
        appDisplayVersion: config.version,
        appChannel: config.glean.appChannel,
      },
      {
        metricsFlow: updatedFlowQueryParams,
        userAgent: navigator.userAgent,
        integration: mockIntegration,
      }
    );
  });
});

describe('loading spinner states', () => {
  it('when initial metrics query is loading', async () => {
    (useInitialMetricsQueryState as jest.Mock).mockReturnValue({
      loading: true,
    });
    (useLocalSignedInQueryState as jest.Mock).mockReturnValue({
      data: { isSignedIn: true },
    });
    (useSession as jest.Mock).mockReturnValue({
      isValid: () => true,
      isSessionVerified: () => Promise.resolve(true),
    });
    (currentAccount as jest.Mock).mockReturnValueOnce({
      uid: 123,
      sessionToken: '123',
    });
    await act(async () => {
      renderWithLocalizationProvider(
        <AppContext.Provider
          value={{ ...mockAppContext(), ...createAppContext() }}
        >
          <App flowQueryParams={updatedFlowQueryParams} />
        </AppContext.Provider>
      );
    });

    expect(screen.getByLabelText('Loading…')).toBeInTheDocument();
  });

  it('when signed in status has not been set yet', async () => {
    (useInitialMetricsQueryState as jest.Mock).mockReturnValueOnce({
      loading: false,
    });
    (useLocalSignedInQueryState as jest.Mock).mockReturnValueOnce({
      data: undefined,
    });
    (useIntegration as jest.Mock).mockReturnValue({
      isSync: jest.fn().mockReturnValueOnce(true),
      isFirefoxClientServiceRelay: jest.fn().mockReturnValueOnce(false),
      data: {
        context: {},
      },
    });
    (firefox.requestSignedInUser as jest.Mock).mockImplementationOnce(
      async () => {
        return new Promise((resolve, reject) => {
          // never resolve.
          // a slow response here is the only way signed in status can be pending
        });
      }
    );

    await act(async () => {
      renderWithLocalizationProvider(
        <AppContext.Provider
          value={{ ...mockAppContext(), ...createAppContext() }}
        >
          <App flowQueryParams={updatedFlowQueryParams} />
        </AppContext.Provider>
      );
    });

    expect(screen.getByLabelText('Loading…')).toBeInTheDocument();
  });
});

describe('AuthAndAccountSetupRoutes', () => {
  beforeEach(() => {
    (useSyncEngines as jest.Mock).mockReturnValue(mockUseSyncEngines());
  });

  afterEach(() => {
    (useSyncEngines as jest.Mock).mockRestore();
  });
  it('calls useSyncEngines with integration', async () => {
    const mockIntegration = {
      getServiceName: () => MozServices.FirefoxSync,
      isSync: () => true,
      type: IntegrationType.OAuthNative,
      data: {},
      isFirefoxClientServiceRelay: () => false,
      getClientId: () => {},
      getCmsInfo: () => undefined,
    };

    (useIntegration as jest.Mock).mockReturnValue(mockIntegration);
    (useInitialMetricsQueryState as jest.Mock).mockReturnValue({
      loading: false,
    });
    (useLocalSignedInQueryState as jest.Mock).mockReturnValue({
      data: { isSignedIn: true },
    });

    await act(() => {
      renderWithRouter(
        <AppContext.Provider
          value={{ ...mockAppContext(), ...createAppContext() }}
        >
          <App flowQueryParams={updatedFlowQueryParams} />
        </AppContext.Provider>,
        { route: '/' }
      );
    });

    expect(useSyncEngines).toHaveBeenCalledTimes(1);
    expect(useSyncEngines).toHaveBeenCalledWith(mockIntegration);
  });
});

describe('SettingsRoutes', () => {
  const settingsPath = '/settings';

  beforeEach(() => {
    (navigate as jest.Mock).mockClear();
    (useInitialMetricsQueryState as jest.Mock).mockReturnValue({
      loading: false,
    });
    (useIntegration as jest.Mock).mockReturnValue({
      isSync: () => false,
      isFirefoxClientServiceRelay: jest.fn().mockReturnValueOnce(false),
      getServiceName: jest.fn(),
    });
    (useLocalSignedInQueryState as jest.Mock).mockReturnValue({
      data: { isSignedIn: false },
    });
    (useSession as jest.Mock).mockReturnValue({
      isValid: () => false,
      isSessionVerified: () => Promise.resolve(true),
    });
    (useProductInfoState as jest.Mock).mockReturnValue({
      loading: false,
      data: {},
    });
    (useClientInfoState as jest.Mock).mockReturnValue({
      loading: false,
      data: {},
    });
    (useInitialSettingsState as jest.Mock).mockReturnValue({ loading: false });
    mockSessionStatus.mockResolvedValue({
      details: {
        sessionVerified: true,
        sessionVerificationMeetsMinimumAAL: true,
      },
    });
  });

  afterEach(() => {
    (navigate as jest.Mock).mockRestore();
    (useIntegration as jest.Mock).mockRestore();
    (useInitialMetricsQueryState as jest.Mock).mockRestore();
    (useLocalSignedInQueryState as jest.Mock).mockRestore();
    (useInitialSettingsState as jest.Mock).mockRestore();
    (useProductInfoState as jest.Mock).mockRestore();
    (firefox.requestSignedInUser as jest.Mock).mockRestore();
    (useClientInfoState as jest.Mock).mockRestore();
    (useSession as jest.Mock).mockRestore();
    mockSessionStatus.mockClear();
  });

  it('redirects to email-first if isSignedIn is false', async () => {
    (firefox.requestSignedInUser as jest.Mock).mockResolvedValue(null);
    (currentAccount as jest.Mock).mockReturnValue(null);
    (useIntegration as jest.Mock).mockReturnValue({
      isSync: () => false,
      isFirefoxClientServiceRelay: () => false,
      data: {
        context: {},
      },
    });

    let navigateResult: Promise<void>;
    await act(async () => {
      const {
        history: { navigate },
      } = renderWithRouter(
        <AppContext.Provider
          value={{ ...mockAppContext(), ...createAppContext() }}
        >
          <App flowQueryParams={updatedFlowQueryParams} />
        </AppContext.Provider>,
        { route: '/' }
      );
      navigateResult = navigate(settingsPath);
    });

    await act(() => navigateResult);

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith(
        `/?redirect_to=${encodeURIComponent(settingsPath)}`
      );
    });
  });

  it('redirects to sign out of sync warning', async () => {
    (useIntegration as jest.Mock).mockReturnValue({
      isSync: () => true,
      isFirefoxClientServiceRelay: () => false,
      data: {
        context: {},
      },
    });

    (firefox.requestSignedInUser as jest.Mock).mockImplementationOnce(
      async () => {
        return {
          email: 'test@mozilla.com',
          uid: '123',
          sessionToken: '123',
          verified: true,
        };
      }
    );

    let navigateResult: Promise<void>;
    await act(async () => {
      const {
        history: { navigate },
      } = renderWithRouter(
        <AppContext.Provider
          value={{ ...mockAppContext(), ...createAppContext() }}
        >
          <App flowQueryParams={updatedFlowQueryParams} />
        </AppContext.Provider>,
        { route: '/' }
      );
      navigateResult = navigate(settingsPath);
    });

    await act(() => navigateResult);

    await waitFor(() => {
      expect(navigate).not.toHaveBeenCalled();
    });

    expect(screen.getByText('Session Expired')).toBeInTheDocument();
  });

  it('restores sync user when session is valid', async () => {
    // we only send a webChannel message to check for a sync user
    // if the userAgent is a version of Firefox
    Object.defineProperty(window.navigator, 'userAgent', {
      value:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:118.0) Gecko/20100101 Firefox/118.0',
      configurable: true,
    });

    (useIntegration as jest.Mock).mockReturnValue({
      isSync: () => true,
      isFirefoxClientServiceRelay: () => false,
      data: {
        context: {},
      },
    });

    (firefox.requestSignedInUser as jest.Mock).mockImplementationOnce(
      async () => {
        return {
          email: 'test@mozilla.com',
          uid: '123',
          sessionToken: '123',
          verified: true,
        };
      }
    );

    (useSession as jest.Mock).mockReturnValue({
      isValid: () => true,
      isSessionVerified: () => Promise.resolve(true),
    });

    let navigateResult: Promise<void>;
    await act(async () => {
      const {
        history: { navigate },
      } = renderWithRouter(
        <AppContext.Provider
          value={{
            ...mockAppContext({
              account: {
                ...MOCK_ACCOUNT,
              } as unknown as Account,
            }),
            ...createAppContext(),
          }}
        >
          <App flowQueryParams={updatedFlowQueryParams} />
        </AppContext.Provider>,
        { route: '/' }
      );
      navigateResult = navigate(settingsPath);
    });

    await act(() => navigateResult);

    await waitFor(() => {
      expect(navigate).not.toHaveBeenCalled();
    });
    expect(screen.getByTestId('settings-profile')).toBeInTheDocument();
  });

  it('does not redirect if isSignedIn is true', async () => {
    (useLocalSignedInQueryState as jest.Mock).mockReturnValue({
      data: { isSignedIn: true },
    });

    let navigateResult: Promise<void>;
    await act(async () => {
      const {
        history: { navigate },
      } = renderWithRouter(
        <AppContext.Provider
          value={mockAppContext({
            account: {
              ...MOCK_ACCOUNT,
            } as unknown as Account,
          })}
        >
          <App flowQueryParams={updatedFlowQueryParams} />
        </AppContext.Provider>,
        { route: '/' }
      );
      navigateResult = navigate(settingsPath);
    });

    await act(() => navigateResult);

    await waitFor(() => {
      expect(navigate).not.toHaveBeenCalled();
    });
    expect(screen.getByTestId('settings-profile')).toBeInTheDocument();
  });
});

describe('Integration serviceName error handling', () => {
  beforeEach(() => {
    (useSyncEngines as jest.Mock).mockReturnValue(mockUseSyncEngines());
    (useInitialMetricsQueryState as jest.Mock).mockReturnValue({
      loading: false,
    });
    (useLocalSignedInQueryState as jest.Mock).mockReturnValue({
      data: { isSignedIn: true },
    });
    (useSession as jest.Mock).mockReturnValue({
      isValid: () => true,
    });
    (currentAccount as jest.Mock).mockReturnValue({
      uid: '123',
      sessionToken: '123',
    });
  });

  afterEach(() => {
    (useSyncEngines as jest.Mock).mockRestore();
    (useInitialMetricsQueryState as jest.Mock).mockRestore();
    (useLocalSignedInQueryState as jest.Mock).mockRestore();
    (useSession as jest.Mock).mockRestore();
    (currentAccount as jest.Mock).mockRestore();
    (sentryMetrics.captureException as jest.Mock).mockClear();
  });

  it('shows OAuthDataError component when OAuth integration throws', async () => {
    const mockError = new OAuthError(109, { param: 'scope' });
    const mockOAuthIntegration = {
      type: IntegrationType.OAuthWeb,
      isSync: jest.fn().mockReturnValue(false),
      isFirefoxClientServiceRelay: jest.fn().mockReturnValue(false),
      getServiceName: jest.fn().mockImplementation(() => {
        throw mockError;
      }),
      getClientId: jest.fn(),
      data: {},
      getCmsInfo: jest.fn(),
    };

    (useIntegration as jest.Mock).mockReturnValue(mockOAuthIntegration);

    await act(async () => {
      renderWithLocalizationProvider(
        <AppContext.Provider
          value={{ ...mockAppContext(), ...createAppContext() }}
        >
          <App flowQueryParams={updatedFlowQueryParams} />
        </AppContext.Provider>
      );
    });

    expect(sentryMetrics.captureException).toHaveBeenCalledWith(mockError);
    expect(screen.getByText('Bad Request')).toBeInTheDocument();
    expect(screen.getByText(mockError.message)).toBeInTheDocument();
  });

  it('throws error when non-OAuth integration', async () => {
    const mockError = new Error('Non-OAuth integration error');
    const mockNonOAuthIntegration = {
      type: IntegrationType.Web,
      isSync: jest.fn().mockReturnValue(false),
      isFirefoxClientServiceRelay: jest.fn().mockReturnValue(false),
      getServiceName: jest.fn().mockImplementation(() => {
        throw mockError;
      }),
      getClientId: jest.fn(),
      data: {},
      getCmsInfo: jest.fn(),
    };

    (useIntegration as jest.Mock).mockReturnValue(mockNonOAuthIntegration);

    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    await expect(
      act(async () => {
        renderWithLocalizationProvider(
          <AppContext.Provider
            value={{ ...mockAppContext(), ...createAppContext() }}
          >
            <App flowQueryParams={updatedFlowQueryParams} />
          </AppContext.Provider>
        );
      })
    ).rejects.toThrow('Non-OAuth integration error');

    expect(sentryMetrics.captureException).toHaveBeenCalledWith(mockError);

    consoleSpy.mockRestore();
  });

  it('handles OAuthNative integration error correctly', async () => {
    const mockError = new OAuthError(109, { param: 'scope' });
    const mockOAuthNativeIntegration = {
      type: IntegrationType.OAuthNative,
      isSync: jest.fn().mockReturnValue(false),
      isFirefoxClientServiceRelay: jest.fn().mockReturnValue(false),
      getServiceName: jest.fn().mockImplementation(() => {
        throw mockError;
      }),
      getClientId: jest.fn(),
      data: {},
      getCmsInfo: jest.fn(),
    };

    (useIntegration as jest.Mock).mockReturnValue(mockOAuthNativeIntegration);

    await act(async () => {
      renderWithLocalizationProvider(
        <AppContext.Provider
          value={{ ...mockAppContext(), ...createAppContext() }}
        >
          <App flowQueryParams={updatedFlowQueryParams} />
        </AppContext.Provider>
      );
    });

    expect(sentryMetrics.captureException).toHaveBeenCalledWith(mockError);
    expect(screen.getByText('Bad Request')).toBeInTheDocument();
    expect(screen.getByText(mockError.message)).toBeInTheDocument();
  });
});

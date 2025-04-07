/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { ReactNode } from 'react';
import { act, screen, waitFor } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
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
import * as utils from 'fxa-react/lib/utils';
import { currentAccount } from '../../lib/cache';

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

jest.mock('../../models', () => ({
  ...jest.requireActual('../../models'),
  useInitialMetricsQueryState: jest.fn(),
  useLocalSignedInQueryState: jest.fn(),
  useInitialSettingsState: jest.fn(),
  useClientInfoState: jest.fn(),
  useProductInfoState: jest.fn(),
  useIntegration: jest.fn(),
  useSession: jest.fn(),
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
  });

  afterEach(() => {
    flowInit.mockReset();
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
      isDesktopRelay: jest.fn(),
      getServiceName: jest.fn(),
      getClientId: jest.fn(),
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
  it('Initializes glean', async () => {
    (useInitialMetricsQueryState as jest.Mock).mockReturnValueOnce({
      data: mockMetricsQueryAccountResult,
    });
    const mockIntegration = {
      isSync: jest.fn(),
      isDesktopRelay: jest.fn(),
      getServiceName: jest.fn(),
      getClientId: jest.fn(),
      data: {},
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
      isDesktopRelay: jest.fn().mockReturnValueOnce(false),
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

describe('SettingsRoutes', () => {
  let hardNavigateSpy: jest.SpyInstance;
  const settingsPath = '/settings';
  jest.mock('@reach/router', () => ({
    ...jest.requireActual('@reach/router'),
    useLocation: () => {
      return {
        pathname: settingsPath,
      };
    },
  }));

  beforeEach(() => {
    hardNavigateSpy = jest
      .spyOn(utils, 'hardNavigate')
      .mockImplementation(() => {});
    (useInitialMetricsQueryState as jest.Mock).mockReturnValue({
      loading: false,
    });
    (useIntegration as jest.Mock).mockReturnValue({
      isSync: () => false,
      isDesktopRelay: jest.fn().mockReturnValueOnce(false),
      getServiceName: jest.fn(),
    });
    (useLocalSignedInQueryState as jest.Mock).mockReturnValue({
      data: { isSignedIn: false },
    });
    (useSession as jest.Mock).mockReturnValue({
      isValid: () => false,
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
  });

  afterEach(() => {
    hardNavigateSpy.mockRestore();
    (useIntegration as jest.Mock).mockRestore();
    (useInitialMetricsQueryState as jest.Mock).mockRestore();
    (useLocalSignedInQueryState as jest.Mock).mockRestore();
    (useInitialSettingsState as jest.Mock).mockRestore();
    (useProductInfoState as jest.Mock).mockRestore();
    (firefox.requestSignedInUser as jest.Mock).mockRestore();
    (useClientInfoState as jest.Mock).mockRestore();
    (useSession as jest.Mock).mockRestore();
  });

  it('redirects to /signin if isSignedIn is false', async () => {
    (firefox.requestSignedInUser as jest.Mock).mockResolvedValue(null);
    (currentAccount as jest.Mock).mockReturnValue(null);
    (useIntegration as jest.Mock).mockReturnValue({
      isSync: () => false,
      isDesktopRelay: () => false,
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
      expect(hardNavigateSpy).toHaveBeenCalledWith(
        `/?redirect_to=${encodeURIComponent(settingsPath)}`
      );
    });
  });

  it('redirects to sign out of sync warning', async () => {
    (useIntegration as jest.Mock).mockReturnValue({
      isSync: () => true,
      isDesktopRelay: () => false,
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
      expect(hardNavigateSpy).not.toHaveBeenCalled();
    });

    expect(screen.getByText('Session Expired')).toBeInTheDocument();
  });

  it('restores sync user when session is valid', async () => {
    (useIntegration as jest.Mock).mockReturnValue({
      isSync: () => true,
      isDesktopRelay: () => false,
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
      expect(hardNavigateSpy).not.toHaveBeenCalled();
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
            account: MOCK_ACCOUNT as unknown as Account,
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
      expect(hardNavigateSpy).not.toHaveBeenCalled();
    });
    expect(screen.getByTestId('settings-profile')).toBeInTheDocument();
  });
});

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { ReactNode } from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { defaultAppContextValue } from './lib/test-utils';
import { AppContext } from './lib/AppContext';
import { State } from './store/state';
import { createAppStore, Store } from './store';
import waitForExpect from 'wait-for-expect';
import { Config } from './lib/config';
import { App, AppErrorBoundary, AppErrorDialog, enableNavTiming } from './App';
import * as NavTiming from 'fxa-shared/metrics/navigation-timing';
import { MemoryRouter } from 'react-router-dom';

jest.mock('./lib/sentry');

// Mock most of the components used by App in order to isolate routing logic
// and avoid mocking external network requests.
jest.mock('fxa-react/lib/AppLocalizationProvider', () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => (
    <section data-testid="AppLocalizationProvider">{children}</section>
  ),
}));

jest.mock('@fluent/react', () => ({
  __esModule: true,
  withLocalization: (arg: any) => arg,
  Localized: ({ children }: { children: ReactNode }) => (
    <span data-testid="Localized">{children}</span>
  ),
}));

jest.mock('./routes/Product', () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => (
    <section data-testid="Product">{children}</section>
  ),
}));

jest.mock('./routes/Subscriptions', () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => (
    <section data-testid="Subscriptions">{children}</section>
  ),
}));

describe('App', () => {
  afterEach(() => {
    return cleanup();
  });

  // TODO: backfill tests for asserting expected props supplied to mock
  // components, add tests for AppContext usage

  it('renders with expected content for default path', async () => {
    render(<Subject />);
    await waitForExpect(() =>
      expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument()
    );
    ['AppLocalizationProvider', 'StripeProvider', 'Subscriptions'].forEach(
      (testid) => expect(screen.queryByTestId(testid)).toBeInTheDocument()
    );
    ['Firefox Accounts', 'Account Home', 'Subscriptions'].forEach((text) =>
      expect(screen.queryByText(text)).toBeInTheDocument()
    );
  });

  const commonRoutePathTest =
    (testid: string, appPath?: string, config?: Partial<Config>) =>
    async () => {
      render(<Subject {...{ appPath, config }} />);
      await waitForExpect(() =>
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument()
      );
      await waitForExpect(() =>
        expect(screen.queryByTestId(testid)).toBeInTheDocument()
      );
    };

  it(
    'renders Subscriptions route for /subscriptions',
    commonRoutePathTest('Subscriptions', '/subscriptions')
  );

  it(
    'renders Product route for /products/prod_fpn',
    commonRoutePathTest('Product', '/products/prod_fpn')
  );

  describe('performance metrics', () => {
    const navSpy = jest.spyOn(NavTiming, 'observeNavigationTiming');
    const unsubscribe = jest.fn();
    let callbackFromApp: Function;

    afterEach(() => {
      navSpy.mockClear();
    });

    it('should not call observeNavigationTiming when metrics collection is disabled', () => {
      const storeMock = {
        subscribe: (cb: Function) => {
          callbackFromApp = cb;
          return unsubscribe;
        },
        getState: jest
          .fn()
          .mockReturnValueOnce({})
          .mockReturnValueOnce({
            profile: { result: { metricsEnabled: false } },
          }),
      };
      enableNavTiming(storeMock as unknown as Store);
      callbackFromApp();
      expect(unsubscribe).not.toHaveBeenCalled();
      callbackFromApp();

      expect(NavTiming.observeNavigationTiming).not.toHaveBeenCalled();
      expect(unsubscribe).not.toHaveBeenCalled();
    });

    it('should call observeNavigationTiming when metrics collection is enabled, then unsubscribe', () => {
      const storeMock = {
        subscribe: (cb: Function) => {
          callbackFromApp = cb;
          return unsubscribe;
        },
        getState: jest
          .fn()
          .mockReturnValueOnce({})
          .mockReturnValueOnce({
            profile: { result: { metricsEnabled: true } },
          }),
      };
      enableNavTiming(storeMock as unknown as Store);
      callbackFromApp();
      expect(unsubscribe).not.toHaveBeenCalled();
      callbackFromApp();

      expect(NavTiming.observeNavigationTiming).toHaveBeenCalledWith(
        '/navigation-timing'
      );
      expect(unsubscribe).toHaveBeenCalled();
    });
  });

  const Subject = ({
    config,
    initialState,
    storeEnhancers,
    appPath = '/',
    navigatorLanguages = ['en', 'en-US'],
  }: {
    config?: Partial<Config>;
    initialState?: State;
    storeEnhancers?: Array<any>;
    appPath?: string;
    navigatorLanguages?: string[];
  }) => {
    const {
      config: defaultConfig,
      queryParams,
      matchMedia,
      matchMediaDefault,
      navigateToUrl,
      getScreenInfo,
      stripePromise,
      locationReload,
    } = defaultAppContextValue();
    return (
      <App
        accessToken={null}
        {...{
          store: createAppStore(initialState, storeEnhancers),
          config: { ...defaultConfig, ...(config || {}) },
          queryParams,
          matchMedia,
          matchMediaDefault,
          navigateToUrl,
          getScreenInfo,
          locationReload,
          stripePromise,
          navigatorLanguages,
          // HACK: Override BrowserRouter dynamically, because mocking
          // window.location.href changes seems not currently
          // supported in the JSDOM environment we're using
          routerOverride:
            () =>
            ({ children }: { children: ReactNode }) =>
              (
                <MemoryRouter initialEntries={[appPath]}>
                  {children}
                </MemoryRouter>
              ),
        }}
      />
    );
  };
});

describe('App/AppErrorBoundary', () => {
  beforeEach(() => {
    // HACK: Swallow the exception thrown by BadComponent - it bubbles up
    // unnecesarily to jest and makes noise.
    jest.spyOn(console, 'error');
    (global.console.error as jest.Mock).mockImplementation(() => {});
  });

  afterEach(() => {
    (global.console.error as jest.Mock).mockRestore();
  });

  it('renders children that do not cause exceptions', () => {
    const GoodComponent = () => <p data-testid="good-component">Hi</p>;
    const { queryByTestId } = render(
      <AppContext.Provider value={defaultAppContextValue()}>
        <AppErrorBoundary>
          <GoodComponent />
        </AppErrorBoundary>
      </AppContext.Provider>
    );
    expect(queryByTestId('error-loading-app')).not.toBeInTheDocument();
  });

  it('renders a general error dialog on exception in child component', () => {
    const BadComponent = () => {
      throw new Error('bad');
    };
    const { queryByTestId } = render(
      <AppContext.Provider value={defaultAppContextValue()}>
        <AppErrorBoundary>
          <BadComponent />
        </AppErrorBoundary>
      </AppContext.Provider>
    );
    expect(queryByTestId('error-loading-app')).toBeInTheDocument();
  });
});

describe('App/AppErrorDialog', () => {
  it('renders a general error dialog', () => {
    const { queryByTestId } = render(
      <AppErrorDialog error={new Error('bad')} />
    );
    expect(queryByTestId('error-loading-app')).toBeInTheDocument();
  });
});

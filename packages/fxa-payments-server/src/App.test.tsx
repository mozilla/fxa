import React, { ReactNode } from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { defaultAppContextValue } from './lib/test-utils';
import { AppContext } from './lib/AppContext';
import { State } from './store/state';
import { createAppStore } from './store';
import waitForExpect from 'wait-for-expect';
import { Config } from './lib/config';

import { MemoryRouter } from 'react-router-dom';

jest.mock('./lib/sentry');

// Mock most of the components used by App in order to isolate routing logic
// and avoid mocking external network requests.
jest.mock('./lib/AppLocalizationProvider', () => ({
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

jest.mock('./routes/ProductV2', () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => (
    <section data-testid="ProductV2">{children}</section>
  ),
}));

jest.mock('./routes/Subscriptions', () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => (
    <section data-testid="Subscriptions">{children}</section>
  ),
}));

import { App, AppProps, AppErrorBoundary, AppErrorDialog } from './App';

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
    [
      'AppLocalizationProvider',
      'StripeProvider',
      'Subscriptions',
    ].forEach((testid) =>
      expect(screen.queryByTestId(testid)).toBeInTheDocument()
    );
    ['Firefox Accounts', 'Account Home', 'Subscriptions'].forEach((text) =>
      expect(screen.queryByText(text)).toBeInTheDocument()
    );
  });

  const commonRoutePathTest = (
    testid: string,
    appPath?: string,
    config?: Partial<Config>
  ) => async () => {
    render(<Subject appPath={appPath} config={config} />);
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

  it(
    'renders Subscriptions route for /v1/subscriptions',
    commonRoutePathTest('Subscriptions', '/v1/subscriptions')
  );

  it(
    'renders Product route for /v1/products/prod_fpn',
    commonRoutePathTest('Product', '/v1/products/prod_fpn')
  );

  // TODO: check for props of V2 Subscription route
  it(
    'renders Subscriptions route for /v2/subscriptions',
    commonRoutePathTest('Subscriptions', '/v2/subscriptions')
  );

  it(
    'renders ProductV2 route for /v2/products/prod_fpn',
    commonRoutePathTest('ProductV2', '/v2/products/prod_fpn')
  );

  // TODO: check for props of V2 Subscription route
  it(
    'renders Subscriptions route at default path when feature flag is set',
    commonRoutePathTest('Subscriptions', undefined, {
      featureFlags: { useSCAPaymentUIByDefault: true },
    })
  );

  // TODO: check for props of V2 Subscription route
  it(
    'renders Subscriptions route at /subscriptions when feature flag is set',
    commonRoutePathTest('Subscriptions', '/subscriptions', {
      featureFlags: { useSCAPaymentUIByDefault: true },
    })
  );

  it(
    'renders ProductV2 route at /products/prod_fpn when feature flag is set',
    commonRoutePathTest('ProductV2', '/products/prod_fpn', {
      featureFlags: { useSCAPaymentUIByDefault: true },
    })
  );

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
          routerOverride: () => ({ children }: { children: ReactNode }) => (
            <MemoryRouter initialEntries={[appPath]}>{children}</MemoryRouter>
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

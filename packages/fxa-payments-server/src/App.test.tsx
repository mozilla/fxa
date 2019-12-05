import React, { ReactNode } from 'react';
import { render, RenderResult } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import waitForExpect from 'wait-for-expect';

jest.mock('react-stripe-elements', () => ({
  ...jest.requireActual('react-stripe-elements'),
  StripeProvider: ({ children }: { children?: ReactNode }) => (
    <div data-testid="stripe-provider">{children}</div>
  ),
}));
import 'react-stripe-elements';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  BrowserRouter: ({ children }: { children?: ReactNode }) => (
    <div data-testid="browser-router"></div>
  ),
}));
import 'react-router-dom';

import {
  MOCK_PROFILE,
  MOCK_CUSTOMER,
  MOCK_ACTIVE_SUBSCRIPTIONS,
  MOCK_TOKEN,
  MOCK_PLANS,
} from './lib/test-utils';

import {
  apiFetchPlans,
  apiFetchProfile,
  apiFetchCustomer,
  apiFetchSubscriptions,
  apiFetchToken,
} from './lib/apiClient';
jest.mock('./lib/apiClient');

jest.mock('./lib/sentry');

import { defaultAppContextValue } from './lib/test-utils';
import { App, AppProps, AppErrorBoundary, AppErrorDialog } from './App';
import { AppContext } from './lib/AppContext';
import { QueryParams } from './lib/types';
import ScreenInfo from './lib/screen-info';
import { Config, defaultConfig } from './lib/config';
import { AuthServerErrno } from './lib/errors';

const mockApiFetchPlans = apiFetchPlans as jest.Mock;
const mockApiFetchProfile = apiFetchProfile as jest.Mock;
const mockApiFetchCustomer = apiFetchCustomer as jest.Mock;
const mockApiFetchSubscriptions = apiFetchSubscriptions as jest.Mock;
const mockApiFetchToken = apiFetchToken as jest.Mock;

describe('App', () => {
  const Subject = ({
    queryParams = {},
    config = defaultConfig(),
    matchMedia = () => false,
    navigateToUrl = () => {},
    locationReload = jest.fn(),
    getScreenInfo = () => new ScreenInfo(),
  }: {
    queryParams?: QueryParams;
    config?: Config;
    matchMedia?: (query: string) => boolean;
    navigateToUrl?: (url: string) => void;
    locationReload?: () => void;
    getScreenInfo?: () => ScreenInfo;
  }) => {
    return (
      <App
        {...{
          config,
          locationReload,
          matchMedia,
          navigateToUrl,
          queryParams,
          getScreenInfo,
        }}
      />
    );
  };

  beforeEach(() => {
    mockApiFetchProfile.mockResolvedValueOnce(MOCK_PROFILE);
    mockApiFetchCustomer.mockResolvedValueOnce(MOCK_CUSTOMER);
    mockApiFetchSubscriptions.mockResolvedValueOnce(MOCK_ACTIVE_SUBSCRIPTIONS);
    mockApiFetchToken.mockResolvedValueOnce(MOCK_TOKEN);
    mockApiFetchPlans.mockResolvedValueOnce(MOCK_PLANS);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const awaitLoader = async ({ findByTestId, queryByTestId }: RenderResult) => {
    await findByTestId('loading-overlay');
    await waitForExpect(() =>
      expect(queryByTestId('loading-overlay')).not.toBeInTheDocument()
    );
  };

  const assertErrorDialog = (
    mockApi: jest.Mock,
    testid: string
  ) => async () => {
    const message = 'oopsie';
    mockApi.mockReset();
    mockApi.mockRejectedValueOnce({ message });
    const renderResult = render(<Subject />);
    const { queryByTestId, queryByText } = renderResult;
    await awaitLoader(renderResult);
    expect(queryByTestId(testid)).toBeInTheDocument();
    expect(queryByText(message)).toBeInTheDocument();
  };

  it(
    'displays an error if plans fail to load',
    assertErrorDialog(mockApiFetchPlans, 'error-loading-plans')
  );

  it(
    'displays an error if profile fails to load',
    assertErrorDialog(mockApiFetchProfile, 'error-loading-profile')
  );

  it(
    'displays an error if subscriptions fail to load',
    assertErrorDialog(mockApiFetchSubscriptions, 'error-subscriptions-fetch')
  );

  it(
    'displays an error if customer fail to load',
    assertErrorDialog(mockApiFetchCustomer, 'error-loading-customer')
  );

  it('does not display an error if the customer is unknown', async () => {
    const message = 'oopsie';
    mockApiFetchCustomer.mockReset();
    mockApiFetchCustomer.mockRejectedValueOnce({
      message,
      errno: AuthServerErrno.UNKNOWN_SUBSCRIPTION_CUSTOMER,
    });
    const renderResult = render(<Subject />);
    const { queryByTestId, queryByText, debug } = renderResult;
    await awaitLoader(renderResult);
    expect(queryByTestId('error-loading-customer')).not.toBeInTheDocument();
  });
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

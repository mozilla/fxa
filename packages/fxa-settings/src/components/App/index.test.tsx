/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, act, screen } from '@testing-library/react';
import App from '.';
import * as Metrics from '../../lib/metrics';
import { Account, AppContext, useInitialState } from '../../models';
import { mockAppContext, renderWithRouter } from '../../models/mocks';
import { Config } from '../../lib/config';
import * as NavTiming from 'fxa-shared/metrics/navigation-timing';
import { HomePath } from '../../constants';

jest.mock('../../models', () => ({
  ...jest.requireActual('../../models'),
  useInitialState: jest.fn(),
}));

const appProps = {
  flowQueryParams: {
    deviceId: 'x',
    flowBeginTime: 1,
    flowId: 'x',
  },
  navigatorLanguages: ['en'],
};

describe('metrics', () => {
  beforeEach(() => {
    //@ts-ignore
    delete window.location;
    window.location = {
      ...window.location,
      replace: jest.fn(),
    };
  });

  it('Initializes metrics flow data when present', async () => {
    (useInitialState as jest.Mock).mockReturnValueOnce({loading: true});
    const DEVICE_ID = 'yoyo';
    const BEGIN_TIME = 123456;
    const FLOW_ID = 'abc123';
    const flowInit = jest.spyOn(Metrics, 'init');
    const updatedAppProps = Object.assign(appProps, {
      flowQueryParams: {
        deviceId: DEVICE_ID,
        flowBeginTime: BEGIN_TIME,
        flowId: FLOW_ID,
      },
    });

    await act(async () => {
      render(<App {...updatedAppProps} />);
    });

    expect(flowInit).toHaveBeenCalledWith(true, {
      deviceId: DEVICE_ID,
      flowId: FLOW_ID,
      flowBeginTime: BEGIN_TIME,
    });
    expect(window.location.replace).not.toHaveBeenCalled();
  });
});

describe('performance metrics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const navSpy = jest.spyOn(NavTiming, 'observeNavigationTiming');

  const config = {
    metrics: { navTiming: { enabled: true, endpoint: '/foobar' } },
  } as Config;

  afterEach(() => {
    navSpy.mockClear();
  });

  it('observeNavigationTiming is called when metrics collection is enabled', () => {
    (useInitialState as jest.Mock).mockReturnValueOnce({loading: true});
    const account = {
      metricsEnabled: true,
    } as unknown as Account;
    render(
      <AppContext.Provider value={mockAppContext({ account, config })}>
        <App {...appProps} />
      </AppContext.Provider>
    );
    expect(NavTiming.observeNavigationTiming).toHaveBeenCalledWith('/foobar');
  });

  it('observeNavigationTiming is not called when metrics collection is disabled', () => {
    (useInitialState as jest.Mock).mockReturnValueOnce({loading: true});
    const account = {
      metricsEnabled: false,
    } as unknown as Account;
    render(
      <AppContext.Provider value={mockAppContext({ account, config })}>
        <App {...appProps} />
      </AppContext.Provider>
    );
    expect(NavTiming.observeNavigationTiming).not.toHaveBeenCalled();
  });
});

describe('App component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders `LoadingSpinner` component when loading initial state is true', async () => {
    (useInitialState as jest.Mock).mockReturnValueOnce({ loading: true });
    const { getByTestId } = renderWithRouter(<App {...appProps} />);

    expect(getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders `LoadingSpinner` component when the error message includes "Invalid token"', async() => {
    (useInitialState as jest.Mock).mockReturnValueOnce({ error: { message: "Invalid token" }});
    const { getByTestId } = renderWithRouter(<App {...appProps} />);

    expect(getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders `AppErrorDialog` component when there is an error other than "Invalid token"', async () => {
    (useInitialState as jest.Mock).mockReturnValueOnce({ error: { message: "Error" }});
    const { getByTestId } = renderWithRouter(<App {...appProps} />);

    expect(getByTestId('error-loading-app')).toBeInTheDocument();
  });

  it('renders PageSettings', async () => {
    (useInitialState as jest.Mock).mockReturnValueOnce({ loading: false });

    renderWithRouter(
      <App {...appProps} />,
      { route: HomePath }
    );

    screen.debug();
  });

  // routes to `/display_name`

  // routes to `/avatar`

  // routes to `/change_password`

  // routes to `/account_recovery`

  // routes to `/emails`

  // routes to `/emails/verify`

  // routes to `/two_step_authentication`

  // routes to `/two_step_authentication/replace_codes`

  // routes to `/delete_account`

  // redirects to `/settings#connected-services`

  // redirects to `/settings/avatar/"
});

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { ReactNode } from 'react';
import { render, act } from '@testing-library/react';
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

jest.mock('fxa-react/lib/AppLocalizationProvider', () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => (
    <section data-testid="AppLocalizationProvider">{children}</section>
  ),
}));

jest.mock('../ScrollToTop', () => ({
  __esModule: true,
  ScrollToTop: ({ children }: { children: ReactNode }) => (
    <span data-testid="ScrollTop">{children}</span>
  ),
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
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders `LoadingSpinner` component when loading initial state is true', () => {
    (useInitialState as jest.Mock).mockReturnValueOnce({ loading: true });
    const { getByLabelText } = renderWithRouter(<App {...appProps} />);

    expect(getByLabelText('Loading...')).toBeInTheDocument();
  });

  it('renders `LoadingSpinner` component when the error message includes "Invalid token"',() => {
    (useInitialState as jest.Mock).mockReturnValueOnce({ error: { message: "Invalid token" }});
    const { getByLabelText } = renderWithRouter(<App {...appProps} />);

    expect(getByLabelText('Loading...')).toBeInTheDocument();
  });

  it('renders `AppErrorDialog` component when there is an error other than "Invalid token"', () => {
    (useInitialState as jest.Mock).mockReturnValueOnce({ error: { message: "Error" }});
    const { getByRole } = renderWithRouter(<App {...appProps} />);

    expect(getByRole('heading', { level: 2 })).toHaveTextContent('General application error');
  });

  (useInitialState as jest.Mock).mockReturnValue({ loading: false });

  it('routes to PageSettings', async () => {
    const {
      getByTestId,
      history: { navigate },
    } = renderWithRouter(<App {...appProps} />, { route: HomePath });

    await navigate(HomePath);

    expect(getByTestId('settings-profile')).toBeInTheDocument();
  });

  it('routes to PageDisplayName', async () => {
    const {
      getByTestId,
      history: { navigate },
    } = renderWithRouter(<App {...appProps} />, { route: HomePath });

    await navigate(HomePath + '/display_name');

    expect(getByTestId('input-label')).toHaveTextContent('Enter display name');
  });

  it('routes to PageAvatar', async () => {
    const {
      getAllByTestId,
      history: { navigate },
    } = renderWithRouter(<App {...appProps} />, { route: HomePath });

    await navigate(HomePath + '/avatar');

    expect(getAllByTestId('avatar-nondefault')[0]).toBeInTheDocument();
  });

  it('routes to PageChangePassword', async () => {
    const {
      getByTestId,
      history: { navigate },
    } = renderWithRouter(<App {...appProps} />, { route: HomePath });

    await navigate(HomePath + '/change_password');

    expect(getByTestId('change-password-requirements')).toBeInTheDocument();
  });

  it('routes to PageRecoveryKeyAdd', async () => {
    const {
      getByTestId,
      history: { navigate },
    } = renderWithRouter(<App {...appProps} />, { route: HomePath });

    await navigate(HomePath + '/account_recovery');

    expect(getByTestId('recovery-key-input')).toBeInTheDocument();
  });

  it('routes to PageSecondaryEmailAdd', async () => {
    const {
      getByTestId,
      history: { navigate },
    } = renderWithRouter(<App {...appProps} />, { route: HomePath });

    await navigate(HomePath + '/emails');

    expect(getByTestId('secondary-email-input')).toBeInTheDocument();
  });

  it('routes to PageSecondaryEmailVerify', async () => {
    const {
      getByTestId,
      history: { navigate },
    } = renderWithRouter(<App {...appProps} />, { route: HomePath });

    await navigate(HomePath + '/emails/verify');

    expect(getByTestId('secondary-email-verify-form')).toBeInTheDocument();
  });

  it('routes to PageTwoStepAuthentication', async () => {
    const {
      getByTestId,
      history: { navigate },
    } = renderWithRouter(<App {...appProps} />, { route: HomePath });

    await navigate(HomePath + '/two_step_authentication');

    expect(getByTestId('recovery-key-input')).toBeInTheDocument();
  });

  it('routes to Page2faReplaceRecoveryCodes', async () => {
    const {
      getByTestId,
      history: { navigate },
    } = renderWithRouter(<App {...appProps} />, { route: HomePath });

    await navigate(HomePath + '/two_step_authentication/replace_codes' );

    expect(getByTestId('2fa-recovery-codes')).toBeInTheDocument();
  });

  it('routes to PageDeleteAccount', async () => {
    const {
      getByTestId,
      history: { navigate },
    } = renderWithRouter(<App {...appProps} />, { route: HomePath });

    await navigate(HomePath + '/delete_account');

    expect(getByTestId('delete-account-confirm')).toBeInTheDocument();
  });

  it('redirects to ConnectedServices', async () => {
    const {
      history,
      history: { navigate },
    } = renderWithRouter(<App {...appProps} />, { route: HomePath });

    await navigate(HomePath + '/clients');

    expect(history.location.pathname).toBe('/settings#connected-services');
  });

  it('redirects to PageAvatar', async () => {
    const {
      history,
      history: { navigate },
    } = renderWithRouter(<App {...appProps} />, { route: HomePath });

    await navigate(HomePath + '/avatar/change');

    expect(history.location.pathname).toBe('/settings/avatar');
  });
});

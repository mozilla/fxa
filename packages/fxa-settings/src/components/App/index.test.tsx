/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, act } from '@testing-library/react';
import App from '.';
import * as Metrics from '../../lib/metrics';
import { Account, AppContext } from '../../models';
import { mockAppContext } from '../../models/mocks';
import { Config } from '../../lib/config';
import * as NavTiming from 'fxa-shared/metrics/navigation-timing';

jest.mock('../../models', () => ({
  ...jest.requireActual('../../models'),
  useInitialState: jest.fn().mockReturnValue({ loading: true }),
}));

const appProps = {
  flowQueryParams: {
    deviceId: 'x',
    flowBeginTime: 1,
    flowId: 'x',
  },
  navigatorLanguages: ['en'],
  config: { metrics: { navTiming: { enabled: false, endpoint: '' } } },
};

beforeEach(() => {
  //@ts-ignore
  delete window.location;
  window.location = {
    ...window.location,
    replace: jest.fn(),
  };
});

it('renders', async () => {
  await act(async () => {
    render(<App {...appProps} />);
  });
});

it('Initializes metrics flow data when present', async () => {
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

describe('performance metrics', () => {
  const navSpy = jest.spyOn(NavTiming, 'observeNavigationTiming');

  const config = {
    metrics: { navTiming: { enabled: true, endpoint: '/foobar' } },
  } as Config;

  afterEach(() => {
    navSpy.mockClear();
  });

  it('observeNavigationTiming is called when metrics collection is enabled', () => {
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

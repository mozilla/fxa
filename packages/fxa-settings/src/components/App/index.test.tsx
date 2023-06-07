/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { ReactNode } from 'react';
import { render, act } from '@testing-library/react';
import App from '.';
import * as Metrics from '../../lib/metrics';
import { useAccount, useInitialState } from '../../models';

jest.mock('../../models', () => ({
  ...jest.requireActual('../../models'),
  useInitialState: jest.fn(),
  useAccount: jest.fn(),
}));

jest.mock('react-markdown', () => {});
jest.mock('rehype-raw', () => {});

jest.mock('fxa-react/lib/AppLocalizationProvider', () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => (
    <section data-testid="AppLocalizationProvider">{children}</section>
  ),
}));

jest.mock('../Settings/ScrollToTop', () => ({
  __esModule: true,
  ScrollToTop: ({ children }: { children: ReactNode }) => (
    <span data-testid="ScrollTop">{children}</span>
  ),
}));

describe('metrics', () => {
  let flowInit: jest.SpyInstance;

  beforeEach(() => {
    //@ts-ignore
    delete window.location;
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
    const mockAccount = {
      metricsEnabled: true,
      recoveryKey: true,
      totpActive: true,
      hasSecondaryVerifiedEmail: false,
    };
    (useAccount as jest.Mock).mockReturnValue(mockAccount);
    (useInitialState as jest.Mock).mockReturnValue({ loading: true });
    const DEVICE_ID = 'yoyo';
    const BEGIN_TIME = 123456;
    const FLOW_ID = 'abc123';
    const flowInit = jest.spyOn(Metrics, 'init');
    const userPreferencesInit = jest.spyOn(Metrics, 'initUserPreferences');
    const updatedFlowQueryParams = {
      deviceId: DEVICE_ID,
      flowBeginTime: BEGIN_TIME,
      flowId: FLOW_ID,
    };

    await act(async () => {
      render(<App flowQueryParams={updatedFlowQueryParams} />);
    });

    expect(flowInit).toHaveBeenCalledWith(true, {
      deviceId: DEVICE_ID,
      flowId: FLOW_ID,
      flowBeginTime: BEGIN_TIME,
    });
    expect(userPreferencesInit).toHaveBeenCalledWith(mockAccount);
    expect(window.location.replace).not.toHaveBeenCalled();
  });
});

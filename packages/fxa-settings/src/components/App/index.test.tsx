/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { ReactNode } from 'react';
import { act } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import App from '.';
import * as Metrics from '../../lib/metrics';
import {
  AppContext,
  useAccount,
  useInitialSettingsState,
  useIntegration,
} from '../../models';
import { createAppContext, mockAppContext } from '../../models/mocks';
import GleanMetrics from '../../lib/glean';
import config from '../../lib/config';

jest.mock('../../models', () => ({
  ...jest.requireActual('../../models'),
  useInitialSettingsState: jest.fn(),
  useAccount: jest.fn(),
  useIntegration: jest.fn(),
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

jest.mock('../../lib/glean', () => ({
  __esModule: true,
  default: { initialize: jest.fn() },
}));

const mockAccount = {
  metricsEnabled: true,
  recoveryKey: true,
  totpActive: true,
  hasSecondaryVerifiedEmail: false,
};
const DEVICE_ID = 'yoyo';
const BEGIN_TIME = 123456;
const FLOW_ID = 'abc123';
const updatedFlowQueryParams = {
  deviceId: DEVICE_ID,
  flowBeginTime: BEGIN_TIME,
  flowId: FLOW_ID,
};

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
    (useAccount as jest.Mock).mockReturnValue(mockAccount);
    (useInitialSettingsState as jest.Mock).mockReturnValue({ loading: true });
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
    expect(userPreferencesInit).toHaveBeenCalledWith(mockAccount);
    expect(window.location.replace).not.toHaveBeenCalled();
  });
});

describe('glean', () => {
  it('Initializes glean', async () => {
    (useAccount as jest.Mock).mockReturnValue(mockAccount);
    (useInitialSettingsState as jest.Mock).mockReturnValue({ loading: true });
    (useIntegration as jest.Mock).mockReturnValue({});

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
        enabled: mockAccount.metricsEnabled,
        appDisplayVersion: config.version,
        channel: config.glean.channel,
      },
      {
        flowQueryParams: updatedFlowQueryParams,
        account: mockAccount,
        userAgent: navigator.userAgent,
        integration: {},
      }
    );
  });
});

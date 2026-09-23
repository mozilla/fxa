/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { render, waitFor } from '@testing-library/react';
import * as utils from 'fxa-react/lib/utils';
import SubscriptionsRedirectPage, { getSubscriptionsRedirect } from '.';
import { getDefault } from '../../lib/config';

jest.mock('../../models', () => ({
  ...jest.requireActual('../../models'),
  useConfig: () => mockConfig,
}));
jest.mock('../../lib/cache', () => ({
  ...jest.requireActual('../../lib/cache'),
  currentAccount: () => undefined,
}));
jest.mock('../../lib/metrics-flow', () => ({
  ...jest.requireActual('../../lib/metrics-flow'),
  getMetricsFlow: () => null,
}));

const mockConfig = {
  ...getDefault(),
  servers: {
    ...getDefault().servers,
    paymentsNext: { url: 'https://payments-next.example.com' },
  },
};

const landing = 'https://payments-next.example.com/subscriptions/landing';
const flow = { flowId: 'fid', flowBeginTime: 123, deviceId: 'did' };

describe('getSubscriptionsRedirect', () => {
  const redirect = (
    overrides: Partial<Parameters<typeof getSubscriptionsRedirect>[0]> = {}
  ) =>
    getSubscriptionsRedirect({
      paymentsNextUrl: 'https://payments-next.example.com',
      flow: null,
      metricsEnabled: true,
      ...overrides,
    });

  it('sends the user to payments next landing', () => {
    expect(redirect()).toBe(landing);
  });

  it('adds flow params', () => {
    expect(redirect({ flow })).toBe(
      `${landing}?device_id=did&flow_begin_time=123&flow_id=fid`
    );
  });

  it('leaves out flow params when metrics are off', () => {
    expect(redirect({ flow, metricsEnabled: false })).toBe(landing);
  });
});

describe('SubscriptionsRedirectPage', () => {
  it('navigates to payments next landing', async () => {
    const hardNavigate = jest
      .spyOn(utils, 'hardNavigate')
      .mockImplementation(() => {});
    render(<SubscriptionsRedirectPage />);
    await waitFor(() => expect(hardNavigate).toHaveBeenCalledWith(landing));
    hardNavigate.mockRestore();
  });
});

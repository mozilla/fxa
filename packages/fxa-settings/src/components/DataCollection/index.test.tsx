/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { DataCollection } from '.';
import { mockAppContext, renderWithRouter } from '../../models/mocks';
import { Account, AppContext } from '../../models';
import * as Metrics from '../../lib/metrics';

const account = {
  displayName: 'jrgm',
  metricsOpt: jest.fn().mockResolvedValue(true),
  metricsEnabled: true,
} as unknown as Account;

describe('DataCollection', () => {
  let setEnabledSpy: jest.SpyInstance;

  beforeEach(() => {
    setEnabledSpy = jest.spyOn(Metrics, 'setEnabled').mockImplementation();
  });

  it('renders as expected', () => {
    const { container } = render(<DataCollection />);

    expect(container).toHaveTextContent('Data Collection and Use');
    expect(container).toHaveTextContent('Help improve Firefox Accounts');
    expect(container).toHaveTextContent(
      'Allow Firefox Accounts to send technical and interaction data to Mozilla.'
    );
    expect(
      screen.getByTestId('link-external-telemetry-opt-out')
    ).toHaveAttribute(
      'href',
      'https://www.mozilla.org/en-US/privacy/firefox/#firefox-accounts'
    );
  });

  it('toggles', async () => {
    const it = renderWithRouter(
      <AppContext.Provider value={mockAppContext({ account })}>
        <DataCollection />
      </AppContext.Provider>
    );

    const button = it.getByTestId('metrics-opt-out');
    // since metricsOpt is async and uses useState the `act` here is necessary
    await act(() => Promise.resolve(button.click()));
    expect(account.metricsOpt).toBeCalledWith('out');
    expect(setEnabledSpy).toBeCalledWith(true);
    //@ts-ignore mock doesn't care that the prop is readonly
    account.metricsEnabled = false;
    await act(() => Promise.resolve(button.click()));
    expect(account.metricsOpt).toBeCalledWith('in');
    expect(setEnabledSpy).toBeCalledWith(false);
  });
});

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { DataCollection } from '.';
import { mockAppContext, renderWithRouter } from '../../models/mocks';
import { Account, AppContext } from '../../models';

const account = {
  displayName: 'jrgm',
  metricsOpt: jest.fn().mockResolvedValue(true),
  metricsEnabled: true,
} as unknown as Account;

jest.mock('../../models/AlertBarInfo');

describe('DataCollection', () => {
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
    button.click();
    await waitFor(() => expect(account.metricsOpt).toBeCalledWith('out'));
    //@ts-ignore mock doesn't care that the prop is readonly
    account.metricsEnabled = false;
    button.click();
    await waitFor(() => expect(account.metricsOpt).toBeCalledWith('in'));
  });

  describe('AlertBar', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('displays an opt out success message in the AlertBar', async () => {
      const context = mockAppContext({ account });
      renderWithRouter(
        <AppContext.Provider value={context}>
          <DataCollection />
        </AppContext.Provider>
      );

      await act(async () => {
        fireEvent.click(screen.getByTestId('metrics-opt-out'));
      });

      expect(context.alertBarInfo?.success).toBeCalledTimes(1);
      expect(
        (context.alertBarInfo?.success as jest.Mock).mock.calls[0][0]
      ).toContain('Opt out successful.');
    });

    it('displays an opt in success message in the AlertBar', async () => {
      const context = mockAppContext({
        account: {
          ...account,
          metricsEnabled: true,
        } as Account,
      });
      renderWithRouter(
        <AppContext.Provider value={context}>
          <DataCollection />
        </AppContext.Provider>
      );

      await act(async () => {
        fireEvent.click(screen.getByTestId('metrics-opt-out'));
      });

      expect(context.alertBarInfo?.success).toBeCalledTimes(1);
      expect(
        (context.alertBarInfo?.success as jest.Mock).mock.calls[0][0]
      ).toContain('Thanks! Sharing this data helps us improve');
    });

    it('displays an error message in the AlertBar', async () => {
      const context = mockAppContext({
        account: {
          ...account,
          metricsOpt: jest.fn().mockRejectedValue(new Error()),
        } as unknown as Account,
      });
      renderWithRouter(
        <AppContext.Provider value={context}>
          <DataCollection />
        </AppContext.Provider>
      );

      await act(async () => {
        fireEvent.click(screen.getByTestId('metrics-opt-out'));
      });

      expect(context.alertBarInfo?.error).toBeCalledTimes(1);
      expect(
        (context.alertBarInfo?.error as jest.Mock).mock.calls[0][0]
      ).toContain('Sorry, there was a problem');
    });
  });
});

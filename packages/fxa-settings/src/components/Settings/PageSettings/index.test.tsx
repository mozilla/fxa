/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import PageSettings from '.';
import {
  MOCK_ACCOUNT,
  mockAppContext,
  renderWithRouter,
} from '../../../models/mocks';
import * as Metrics from '../../../lib/metrics';
import GleanMetrics from '../../../lib/glean';
import { Account, AppContext } from '../../../models';
import {
  ALL_PRODUCT_PROMO_SERVICES,
  ALL_PRODUCT_PROMO_SUBSCRIPTIONS,
} from '../../../pages/mocks';
import { MOCK_SERVICES } from '../ConnectedServices/mocks';

jest.mock('../../../lib/metrics', () => ({
  setProperties: jest.fn(),
  usePageViewEvent: jest.fn(),
}));

jest.mock('../../../lib/glean', () => ({
  __esModule: true,
  default: {
    accountPref: {
      view: jest.fn(),
      promoMonitorView: jest.fn(),
    },
    deleteAccount: {
      settingsSubmit: jest.fn(),
    },
  },
}));

beforeEach(() => {
  const mockIntersectionObserver = jest.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    disconnect: () => null,
  });
  window.IntersectionObserver = mockIntersectionObserver;
});

describe('PageSettings', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('renders without imploding', async () => {
    renderWithRouter(<PageSettings />);
    expect(screen.getByTestId('settings-profile')).toBeInTheDocument();
    expect(screen.getByTestId('settings-security')).toBeInTheDocument();
    expect(
      screen.getByTestId('settings-connected-services')
    ).toBeInTheDocument();
    expect(screen.getByTestId('settings-delete-account')).toBeInTheDocument();
    expect(
      screen.queryByTestId('settings-data-collection')
    ).toBeInTheDocument();
    expect(Metrics.setProperties).toHaveBeenCalledWith({
      lang: null,
      uid: 'abc123',
    });
  });

  describe('glean metrics', () => {
    it('emits the expected event on render', async () => {
      renderWithRouter(<PageSettings />);
      expect(GleanMetrics.accountPref.view).toHaveBeenCalled();
    });

    it('emits the expected event on click of Delete account button', async () => {
      renderWithRouter(<PageSettings />);
      await userEvent.click(
        screen.getByRole('link', { name: 'Delete account' })
      );
      expect(GleanMetrics.deleteAccount.settingsSubmit).toHaveBeenCalled();
    });

    describe('product promo event', () => {
      it('user does not have Monitor', async () => {
        const account = {
          ...MOCK_ACCOUNT,
          attachedClients: [],
          subscriptions: [],
        } as unknown as Account;
        renderWithRouter(
          <AppContext.Provider value={mockAppContext({ account })}>
            <PageSettings />
          </AppContext.Provider>
        );
        expect(GleanMetrics.accountPref.promoMonitorView).toBeCalledTimes(1);
        expect(GleanMetrics.accountPref.promoMonitorView).toBeCalledWith({
          event: { reason: 'free' },
        });
      });
      it('user has all products and subscriptions', async () => {
        const attachedClients = MOCK_SERVICES.filter((service) =>
          ALL_PRODUCT_PROMO_SERVICES.some(
            (promoService) => promoService.name === service.name
          )
        );
        const account = {
          ...MOCK_ACCOUNT,
          attachedClients,
          subscriptions: ALL_PRODUCT_PROMO_SUBSCRIPTIONS,
        } as unknown as Account;
        renderWithRouter(
          <AppContext.Provider value={mockAppContext({ account })}>
            <PageSettings />
          </AppContext.Provider>
        );
        expect(GleanMetrics.accountPref.promoMonitorView).not.toBeCalled();
      });
    });
  });
});

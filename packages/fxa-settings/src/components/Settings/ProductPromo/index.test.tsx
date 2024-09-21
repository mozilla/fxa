/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import ProductPromo, { ProductPromoType } from '.';
import { Account, AppContext } from '../../../models';
import { MozServices } from '../../../lib/types';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { mockAppContext } from '../../../models/mocks';
import GleanMetrics from '../../../lib/glean';
import {
  ALL_PRODUCT_PROMO_SERVICES,
  ALL_PRODUCT_PROMO_SUBSCRIPTIONS,
} from '../../../pages/mocks';

jest.mock('../../../lib/glean', () => ({
  __esModule: true,
  default: {
    accountPref: {
      promoMonitorView: jest.fn(),
      promoMonitorSubmit: jest.fn(),
    },
  },
}));

describe('ProductPromo', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing if user has Monitor but not MonitorPlus, and MonitorPlus Promo is disabled', () => {
    const account = {
      attachedClients: ALL_PRODUCT_PROMO_SERVICES,
      subscriptions: [],
    } as unknown as Account;

    const { container } = renderWithLocalizationProvider(
      <AppContext.Provider value={mockAppContext({ account })}>
        <ProductPromo />
      </AppContext.Provider>
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders nothing if user has all products and subscriptions', async () => {
    const account = {
      attachedClients: ALL_PRODUCT_PROMO_SERVICES,
      subscriptions: ALL_PRODUCT_PROMO_SUBSCRIPTIONS,
    } as unknown as Account;

    const { container } = renderWithLocalizationProvider(
      <AppContext.Provider value={mockAppContext({ account })}>
        <ProductPromo type={ProductPromoType.Settings} />
      </AppContext.Provider>
    );

    expect(container.firstChild).toBeNull();
  });
  it('renders Monitor promo if user does not have Monitor', async () => {
    const account = {
      attachedClients: [],
      subscriptions: [],
    } as unknown as Account;
    renderWithLocalizationProvider(
      <AppContext.Provider value={mockAppContext({ account })}>
        <ProductPromo type={ProductPromoType.Settings} />
      </AppContext.Provider>
    );

    screen.getByAltText('Mozilla Monitor');
    screen.getByText(
      'Find where your private info is exposed — and take it back'
    );
    expect(screen.getByRole('link', { name: /Get free scan/ })).toHaveAttribute(
      'href',
      'https://monitor.mozilla.org/?utm_source=moz-account&utm_medium=product-partnership&utm_term=sidebar&utm_content=monitor-free&utm_campaign=settings-promo'
    );
  });

  it('renders Monitor Plus promo if user does not have Monitor Plus', async () => {
    const account = {
      attachedClients: [
        {
          name: MozServices.Monitor,
        },
      ],
      subscriptions: [],
    } as unknown as Account;
    renderWithLocalizationProvider(
      <AppContext.Provider value={mockAppContext({ account })}>
        <ProductPromo
          monitorPlusEnabled={true}
          type={ProductPromoType.Settings}
        />
      </AppContext.Provider>
    );

    screen.getByAltText('Mozilla Monitor');
    screen.getByText(
      'Privacy Matters: Find where your private info is exposed and take it back'
    );
    expect(screen.getByRole('link', { name: /Get started/ })).toHaveAttribute(
      'href',
      'https://monitor.mozilla.org/#pricing?utm_source=moz-account&utm_medium=product-partnership&utm_term=sidebar&utm_content=monitor-plus&utm_campaign=settings-promo'
    );
  });

  it('emits metric when user clicks call to action', async () => {
    const account = {
      attachedClients: [
        {
          name: MozServices.Monitor,
        },
      ],
      subscriptions: [],
    } as unknown as Account;
    renderWithLocalizationProvider(
      <AppContext.Provider value={mockAppContext({ account })}>
        <ProductPromo monitorPlusEnabled={true} />
      </AppContext.Provider>
    );

    fireEvent.click(screen.getByRole('link', { name: /Get started/ }));
    await waitFor(() => {
      expect(GleanMetrics.accountPref.promoMonitorSubmit).toBeCalledWith({
        event: { reason: 'plus' },
      });
    });
  });
});

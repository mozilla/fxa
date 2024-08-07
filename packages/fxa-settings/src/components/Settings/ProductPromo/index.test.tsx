/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import ProductPromo, { monitorPromoLink, monitorPlusPromoLink } from '.';
import { Account, AppContext } from '../../../models';
import { MOCK_SERVICES } from '../ConnectedServices/mocks';
import { MozServices } from '../../../lib/types';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { mockAppContext } from '../../../models/mocks';

// List all services this component handles
const PRODUCT_PROMO_SERVICES = [MozServices.Monitor];
const PRODUCT_PROMO_SUBSCRIPTIONS = [{ productName: MozServices.MonitorPlus }];

describe('ProductPromo', () => {
  it('renders nothing if user has all products and subscriptions', async () => {
    const services = MOCK_SERVICES.filter((service) =>
      // TODO: MozServices / string discrepancy, FXA-6802
      PRODUCT_PROMO_SERVICES.includes(service.name as MozServices)
    );
    const account = {
      attachedClients: services,
      subscriptions: PRODUCT_PROMO_SUBSCRIPTIONS,
    } as unknown as Account;

    const { container } = renderWithLocalizationProvider(
      <AppContext.Provider value={mockAppContext({ account })}>
        <ProductPromo />
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
        <ProductPromo />
      </AppContext.Provider>
    );

    screen.getByAltText('Mozilla Monitor');
    screen.getByText(
      'Find where your private info is exposed — and take it back'
    );
    expect(screen.getByRole('link', { name: /Get free scan/ })).toHaveAttribute(
      'href',
      monitorPromoLink
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
        <ProductPromo />
      </AppContext.Provider>
    );

    screen.getByAltText('Mozilla Monitor');
    screen.getByText(
      'Privacy Matters: Find where your private info is exposed and take it back'
    );
    expect(screen.getByRole('link', { name: /Get started/ })).toHaveAttribute(
      'href',
      monitorPlusPromoLink
    );
  });
});

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import ProductPromo from '.';
import { Account, AppContext } from '../../../models';
import { MozServices } from '../../../lib/types';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { mockAppContext } from '../../../models/mocks';
import GleanMetrics from '../../../lib/glean';

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

  it('renders nothing for Monitor Plus subscribers', () => {
    const account = {
      attachedClients: [{ name: MozServices.Monitor }],
      subscriptions: [{ productName: MozServices.MonitorPlus }],
    } as unknown as Account;

    renderWithLocalizationProvider(
      <AppContext.Provider value={mockAppContext({ account })}>
        <ProductPromo type="settings" />
      </AppContext.Provider>
    );

    // nothing should render
    expect(screen.queryByAltText('Mozilla Monitor')).toBeNull();
  });

  it('shows generic promo when user has no Monitor', () => {
    const account = {
      attachedClients: [],
      subscriptions: [],
    } as unknown as Account;

    renderWithLocalizationProvider(
      <AppContext.Provider value={mockAppContext({ account })}>
        <ProductPromo type="settings" />
      </AppContext.Provider>
    );

    screen.getByAltText('Mozilla Monitor');
    screen.getByText(
      'Find where your private info is exposed and take control'
    );
    expect(
      screen.getByRole('link', { name: /Get free scan/i })
    ).toHaveAttribute(
      'href',
      'https://monitor.mozilla.org/?utm_source=moz-account&utm_medium=referral&utm_term=settings&utm_content=get-free-scan-global&utm_campaign=settings-promo'
    );
  });

  it('shows generic promo for Monitor‑free users when not special‑eligible', () => {
    const account = {
      attachedClients: [{ name: MozServices.Monitor }],
      subscriptions: [],
    } as unknown as Account;

    renderWithLocalizationProvider(
      <AppContext.Provider value={mockAppContext({ account })}>
        <ProductPromo type="settings" />
      </AppContext.Provider>
    );

    screen.getByText(
      'Find where your private info is exposed and take control'
    );
  });

  it('shows special promo for eligible Monitor‑free users', () => {
    const account = {
      attachedClients: [{ name: MozServices.Monitor }],
      subscriptions: [],
    } as unknown as Account;

    renderWithLocalizationProvider(
      <AppContext.Provider value={mockAppContext({ account })}>
        <ProductPromo type="settings" specialPromoEligible />
      </AppContext.Provider>
    );

    screen.getByText(/save on VPN, Monitor’s data-broker protection/i);
    expect(
      screen.getByRole('link', { name: /Get year-round protection/i })
    ).toHaveAttribute(
      'href',
      'https://monitor.mozilla.org/subscription-plans?utm_source=moz-account&utm_medium=referral&utm_term=settings&utm_content=get-year-round-protection-us&utm_campaign=settings-promo'
    );
  });

  it('emits telemetry when CTA clicked (special)', async () => {
    const account = {
      attachedClients: [{ name: MozServices.Monitor }],
      subscriptions: [],
    } as unknown as Account;

    renderWithLocalizationProvider(
      <AppContext.Provider value={mockAppContext({ account })}>
        <ProductPromo type="settings" specialPromoEligible />
      </AppContext.Provider>
    );

    fireEvent.click(
      screen.getByRole('link', { name: /Get year-round protection/i })
    );
    await waitFor(() => {
      expect(GleanMetrics.accountPref.promoMonitorSubmit).toBeCalledWith({
        event: { reason: 'special' },
      });
    });
  });
});

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import ProductPromo from '.';
import { Account, AppContext } from '../../../models';
import { MozServices } from '../../../lib/types';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { mockAppContext } from '../../../models/mocks';
import GleanMetrics from '../../../lib/glean';
import userEvent from '@testing-library/user-event';

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

  it('can hide the promo', async () => {
    renderWithLocalizationProvider(
      <ProductPromo type="settings" monitorPromo={{ hidePromo: true }} />
    );

    // nothing should render
    await waitFor(() =>
      expect(screen.queryByAltText('Mozilla Monitor')).toBeNull()
    );
  });

  it('can show generic promo', async () => {
    renderWithLocalizationProvider(
      <ProductPromo
        type="settings"
        monitorPromo={{ hidePromo: false, showMonitorPlusPromo: false }}
      />
    );

    await waitFor(() =>
      expect(
        screen.getByText(
          'Find where your private info is exposed and take control'
        )
      ).toBeVisible()
    );
    expect(
      screen.getByRole('link', { name: /Get free scan/i })
    ).toHaveAttribute(
      'href',
      'https://monitor.mozilla.org/?utm_source=moz-account&utm_medium=referral&utm_term=settings&utm_content=get-free-scan-global&utm_campaign=settings-promo'
    );
  });

  it('can show special promo', async () => {
    renderWithLocalizationProvider(
      <ProductPromo
        type="settings"
        monitorPromo={{ hidePromo: false, showMonitorPlusPromo: true }}
      />
    );

    await waitFor(() =>
      expect(
        screen.getByText(/save on VPN, Monitor’s data-broker protection/i)
      ).toBeVisible()
    );
    expect(
      screen.getByRole('link', { name: /Get year-round protection/i })
    ).toHaveAttribute(
      'href',
      'https://monitor.mozilla.org/subscription-plans?utm_source=moz-account&utm_medium=referral&utm_term=settings&utm_content=get-year-round-protection-us&utm_campaign=settings-promo'
    );
  });

  it('emits telemetry when CTA clicked (default)', async () => {
    const user = userEvent.setup();
    renderWithLocalizationProvider(
      <ProductPromo
        type="settings"
        monitorPromo={{
          hidePromo: false,
          showMonitorPlusPromo: false,
          gleanEvent: { event: { reason: 'default' } },
        }}
      />
    );

    await waitFor(() =>
      expect(
        screen.getByText(
          'Find where your private info is exposed and take control'
        )
      ).toBeVisible()
    );
    await user.click(
      screen.getByRole('link', {
        name: /Get free scan/i,
      })
    );
    await waitFor(() => {
      expect(GleanMetrics.accountPref.promoMonitorSubmit).toHaveBeenCalledWith({
        event: { reason: 'default' },
      });
    });
  });

  it('emits telemetry when CTA clicked (special)', async () => {
    const user = userEvent.setup();
    const account = {
      attachedClients: [{ name: MozServices.Monitor }],
      subscriptions: [],
      getMonitorPlusPromoEligibility: () => Promise.resolve({ eligible: true }),
    } as unknown as Account;

    renderWithLocalizationProvider(
      <AppContext.Provider value={mockAppContext({ account })}>
        <ProductPromo
          type="settings"
          monitorPromo={{
            hidePromo: false,
            showMonitorPlusPromo: true,
            gleanEvent: { event: { reason: 'special' } },
          }}
        />
      </AppContext.Provider>
    );

    await waitFor(() =>
      expect(
        screen.getByText(/save on VPN, Monitor’s data-broker protection/i)
      ).toBeVisible()
    );
    await user.click(
      screen.getByRole('link', {
        name: /Get year-round protection/i,
      })
    );
    await waitFor(() => {
      expect(GleanMetrics.accountPref.promoMonitorSubmit).toHaveBeenCalledWith({
        event: { reason: 'special' },
      });
    });
  });
});

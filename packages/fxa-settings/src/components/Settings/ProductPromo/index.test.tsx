/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import ProductPromo, { getProductPromoData } from '.';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import GleanMetrics from '../../../lib/glean';
import userEvent from '@testing-library/user-event';
import { MozServices } from '../../../lib/types';
import { AttachedClient } from '../../../models';

jest.mock('../../../lib/glean', () => ({
  __esModule: true,
  default: {
    accountPref: {
      promoVpnView: jest.fn(),
      promoVpnSubmit: jest.fn(),
    },
  },
}));

describe('ProductPromo', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('can hide the promo', async () => {
    renderWithLocalizationProvider(
      <ProductPromo type="settings" vpnPromo={{ hidePromo: true }} />
    );

    // nothing should render
    await waitFor(() =>
      expect(screen.queryByAltText('Mozilla VPN')).toBeNull()
    );
  });

  it('can show promo', async () => {
    renderWithLocalizationProvider(
      <ProductPromo type="settings" vpnPromo={{ hidePromo: false }} />
    );

    await waitFor(() =>
      expect(
        screen.getByText(
          'Discover an added layer of anonymous browsing and protection.'
        )
      ).toBeVisible()
    );
    expect(screen.getByRole('link', { name: /Get VPN/i })).toHaveAttribute(
      'href',
      'https://vpn.mozilla.org/?utm_source=moz-account&utm_medium=mozilla-websites&utm_term=settings&utm_content=vpn&utm_campaign=settings-promo'
    );
  });

  it('emits telemetry when CTA clicked', async () => {
    const user = userEvent.setup();
    renderWithLocalizationProvider(
      <ProductPromo
        type="settings"
        vpnPromo={{
          hidePromo: false,
        }}
      />
    );

    await waitFor(() =>
      expect(
        screen.getByText(
          'Discover an added layer of anonymous browsing and protection.'
        )
      ).toBeVisible()
    );
    await user.click(
      screen.getByRole('link', {
        name: /Get VPN/i,
      })
    );
    await waitFor(() => {
      expect(GleanMetrics.accountPref.promoVpnSubmit).toHaveBeenCalledWith();
    });
  });

  describe('getProductPromoData', () => {
    it('hides promo when VPN is present', () => {
      const result = getProductPromoData([
        { name: MozServices.MozillaVPN },
      ] as AttachedClient[]);
      expect(result).toEqual({ hidePromo: true });
    });

    it('hides promo when VPN Stage is present', () => {
      const result = getProductPromoData([
        { name: MozServices.VPNStage },
      ] as AttachedClient[]);
      expect(result).toEqual({ hidePromo: true });
    });

    it('shows promo when VPN not present', () => {
      const result = getProductPromoData([
        { name: MozServices.Default },
      ] as AttachedClient[]);
      expect(result.hidePromo).toBe(false);
    });

    it('shows promo when there are no attached clients', () => {
      const result = getProductPromoData([] as AttachedClient[]);
      expect(result.hidePromo).toBe(false);
    });
  });
});

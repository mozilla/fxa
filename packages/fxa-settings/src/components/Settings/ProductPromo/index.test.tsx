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

  it('can show promo', async () => {
    renderWithLocalizationProvider(
      <ProductPromo type="settings" monitorPromo={{ hidePromo: false }} />
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

  it('emits telemetry when CTA clicked', async () => {
    const user = userEvent.setup();
    renderWithLocalizationProvider(
      <ProductPromo
        type="settings"
        monitorPromo={{
          hidePromo: false,
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

  describe('getProductPromoData', () => {
    it('hides promo when Monitor is present', () => {
      const result = getProductPromoData([
        { name: MozServices.Monitor },
      ] as AttachedClient[]);
      expect(result).toEqual({ hidePromo: true });
    });

    it('hides promo when Monitor Stage is present', () => {
      const result = getProductPromoData([
        { name: MozServices.MonitorStage },
      ] as AttachedClient[]);
      expect(result).toEqual({ hidePromo: true });
    });

    it('shows promo and provides gleanEvent when Monitor not present', () => {
      const result = getProductPromoData([
        { name: MozServices.Default },
      ] as AttachedClient[]);
      expect(result.hidePromo).toBe(false);
      expect(result.gleanEvent).toEqual({ event: { reason: 'default' } });
    });

    it('shows promo with gleanEvent when there are no attached clients', () => {
      const result = getProductPromoData([] as AttachedClient[]);
      expect(result.hidePromo).toBe(false);
      expect(result.gleanEvent).toEqual({ event: { reason: 'default' } });
    });
  });
});

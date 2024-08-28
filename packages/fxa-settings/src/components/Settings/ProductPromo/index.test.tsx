/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import ProductPromo from '.';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import GleanMetrics from '../../../lib/glean';

jest.mock('../../../lib/glean', () => ({
  __esModule: true,
  default: {
    accountPref: {
      promoMonitorSubmit: jest.fn(),
    },
  },
}));

describe('ProductPromo', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders Monitor free promo as expected', async () => {
    renderWithLocalizationProvider(<ProductPromo />);

    screen.getByAltText('Mozilla Monitor');
    screen.getByText(
      'Find where your private info is exposed — and take it back'
    );
    expect(screen.getByRole('link', { name: /Get free scan/ })).toHaveAttribute(
      'href',
      'https://monitor.mozilla.org/?utm_source=moz-account&utm_medium=product-partnership&utm_term=sidebar&utm_content=monitor-free&utm_campaign=settings-promo'
    );
  });

  it('renders Monitor Plus promo as expected', async () => {
    renderWithLocalizationProvider(
      <ProductPromo showMonitorPlusPromo={true} />
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
    renderWithLocalizationProvider(
      <ProductPromo gleanEvent={{ event: { reason: 'free' } }} />
    );

    fireEvent.click(screen.getByRole('link', { name: /Get free scan/ }));
    await waitFor(() => {
      expect(GleanMetrics.accountPref.promoMonitorSubmit).toBeCalledWith({
        event: { reason: 'free' },
      });
    });
  });
});

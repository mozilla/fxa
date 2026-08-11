/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen } from '@testing-library/react';
import { FluentBundle } from '@fluent/bundle';
import { getFtlBundle, testL10n } from 'fxa-react/lib/test-utils';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { LINK } from '../../../../constants';
import DownloadFirefox from '.';

describe('Pair2/Authority/DownloadFirefox page', () => {
  // Guards against drift between the fallback text in the component and the
  // actual Fluent bundle.
  it.skip('renders every message with text matching the Fluent bundle', async () => {
    const bundle: FluentBundle = await getFtlBundle('settings');
    renderWithLocalizationProvider(<DownloadFirefox />);

    const messages = screen
      .getAllByTestId('ftlmsg-mock')
      // The jest SVG stub renders the file name as the element's text, so image
      // messages can never match. Covered by components/images/index.test.tsx.
      .filter((el) => !el.textContent?.endsWith('.svg'));

    expect(messages.length).toBeGreaterThan(0);
    messages.forEach((el) => testL10n(el, bundle));
  });

  it('renders the heading and instruction', () => {
    renderWithLocalizationProvider(<DownloadFirefox />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Open Firefox to sync'
    );
    screen.getByText(
      `To set up syncing across devices, open Firefox on this device and visit`
    );
  });

  it('exposes the illustration to assistive technology', () => {
    renderWithLocalizationProvider(<DownloadFirefox />);

    expect(
      screen
        .getAllByRole('img')
        .map((img) => img.getAttribute('alt') ?? img.getAttribute('aria-label'))
    ).toEqual([
      // AppLayout's page header, then the single image this card renders.
      // Desktop cards carry no in-card Firefox lockup.
      'Mozilla logo',
      'A desktop browser window and a mobile phone, both syncing, with the Firefox mascot alongside them',
    ]);
  });

  it('points the download CTA at the Firefox desktop download page', () => {
    renderWithLocalizationProvider(<DownloadFirefox />);

    // `LinkExternal` appends its own "Opens in new window" screen-reader text,
    // so that is part of the link's accessible name.
    expect(
      screen.getByRole('link', {
        name: 'Download Firefox Opens in new window',
      })
    ).toHaveAttribute('href', LINK.FX_DESKTOP);
  });
});

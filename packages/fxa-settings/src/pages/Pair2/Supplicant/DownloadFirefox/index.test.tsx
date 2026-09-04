/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen } from '@testing-library/react';
import { FluentBundle } from '@fluent/bundle';
import { getFtlBundle, testL10n } from 'fxa-react/lib/test-utils';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { LINK } from '../../../../constants';
import { Constants } from '../../../../lib/constants';
import DownloadFirefox from '.';

// The subcopy embeds the "Learn more" link with a Fluent DOM overlay, so the
// Fluent message carries `<linkExternal>` tags that never reach the DOM.
const SUBCOPY_FTL_ID = 'pair2-supplicant-download-firefox-description';

const stripOverlayTags = (message: string) =>
  message.replace(/<\/?[a-zA-Z]+>/g, '');

// The subcopy is not addressable by text — the inline link splits it across
// nodes — so it is reached through the mocked FtlMsg that wraps it.
const getSubcopy = () =>
  screen.getAllByTestId('ftlmsg-mock').find((el) => el.id === SUBCOPY_FTL_ID);

describe('Pair2/Supplicant/DownloadFirefox page', () => {
  let bundle: FluentBundle;
  beforeAll(async () => {
    bundle = await getFtlBundle('settings');
  });

  // Guards against drift between the fallback text in the component and the
  // actual Fluent bundle.
  it('renders every message with text matching the Fluent bundle', () => {
    renderWithLocalizationProvider(<DownloadFirefox />);

    const messages = screen
      .getAllByTestId('ftlmsg-mock')
      // The jest SVG stub renders the file name as the element's text, so image
      // messages can never match. Covered by components/images/index.test.tsx.
      .filter((el) => !el.textContent?.endsWith('.svg'))
      // `testL10n` compares rendered text against the raw Fluent message, which
      // an overlay message can never satisfy. Covered by the test below.
      .filter((el) => el.id !== SUBCOPY_FTL_ID);

    expect(messages.length).toBeGreaterThan(0);
    messages.forEach((el) => testL10n(el, bundle));
  });

  it('renders the subcopy fallback matching the Fluent overlay message', () => {
    renderWithLocalizationProvider(<DownloadFirefox />);

    const message = bundle.getMessage(SUBCOPY_FTL_ID);
    const formatted = bundle.formatPattern(message!.value!);

    // The link has to be a placeable inside the sentence, not a hand-split
    // fragment, or translators cannot move it.
    expect(formatted).toContain('<linkExternal>Learn more</linkExternal>');
    expect(getSubcopy()).toHaveTextContent(stripOverlayTags(formatted));
  });

  it('renders the heading and subcopy', () => {
    renderWithLocalizationProvider(<DownloadFirefox />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Get Firefox on this device'
    );
    expect(getSubcopy()).toHaveTextContent(
      'Download Firefox to sync bookmarks, history, and more across devices. Learn more'
    );
  });

  it('exposes the brand lockup and illustration to assistive technology', () => {
    renderWithLocalizationProvider(<DownloadFirefox />);

    expect(
      screen
        .getAllByRole('img')
        .map((img) => img.getAttribute('alt') ?? img.getAttribute('aria-label'))
    ).toEqual([
      // AppLayout's page header, then the two images this card renders.
      'Mozilla logo',
      'Firefox logo',
      "A desktop browser window and a mobile phone, both syncing, with the Firefox mascot alongside them",
    ]);
  });

  it('points the primary action at the mobile Firefox download page', () => {
    renderWithLocalizationProvider(<DownloadFirefox />);

    expect(
      screen.getByRole('link', { name: /Continue in Firefox/ })
    ).toHaveAttribute('href', Constants.FIREFOX_MOBILE_DOWNLOAD_URL);
  });

  it('points the inline Learn more link at the sync explainer', () => {
    renderWithLocalizationProvider(<DownloadFirefox />);

    expect(screen.getByRole('link', { name: /Learn more/ })).toHaveAttribute(
      'href',
      LINK.FX_SYNC
    );
  });

  it('renders the card on a white page background', () => {
    renderWithLocalizationProvider(<DownloadFirefox />);

    // Below `mobileLandscape` the card is transparent, so the page colour is
    // the colour the phone shows. The designs call for white, not the default
    // grey the desktop cards sit on.
    expect(screen.getByTestId('app')).toHaveClass('bg-white');
  });
});

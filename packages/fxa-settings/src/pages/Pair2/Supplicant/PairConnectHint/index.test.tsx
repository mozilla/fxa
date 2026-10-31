/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen } from '@testing-library/react';
import { MemoryRouter, InitialEntry } from 'react-router';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import PairConnectHint from '.';

const FIREFOX_IOS_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/124.0 Mobile/15E148 Safari/605.1.15';
const FIREFOX_ANDROID_UA =
  'Mozilla/5.0 (Android 14; Mobile; rv:124.0) Gecko/124.0 Firefox/124.0';
const CHROME_DESKTOP_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const renderPage = (
  props: React.ComponentProps<typeof PairConnectHint> = {},
  entry: InitialEntry = '/pair/supplicant/connect_hint'
) =>
  renderWithLocalizationProvider(
    <MemoryRouter initialEntries={[entry]}>
      <PairConnectHint {...props} />
    </MemoryRouter>
  );

describe('Pair2/Supplicant/PairConnectHint page', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  // The jest SVG stub renders the file name as the element's text.
  it.each([
    ['Firefox iOS', FIREFOX_IOS_UA, 'graphic_pair_menu_ios.min.svg'],
    [
      'Firefox Android',
      FIREFOX_ANDROID_UA,
      'graphic_pair_menu_android.min.svg',
    ],
    ['a desktop browser', CHROME_DESKTOP_UA, 'graphic_pair_menu_ios.min.svg'],
  ])('shows the menu illustration for %s', (_, ua, file) => {
    jest.spyOn(navigator, 'userAgent', 'get').mockReturnValue(ua);
    renderPage();

    expect(screen.getByTestId('aria-hidden-image')).toHaveTextContent(file);
  });

  it('shows the tab variant, with no step to close the page', () => {
    renderPage({ os: 'ios' });

    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.queryByText('Close this page')).not.toBeInTheDocument();
  });

  it.each([
    ['query param', '/pair/supplicant/connect_hint?embed=customtab'],
    [
      'location state',
      {
        pathname: '/pair/supplicant/connect_hint',
        state: { embed: 'customtab' },
      },
    ],
  ])('shows the webview variant for embed=customtab in the %s', (_, entry) => {
    renderPage({ os: 'ios' }, entry);

    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getAllByRole('listitem')[0]).toHaveTextContent(
      'Close this page'
    );
  });

  it('keeps the glean id on the Learn more link', () => {
    renderPage({ os: 'ios' });

    expect(screen.getByRole('link', { name: /Learn more/ })).toHaveAttribute(
      'data-glean-id',
      'dtm_mobile_connect_hint_learn_more'
    );
  });

  it('renders no buttons, because the next step happens in the Firefox app', () => {
    renderPage({ os: 'ios' });

    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('exposes the brand lockups', () => {
    renderPage({ os: 'ios' });

    expect(
      screen
        .getAllByRole('img')
        .map((img) => img.getAttribute('alt') ?? img.getAttribute('aria-label'))
    ).toEqual(['Mozilla logo', 'Firefox logo']);
  });

  it('renders the page on a white background', () => {
    renderPage({ os: 'ios' });

    expect(screen.getByTestId('app')).toHaveClass('bg-white');
  });
});

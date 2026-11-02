/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { InitialEntry, MemoryRouter } from 'react-router';
import PairConnectHint from '.';

const FIREFOX_IOS_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/124.0 Mobile/15E148 Safari/605.1.15';
const FIREFOX_ANDROID_UA =
  'Mozilla/5.0 (Android 14; Mobile; rv:124.0) Gecko/124.0 Firefox/124.0';
const CHROME_DESKTOP_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const render = (ui: React.ReactElement, entry: InitialEntry = '/') =>
  renderWithLocalizationProvider(
    <MemoryRouter initialEntries={[entry]}>{ui}</MemoryRouter>
  );

describe('Pair2/Supplicant/PairConnectHint page', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  // The jest SVG stub renders the file name as the element's text.
  it('shows the iOS menu illustration for Firefox iOS', () => {
    jest.spyOn(navigator, 'userAgent', 'get').mockReturnValue(FIREFOX_IOS_UA);
    render(<PairConnectHint />);

    expect(screen.getByTestId('aria-hidden-image')).toHaveTextContent(
      'graphic_pair_menu_ios.min.svg'
    );
  });

  it('shows the Android menu illustration for Firefox Android', () => {
    jest
      .spyOn(navigator, 'userAgent', 'get')
      .mockReturnValue(FIREFOX_ANDROID_UA);
    render(<PairConnectHint />);

    expect(screen.getByTestId('aria-hidden-image')).toHaveTextContent(
      'graphic_pair_menu_android.min.svg'
    );
  });

  it('shows the iOS menu illustration for a desktop browser', () => {
    jest
      .spyOn(navigator, 'userAgent', 'get')
      .mockReturnValue(CHROME_DESKTOP_UA);
    render(<PairConnectHint />);

    expect(screen.getByTestId('aria-hidden-image')).toHaveTextContent(
      'graphic_pair_menu_ios.min.svg'
    );
  });

  it('shows the tab variant, with no step to close the page', () => {
    render(<PairConnectHint os="ios" />);

    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('shows the webview variant when the query param has embed=customtab', () => {
    render(<PairConnectHint os="ios" />, '/?embed=customtab');

    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByText('Close this page')).toBeInTheDocument();
  });

  it('shows the webview variant when the location state has embed=customtab', () => {
    render(<PairConnectHint os="ios" />, {
      pathname: '/',
      state: { embed: 'customtab' },
    });

    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByText('Close this page')).toBeInTheDocument();
  });

  it('shows the tab variant when the query param embed is not customtab', () => {
    render(<PairConnectHint os="ios" />, '/?embed=other');

    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.queryByText('Close this page')).not.toBeInTheDocument();
  });

  it('shows the tab variant when the location state embed is not customtab', () => {
    render(<PairConnectHint os="ios" />, {
      pathname: '/',
      state: { embed: 'other' },
    });

    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.queryByText('Close this page')).not.toBeInTheDocument();
  });

  it('keeps the glean id on the Learn more link', () => {
    render(<PairConnectHint os="ios" />);

    expect(screen.getByRole('link', { name: /Learn more/ })).toHaveAttribute(
      'data-glean-id',
      'dtm_mobile_connect_hint_learn_more'
    );
  });

  it('renders no buttons, because the next step happens in the Firefox app', () => {
    render(<PairConnectHint os="ios" />);

    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('exposes the brand lockups', () => {
    render(<PairConnectHint os="ios" />);

    expect(
      screen
        .getAllByRole('img')
        .map((img) => img.getAttribute('alt') ?? img.getAttribute('aria-label'))
    ).toEqual(['Mozilla logo', 'Firefox logo']);
  });

  it('renders the page on a white background', () => {
    render(<PairConnectHint os="ios" />);

    expect(screen.getByTestId('app')).toHaveClass('bg-white');
  });
});

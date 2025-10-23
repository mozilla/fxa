/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider'; // import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';
import PairUnsupported, { viewName } from '.';
import { REACT_ENTRYPOINT } from '../../../constants';
import { usePageViewEvent } from '../../../lib/metrics';
import { MOCK_ERROR } from './mock';

jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
}));

describe('PairUnsupported', () => {
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });

  it('renders the default view as expected', () => {
    renderWithLocalizationProvider(<PairUnsupported />);
    // testAllL10n(screen, bundle);

    const headingEl = screen.getByRole('heading', { level: 1 });
    expect(headingEl).toHaveTextContent('Pair using an app');
    expect(
      screen.getByText(
        'Did you use the system camera? You must pair from within a Firefox app.'
      )
    ).toBeInTheDocument();
  });

  it('renders errors as expected', () => {
    renderWithLocalizationProvider(<PairUnsupported error={MOCK_ERROR} />);
    // testAllL10n(screen, bundle);

    const headingEl = screen.getByRole('heading', { level: 1 });
    expect(headingEl).toHaveTextContent('Pair using an app');
    expect(screen.getByText(MOCK_ERROR)).toBeInTheDocument();
    expect(
      screen.getByText(
        'Did you use the system camera? You must pair from within a Firefox app.'
      )
    ).toBeInTheDocument();
  });

  it('emits expected metrics event on render', () => {
    renderWithLocalizationProvider(<PairUnsupported />);
    expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
  });
});

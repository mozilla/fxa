import { MemoryRouter } from 'react-router-dom';
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider'; // import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';
import { usePageViewEvent } from '../../../lib/metrics';
import { MOCK_ERROR } from './mock';
import { REACT_ENTRYPOINT } from '../../../constants';

import PairFailure, { viewName } from '.';

jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
}));

describe('PairFailure', () => {
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });

  it('renders the default view as expected', () => {
    renderWithLocalizationProvider(<MemoryRouter><PairFailure /></MemoryRouter>);
    // testAllL10n(screen, bundle);

    const headingEl = screen.getByRole('heading', { level: 1 });
    expect(headingEl).toHaveTextContent('Device pairing failed');
    expect(
      screen.getByText(
        'The setup couldn’t be completed. Please sign in with your email.'
      )
    ).toBeInTheDocument();
    const tryAgainLink = screen.getByRole('link', { name: /Try again/i });
    expect(tryAgainLink).toHaveAttribute('href', '/pair');
  });

  it('renders errors as expected', () => {
    renderWithLocalizationProvider(<MemoryRouter><PairFailure error={MOCK_ERROR} /></MemoryRouter>);
    // testAllL10n(screen, bundle);

    const headingEl = screen.getByRole('heading', { level: 1 });
    expect(headingEl).toHaveTextContent('Device pairing failed');
    expect(screen.getByText(MOCK_ERROR)).toBeInTheDocument();
    expect(
      screen.getByText(
        'The setup couldn’t be completed. Please sign in with your email.'
      )
    ).toBeInTheDocument();
  });

  it('emits expected metrics event on render', () => {
    renderWithLocalizationProvider(<MemoryRouter><PairFailure /></MemoryRouter>);
    expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
  });
});

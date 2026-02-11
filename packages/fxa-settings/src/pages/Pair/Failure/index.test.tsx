/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
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
    renderWithLocalizationProvider(<PairFailure />);
    // testAllL10n(screen, bundle);

    const headingEl = screen.getByRole('heading', { level: 1 });
    expect(headingEl).toHaveTextContent('Pairing not successful');
    expect(
      screen.getByText('The setup process was terminated.')
    ).toBeInTheDocument();
  });

  it('renders errors as expected', () => {
    renderWithLocalizationProvider(<PairFailure error={MOCK_ERROR} />);
    // testAllL10n(screen, bundle);

    const headingEl = screen.getByRole('heading', { level: 1 });
    expect(headingEl).toHaveTextContent('Pairing not successful');
    expect(screen.getByText(MOCK_ERROR)).toBeInTheDocument();
    expect(
      screen.getByText('The setup process was terminated.')
    ).toBeInTheDocument();
  });

  it('emits expected metrics event on render', () => {
    renderWithLocalizationProvider(<PairFailure />);
    expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
  });
});

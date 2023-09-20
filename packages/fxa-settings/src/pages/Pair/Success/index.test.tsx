/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider'; // import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';
import { usePageViewEvent } from '../../../lib/metrics';
import { REACT_ENTRYPOINT } from '../../../constants';
import { MOCK_ERROR } from './mocks';
import PairSuccess, { viewName } from '.';

jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
}));

describe('PairSuccess', () => {
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });

  it('renders the default view as expected', () => {
    renderWithLocalizationProvider(<PairSuccess />);
    // testAllL10n(screen, bundle);

    const headingEl = screen.getByRole('heading', { level: 1 });
    expect(headingEl).toHaveTextContent('Device connected');
    expect(screen.getByText('Pairing was successful.')).toBeInTheDocument();
  });

  it('renders any arising errors', () => {
    renderWithLocalizationProvider(<PairSuccess error={MOCK_ERROR} />);
    // testAllL10n(screen, bundle);

    const headingEl = screen.getByRole('heading', { level: 1 });
    expect(headingEl).toHaveTextContent('Device connected');
    expect(screen.getByText('Pairing was successful.')).toBeInTheDocument();
    expect(screen.getByText(MOCK_ERROR)).toBeInTheDocument();
  });

  it('emits expected metrics event on render', () => {
    renderWithLocalizationProvider(<PairSuccess />);
    expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
  });
});

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithRouter } from '../../../models/mocks';
// import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';
import { usePageViewEvent } from '../../../lib/metrics';
import { REACT_ENTRYPOINT, ENTRYPOINTS } from '../../../constants';
import { MOCK_ERROR } from './mocks';
import Pair, { viewName } from '.';

jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
}));

describe('Pair', () => {
  // let bundle: FluentBundle;
  let mockCallback: Function;
  //   beforeAll(async () => {
  //      bundle = await getFtlBundle('settings');
  //   });
  beforeEach(() => {
    mockCallback = jest.fn();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the default view as expected, with no entrypoint submitted', () => {
    renderWithRouter(<Pair onSubmit={mockCallback} />);
    // testAllL10n(screen, bundle);

    const headingEl = screen.getByRole('heading', { level: 1 });
    expect(headingEl).toHaveTextContent('Sync Firefox on your phone or tablet');
    expect(
      screen.getByRole('img', {
        name: 'A computer and a mobile phone and a tablet with a pulsing heart on each',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Get started' })
    ).toBeInTheDocument();
  });

  it('renders the page with a QR code with a valid entrypoint submitted', () => {
    renderWithRouter(
      <Pair
        entryPoint={ENTRYPOINTS.FIREFOX_FX_VIEW_ENTRYPOINT}
        onSubmit={mockCallback}
      />
    );
    // testAllL10n(screen, bundle);

    const headingEl = screen.getByRole('heading', { level: 1 });
    expect(headingEl).toHaveTextContent('Connect Firefox on another device');
    expect(
      screen.getByText('Already have Firefox on a phone or tablet?')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Sync your device' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Or download' })
    ).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'QR code' })).toBeInTheDocument();
  });

  it('accepts a broker-specific onSubmit action', () => {
    renderWithRouter(
      <Pair
        entryPoint={ENTRYPOINTS.FIREFOX_FX_VIEW_ENTRYPOINT}
        onSubmit={mockCallback}
      />
    );
    // testAllL10n(screen, bundle);
    const submitButton = screen.getByRole('button', {
      name: 'Sync your device',
    });
    fireEvent.click(submitButton);
    expect(mockCallback).toHaveBeenCalled();
  });

  it('renders any arising errors', () => {
    renderWithRouter(<Pair error={MOCK_ERROR} onSubmit={mockCallback} />);
    // testAllL10n(screen, bundle);

    const headingEl = screen.getByRole('heading', { level: 1 });
    expect(headingEl).toHaveTextContent('Sync Firefox on your phone or tablet');
    expect(screen.getByText(MOCK_ERROR)).toBeInTheDocument();
  });

  it('emits expected metrics event on render', () => {
    renderWithRouter(<Pair onSubmit={mockCallback} />);
    expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
  });
});

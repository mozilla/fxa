/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { MOCK_METRICS_FLOW, Subject } from './mocks';
import { useViewEvent } from '../../lib/metrics';

jest.mock('../../lib/metrics', () => ({
  useViewEvent: jest.fn(),
}));

const getDownloadUrl = () =>
  new URL(
    screen
      .getByRole('link', { name: 'Download latest' })
      .getAttribute('href') ?? '',
    'http://localhost'
  );

describe('UpdateFirefox', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders as expected', () => {
    renderWithLocalizationProvider(<Subject />);
    expect(
      screen.getByRole('heading', { name: 'Firefox update required' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Your Mozilla account makes use of features that are not supported in your version of Firefox. Please download and install the latest version of Firefox to continue.'
      )
    ).toBeInTheDocument();
  });

  it('logs flow.begin and the update-firefox view on mount', () => {
    renderWithLocalizationProvider(<Subject />);
    expect(useViewEvent).toHaveBeenCalledTimes(2);
    expect(useViewEvent).toHaveBeenCalledWith('flow', 'begin');
    expect(useViewEvent).toHaveBeenCalledWith('flow.update-firefox', 'view');
  });

  it('links to /download_firefox with the allowed params and flow data', () => {
    renderWithLocalizationProvider(
      <Subject search="?context=fx_desktop_v1&utm_source=foo&showReactApp=true&client_id=123" />
    );
    const url = getDownloadUrl();
    expect(url.pathname).toBe('/download_firefox');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      context: 'fx_desktop_v1',
      utm_source: 'foo',
      deviceId: MOCK_METRICS_FLOW.deviceId,
      flowBeginTime: String(MOCK_METRICS_FLOW.flowBeginTime),
      flowId: MOCK_METRICS_FLOW.flowId,
    });
  });

  it('keeps a raw + in forwarded values', () => {
    renderWithLocalizationProvider(
      <Subject search="?context=fx_desktop_v1&utm_source=foo+bar" />
    );
    expect(getDownloadUrl().searchParams.get('utm_source')).toBe('foo+bar');
  });

  it.each([
    ['no metrics flow exists', { metricsFlow: null }],
    [
      'the metrics flow has no deviceId',
      { metricsFlow: { ...MOCK_METRICS_FLOW, deviceId: undefined } },
    ],
    ['context is missing', { search: '?service=sync' }],
  ])('links directly to the Firefox download when %s', (_, props) => {
    renderWithLocalizationProvider(<Subject {...props} />);
    expect(getDownloadUrl().href).toBe(
      'https://www.mozilla.org/firefox/download/thanks/'
    );
  });
});

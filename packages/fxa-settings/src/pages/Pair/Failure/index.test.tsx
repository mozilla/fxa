/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen } from '@testing-library/react';
import GleanMetrics from '../../../lib/glean';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider'; // import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';
import { usePageViewEvent } from '../../../lib/metrics';
import { MOCK_ERROR } from './mock';
import { REACT_ENTRYPOINT } from '../../../constants';

import PairFailure, { viewName } from '.';

jest.mock('../../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
}));

let mockLocationState: unknown = null;
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useLocation: () => ({ state: mockLocationState }),
}));

jest.mock('../../../lib/glean', () => ({
  __esModule: true,
  default: { pairing: { passwordLockFailure: jest.fn() } },
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
    expect(headingEl).toHaveTextContent('Device pairing failed');
    expect(
      screen.getByText(
        'The setup couldn’t be completed. Please sign in with your email.'
      )
    ).toBeInTheDocument();
  });

  it('renders errors as expected', () => {
    renderWithLocalizationProvider(<PairFailure error={MOCK_ERROR} />);
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
    renderWithLocalizationProvider(<PairFailure />);
    expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
  });

  describe('pairing.password_lock_failure', () => {
    afterEach(() => {
      mockLocationState = null;
      jest.clearAllMocks();
    });

    it('records once when a locked Primary Password caused the failure', () => {
      mockLocationState = { primaryPasswordLocked: true };
      renderWithLocalizationProvider(<PairFailure />);
      expect(GleanMetrics.pairing.passwordLockFailure).toHaveBeenCalledTimes(1);
    });

    it.each([null, {}, { primaryPasswordLocked: false }])(
      'does not record for route state %p',
      (state) => {
        mockLocationState = state;
        renderWithLocalizationProvider(<PairFailure />);
        expect(GleanMetrics.pairing.passwordLockFailure).not.toHaveBeenCalled();
      }
    );
  });
});

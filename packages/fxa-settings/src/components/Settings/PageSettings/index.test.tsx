/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import PageSettings from '.';
import { renderWithRouter } from '../../../models/mocks';
import * as Metrics from '../../../lib/metrics';
import GleanMetrics from '../../../lib/glean';

jest.mock('../../../lib/metrics', () => ({
  setProperties: jest.fn(),
  usePageViewEvent: jest.fn(),
}));

jest.mock('../../../lib/glean', () => ({
  __esModule: true,
  default: {
    accountPref: {
      view: jest.fn(),
      promoMonitorView: jest.fn(),
    },
    deleteAccount: {
      settingsSubmit: jest.fn(),
    },
  },
}));

beforeEach(() => {
  const mockIntersectionObserver = jest.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    disconnect: () => null,
  });
  window.IntersectionObserver = mockIntersectionObserver;
});

describe('PageSettings', () => {
  it('renders without imploding', async () => {
    renderWithRouter(<PageSettings />);
    expect(screen.getByTestId('settings-profile')).toBeInTheDocument();
    expect(screen.getByTestId('settings-security')).toBeInTheDocument();
    expect(
      screen.getByTestId('settings-connected-services')
    ).toBeInTheDocument();
    expect(screen.getByTestId('settings-delete-account')).toBeInTheDocument();
    expect(
      screen.queryByTestId('settings-data-collection')
    ).toBeInTheDocument();
    expect(Metrics.setProperties).toHaveBeenCalledWith({
      lang: null,
      uid: 'abc123',
    });
  });

  describe('glean metrics', () => {
    it('emits the expected event on render', async () => {
      renderWithRouter(<PageSettings />);
      expect(GleanMetrics.accountPref.view).toHaveBeenCalled();
    });

    it('emits the expected event on click of Delete account button', async () => {
      renderWithRouter(<PageSettings />);
      await userEvent.click(
        screen.getByRole('link', { name: 'Delete account' })
      );
      expect(GleanMetrics.deleteAccount.settingsSubmit).toHaveBeenCalled();
    });
  });
});

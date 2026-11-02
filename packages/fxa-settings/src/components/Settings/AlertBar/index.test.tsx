/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import AlertBar from '.';
import GleanMetrics from '../../../lib/glean';

jest.mock('../../../lib/reactive-var', () => ({
  ...jest.requireActual('../../../lib/reactive-var'),
  useReactiveVar: (x: Function) => x(),
}));

let mockGleanId: string | undefined;
jest.mock('../../../models', () => ({
  alertVisible: () => true,
  alertContent: () => 'message',
  alertType: () => 'info',
  alertGleanId: () => mockGleanId,
}));

jest.mock('../../../lib/glean', () => ({
  __esModule: true,
  default: { alertBar: { view: jest.fn() } },
}));

beforeEach(() => {
  mockGleanId = undefined;
  jest.clearAllMocks();
});

describe('AlertBar', () => {
  it('renders as expected', () => {
    renderWithLocalizationProvider(<AlertBar />);
    expect(screen.getByTestId('alert-bar-root')).toContainElement(
      screen.getByTestId('alert-bar')
    );
    expect(screen.getByRole('alert')).toHaveTextContent('message');
    expect(screen.queryByTestId('alert-bar')).toHaveAttribute('role', 'alert');
    expect(screen.getByRole('button')).toHaveAttribute(
      'title',
      'Close message'
    );
  });

  it('shifts focus to the tab fence when rendered', () => {
    renderWithLocalizationProvider(<AlertBar />);
    expect(document.activeElement).toBe(
      screen.getByTestId('alert-bar-tab-fence')
    );
  });

  it('records a view once and tags the close button when a gleanId is set', () => {
    mockGleanId = 'account_pref_passkey_unsupported';
    renderWithLocalizationProvider(<AlertBar />);
    expect(GleanMetrics.alertBar.view).toHaveBeenCalledTimes(1);
    expect(GleanMetrics.alertBar.view).toHaveBeenCalledWith({
      event: { reason: 'account_pref_passkey_unsupported' },
    });
    expect(screen.getByRole('button')).toHaveAttribute(
      'data-glean-id',
      'account_pref_passkey_unsupported_close'
    );
  });

  it('records no view and leaves the close button untagged without a gleanId', () => {
    renderWithLocalizationProvider(<AlertBar />);
    expect(GleanMetrics.alertBar.view).not.toHaveBeenCalled();
    expect(screen.getByRole('button')).not.toHaveAttribute('data-glean-id');
  });

  it('still renders when the view call throws', () => {
    mockGleanId = 'account_pref_passkey_unsupported';
    (GleanMetrics.alertBar.view as jest.Mock).mockImplementationOnce(() => {
      throw new Error('glean failed');
    });
    renderWithLocalizationProvider(<AlertBar />);
    expect(screen.getByRole('alert')).toHaveTextContent('message');
  });
});

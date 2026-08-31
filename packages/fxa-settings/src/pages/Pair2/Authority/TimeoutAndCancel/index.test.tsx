/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FluentBundle } from '@fluent/bundle';
import { getFtlBundle, testL10n } from 'fxa-react/lib/test-utils';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { TimeoutAndCancelReason } from '.';
import { Subject } from './mocks';
import GleanMetrics from '../../../../lib/glean';

jest.mock('../../../../lib/glean', () => ({
  __esModule: true,
  default: {
    dtmDesktop: {
      timeoutView: jest.fn(),
    },
  },
}));

const REASONS: TimeoutAndCancelReason[] = ['timeout', 'canceled'];

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Pair2/Authority/TimeoutAndCancel page', () => {
  // Guards against drift between the fallback text in the component and the
  // actual Fluent bundle. Runs per reason because each one renders a different
  // set of ids.
  it.each(REASONS)(
    'renders every message with text matching the Fluent bundle (%s)',
    async (reason) => {
      const bundle: FluentBundle = await getFtlBundle('settings');
      renderWithLocalizationProvider(<Subject {...{ reason }} />);

      const messages = screen
        .getAllByTestId('ftlmsg-mock')
        // The jest SVG stub renders the file name as the element's text, so
        // image messages can never match. Covered by
        // components/images/index.test.tsx.
        .filter((el) => !el.textContent?.endsWith('.svg'));

      expect(messages.length).toBeGreaterThan(0);
      messages.forEach((el) => testL10n(el, bundle));
    }
  );

  it.each(REASONS)(
    'exposes the illustration to assistive technology (%s)',
    (reason) => {
      renderWithLocalizationProvider(<Subject {...{ reason }} />);

      expect(
        screen
          .getAllByRole('img')
          .map(
            (img) => img.getAttribute('alt') ?? img.getAttribute('aria-label')
          )
      ).toEqual([
        // AppLayout's page header, then the single image this card renders.
        // Desktop cards have no Firefox lockup.
        'Mozilla logo',
      ]);
    }
  );

  describe('timeout', () => {
    it('renders the heading, description, and actions', () => {
      renderWithLocalizationProvider(<Subject reason="timeout" />);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'Still want to connect a device?'
      );
      screen.getByText(
        'Looks like we timed out. Try again if you still want to connect your mobile device and sync your Firefox data.'
      );
      screen.getByRole('button', { name: 'Try again' });
      screen.getByRole('button', { name: 'Cancel' });
      expect(
        screen.queryByRole('button', { name: 'Sync settings' })
      ).not.toBeInTheDocument();
    });

    it('calls onCancel from the secondary action', async () => {
      const user = userEvent.setup();
      const onCancel = jest.fn();
      const onSyncSettings = jest.fn();
      renderWithLocalizationProvider(
        <Subject reason="timeout" {...{ onCancel, onSyncSettings }} />
      );

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(onSyncSettings).not.toHaveBeenCalled();
    });
  });

  describe('canceled', () => {
    it('renders the heading, description, and actions', () => {
      renderWithLocalizationProvider(<Subject reason="canceled" />);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'Canceled'
      );
      screen.getByText(
        'If you change your mind or want to connect a different device, try again.'
      );
      screen.getByRole('button', { name: 'Try again' });
      screen.getByRole('button', { name: 'Sync settings' });
      expect(
        screen.queryByRole('button', { name: 'Cancel' })
      ).not.toBeInTheDocument();
    });

    it('calls onSyncSettings from the secondary action', async () => {
      const user = userEvent.setup();
      const onCancel = jest.fn();
      const onSyncSettings = jest.fn();
      renderWithLocalizationProvider(
        <Subject reason="canceled" {...{ onCancel, onSyncSettings }} />
      );

      await user.click(screen.getByRole('button', { name: 'Sync settings' }));

      expect(onSyncSettings).toHaveBeenCalledTimes(1);
      expect(onCancel).not.toHaveBeenCalled();
    });
  });

  it.each(REASONS)(
    'calls onTryAgain from the primary action (%s)',
    async (reason) => {
      const user = userEvent.setup();
      const onTryAgain = jest.fn();
      renderWithLocalizationProvider(<Subject {...{ reason, onTryAgain }} />);

      await user.click(screen.getByRole('button', { name: 'Try again' }));

      expect(onTryAgain).toHaveBeenCalledTimes(1);
    }
  );

  // The automatic view event cannot tell the two states apart — they share a
  // route — so the reason has to come from the component.
  it.each(REASONS)('emits a view event carrying the reason (%s)', (reason) => {
    renderWithLocalizationProvider(<Subject {...{ reason }} />);

    expect(GleanMetrics.dtmDesktop.timeoutView).toHaveBeenCalledWith({
      event: { reason },
    });
  });
});

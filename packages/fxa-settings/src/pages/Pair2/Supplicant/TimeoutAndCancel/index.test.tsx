/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen } from '@testing-library/react';
import { FluentBundle } from '@fluent/bundle';
import { getFtlBundle, testL10n } from 'fxa-react/lib/test-utils';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { PairingInterruptionReason } from '.';
import { Subject } from './mocks';
import GleanMetrics from '../../../../lib/glean';

jest.mock('../../../../lib/glean', () => ({
  __esModule: true,
  default: {
    dtmMobile: {
      timeoutView: jest.fn(),
    },
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

const VARIANTS: Array<{
  reason: PairingInterruptionReason;
  heading: string;
  descriptionFtlId: string;
  description: string;
}> = [
  {
    reason: 'timeout',
    heading: 'Looks like we timed out',
    descriptionFtlId: 'pair2-supplicant-timeout-and-cancel-timeout-description',
    description:
      'To connect your mobile device and sync your Firefox data, visit firefox.com/pair on your computer.',
  },
  {
    reason: 'canceled',
    heading: 'Canceled',
    descriptionFtlId:
      'pair2-supplicant-timeout-and-cancel-canceled-description',
    description:
      'To connect a device anytime, visit firefox.com/pair on your computer.',
  },
];

const getDescription = (ftlId: string) =>
  screen.getAllByTestId('ftlmsg-mock').find((el) => el.id === ftlId)!;

describe('Pair2/Supplicant/TimeoutAndCancel page', () => {
  describe.each(VARIANTS)(
    '$reason',
    ({ reason, heading, descriptionFtlId, description }) => {
      // Guards against drift between the fallback text in the component and the
      // actual Fluent bundle, including a rename of either variant's ids.
      it('renders every message with text matching the Fluent bundle', async () => {
        const bundle: FluentBundle = await getFtlBundle('settings');
        renderWithLocalizationProvider(<Subject {...{ reason }} />);

        const messages = screen
          .getAllByTestId('ftlmsg-mock')
          // The jest SVG stub renders the file name as the element's text, so
          // image messages can never match. Covered by
          // components/images/index.test.tsx.
          .filter((el) => !el.textContent?.endsWith('.svg'))
          // `testL10n` compares rendered text against the raw Fluent source, so
          // the description's DOM overlay tag can never match it. It is checked
          // tag-stripped below instead.
          .filter((el) => el.id !== descriptionFtlId);

        expect(messages.length).toBeGreaterThan(0);
        messages.forEach((el) => testL10n(el, bundle));
      });

      it('keeps the description fallback text in step with the Fluent message', async () => {
        const bundle: FluentBundle = await getFtlBundle('settings');
        renderWithLocalizationProvider(<Subject {...{ reason }} />);

        const message = bundle.getMessage(descriptionFtlId);
        const source = bundle.formatPattern(message!.value!);

        expect(getDescription(descriptionFtlId).textContent).toEqual(
          source.replace(/<\/?b>/g, '')
        );
      });

      it('renders the heading and description for this state', () => {
        renderWithLocalizationProvider(<Subject {...{ reason }} />);

        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
          heading
        );
        expect(getDescription(descriptionFtlId)).toHaveTextContent(description);
      });

      // The URL is a placeable inside the sentence, not a fragment glued on, so
      // the emphasis has to come from an element the message can wrap.
      it('emphasises the pairing URL with an element rather than literal tags', () => {
        renderWithLocalizationProvider(<Subject {...{ reason }} />);

        expect(screen.getByText('firefox.com/pair').tagName).toEqual('B');
      });

      it('exposes the brand lockup and illustration to assistive technology', () => {
        renderWithLocalizationProvider(<Subject {...{ reason }} />);

        expect(
          screen
            .getAllByRole('img')
            .map(
              (img) => img.getAttribute('alt') ?? img.getAttribute('aria-label')
            )
        ).toEqual([
          // AppLayout's page header, then the two images this card renders.
          'Mozilla logo',
          'Firefox logo',
        ]);
      });

      // Both states are dead ends by design — the user restarts from their
      // computer. Fail loudly if an unwired action is ever added here.
      it('renders no action', () => {
        renderWithLocalizationProvider(<Subject {...{ reason }} />);

        expect(screen.queryByRole('button')).not.toBeInTheDocument();
        // AppLayout's Mozilla logo is the only link on the page.
        expect(screen.getAllByRole('link')).toHaveLength(1);
      });
    }
  );

  it('shows different copy for each state', () => {
    const { unmount } = renderWithLocalizationProvider(
      <Subject reason="timeout" />
    );
    const timedOutHeading = screen.getByRole('heading', {
      level: 1,
    }).textContent;
    unmount();

    renderWithLocalizationProvider(<Subject reason="canceled" />);

    expect(screen.getByRole('heading', { level: 1 }).textContent).not.toEqual(
      timedOutHeading
    );
  });

  // The automatic view event cannot tell the two states apart — they share a
  // route — so the reason has to come from the component.
  it.each(['timeout', 'canceled'] as PairingInterruptionReason[])(
    'emits a view event carrying the reason (%s)',
    (reason) => {
      renderWithLocalizationProvider(<Subject {...{ reason }} />);

      expect(GleanMetrics.dtmMobile.timeoutView).toHaveBeenCalledWith({
        event: { reason },
      });
    }
  );
});

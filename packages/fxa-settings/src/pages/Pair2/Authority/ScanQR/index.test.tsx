/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen } from '@testing-library/react';
import { FluentBundle } from '@fluent/bundle';
import { getFtlBundle, testL10n } from 'fxa-react/lib/test-utils';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { MOCK_QR_CODE_VALUE, Subject } from './mocks';
import { Constants } from '../../../../lib/constants';

// Stub QRCode so the test can read the encoded value without decoding an SVG;
// the real rendering is covered in its own test. The stub keeps the accessible
// name so the assistive-technology assertion below still means something.
jest.mock('../../../../components/QRCode', () => ({
  __esModule: true,
  default: ({
    value,
    localizedLabel,
    loading,
  }: {
    value: string;
    localizedLabel: string;
    loading?: boolean;
  }) => (
    <img
      alt={localizedLabel}
      data-testid="scan-qr-code"
      data-value={value}
      data-loading={String(!!loading)}
    />
  ),
}));

const QR_CODE_LABEL_FTL_ID = 'pair2-authority-scan-qr-code-aria-label';
const LOCALIZED_QR_CODE_LABEL = 'QR code to connect your mobile device';

describe('Pair2/Authority/ScanQR page', () => {
  // Guards against drift between the fallback text in the component and the
  // actual Fluent bundle.
  it('renders every message with text matching the Fluent bundle', async () => {
    const bundle: FluentBundle = await getFtlBundle('settings');
    renderWithLocalizationProvider(<Subject />);

    const messages = screen
      .getAllByTestId('ftlmsg-mock')
      // The jest SVG stub renders the file name as the element's text, so image
      // messages can never match. Covered by components/images/index.test.tsx.
      .filter((el) => !el.textContent?.endsWith('.svg'));

    expect(messages.length).toBeGreaterThan(0);
    messages.forEach((el) => testL10n(el, bundle));
  });

  // The QR code label is resolved with `getMsg` rather than `FtlMsg`, because
  // `QRCode` takes a plain string. `testL10n` cannot see it, so it is checked
  // against the bundle directly.
  it('has the QR code label in the Fluent bundle, matching the fallback', async () => {
    const bundle: FluentBundle = await getFtlBundle('settings');

    const message = bundle.getMessage(QR_CODE_LABEL_FTL_ID);

    expect(message).toBeDefined();
    expect(bundle.formatPattern(message!.value!)).toEqual(
      LOCALIZED_QR_CODE_LABEL
    );
  });

  it('renders the heading and instruction', () => {
    renderWithLocalizationProvider(<Subject />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Scan to connect your mobile device'
    );
    screen.getByText(
      'Scan the QR code with your phone or tablet to sync your Firefox bookmarks, tabs, and more.'
    );
  });

  it('exposes the illustration and the QR code to assistive technology', () => {
    renderWithLocalizationProvider(<Subject />);

    expect(
      screen
        .getAllByRole('img')
        .map((img) => img.getAttribute('alt') ?? img.getAttribute('aria-label'))
    ).toEqual([
      // AppLayout's page header, then the artwork and the QR composited into
      // it. Desktop cards have no Firefox lockup.
      "Mozilla logo",
      LOCALIZED_QR_CODE_LABEL,
    ]);
  });

  it('passes the supplied value through to the QR code', () => {
    renderWithLocalizationProvider(<Subject />);

    expect(screen.getByTestId('scan-qr-code')).toHaveAttribute(
      'data-value',
      MOCK_QR_CODE_VALUE
    );
    expect(screen.getByTestId('scan-qr-code')).toHaveAttribute(
      'data-loading',
      'false'
    );
  });

  // Until the channel exists there is nothing to encode, and a QR built from an
  // empty string would scan to the bare origin.
  it('marks the QR as loading while there is no value to encode', () => {
    renderWithLocalizationProvider(<Subject qrCodeValue="" />);

    expect(screen.getByTestId('scan-qr-code')).toHaveAttribute(
      'data-loading',
      'true'
    );
  });

  it('links out to the scanning support article', () => {
    renderWithLocalizationProvider(<Subject />);

    const link = screen.getByRole('link', { name: /Get help scanning/ });
    expect(link).toHaveAttribute(
      'href',
      Constants.SYNC_SUMO_URL
    );
    expect(link).toHaveAttribute('target', '_blank');
  });
});

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { act, screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import QRCode from './index';

const VALUE = 'https://app.adjust.com/2uo1qc?campaign=send-tab';
const LABEL = 'QR code to download Firefox for mobile';
const IMAGE_DATA =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

describe('QRCode', () => {
  it('renders an accessible image labelled by localizedLabel', () => {
    renderWithLocalizationProvider(
      <QRCode value={VALUE} localizedLabel={LABEL} />
    );
    expect(screen.getByRole('img', { name: LABEL })).toBeInTheDocument();
  });

  it('renders a pre-rendered QR image when imageData is provided', () => {
    renderWithLocalizationProvider(
      <QRCode imageData={IMAGE_DATA} localizedLabel={LABEL} />
    );
    expect(screen.getByRole('img', { name: LABEL })).toHaveAttribute(
      'src',
      IMAGE_DATA
    );
  });

  it('does not generate an SVG QR code when imageData is provided', () => {
    const { container } = renderWithLocalizationProvider(
      <QRCode imageData={IMAGE_DATA} localizedLabel={LABEL} />
    );
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });

  it('forwards the provided className to the container', () => {
    const { container } = renderWithLocalizationProvider(
      <QRCode value={VALUE} localizedLabel={LABEL} className="my-10 mx-auto" />
    );
    expect(container.firstChild).toHaveClass('my-10', 'mx-auto');
  });

  it('overlays the logo when logoSrc is provided', () => {
    const { container } = renderWithLocalizationProvider(
      <QRCode value={VALUE} localizedLabel={LABEL} logoSrc="logo.svg" />
    );
    expect(container.querySelector('img')).toHaveAttribute('src', 'logo.svg');
  });

  it('renders no logo when logoSrc is omitted', () => {
    const { container } = renderWithLocalizationProvider(
      <QRCode value={VALUE} localizedLabel={LABEL} />
    );
    expect(container.querySelector('img')).not.toBeInTheDocument();
  });

  it('shows the loading indicator while loading', () => {
    renderWithLocalizationProvider(
      <QRCode value={VALUE} localizedLabel={LABEL} loading />
    );
    expect(screen.getByTestId('qrcode-loading')).toBeInTheDocument();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('does not show the loading indicator when not loading', () => {
    renderWithLocalizationProvider(
      <QRCode value={VALUE} localizedLabel={LABEL} />
    );
    expect(screen.queryByTestId('qrcode-loading')).not.toBeInTheDocument();
  });

  it('shows the loading indicator for loadingDelayMs, then reveals the QR', () => {
    jest.useFakeTimers();
    try {
      renderWithLocalizationProvider(
        <QRCode value={VALUE} localizedLabel={LABEL} loadingDelayMs={1000} />
      );
      expect(screen.getByTestId('qrcode-loading')).toBeInTheDocument();
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      expect(screen.queryByTestId('qrcode-loading')).not.toBeInTheDocument();
    } finally {
      jest.useRealTimers();
    }
  });
});

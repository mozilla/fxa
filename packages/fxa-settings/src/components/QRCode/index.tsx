/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { QRCodeSVG } from 'qrcode.react';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';

// Transparent 1x1 PNG; excavates modules behind the logo so its chip never clips them.
const TRANSPARENT_PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

/** Logo footprint as a fraction of the QR size. */
const LOGO_RATIO = 0.2;
/** White padding (px) around the logo, matching the chip's Tailwind `p-3`. */
const LOGO_PADDING_PX = 12;

type QRCodeBaseProps = {
  /** Accessible label for the rendered QR image. */
  localizedLabel: string;
  /** Rendered size in pixels. */
  size?: number;
  /** Error correction level; defaults to 'H' so an overlaid logo stays scannable. */
  level?: 'L' | 'M' | 'Q' | 'H';
  /** Optional logo to overlay in the center of the QR code (generated QR only). */
  logoSrc?: string;
  /** Minimum QR version (1-40); higher means more, smaller modules. Defaults to 1 for larger modules. */
  minVersion?: number;
  /** Show a loading indicator in place of the QR (e.g. while the value is fetched). */
  loading?: boolean;
  /** Artificial delay (ms) holding the loading state so the animation registers. Omit for none. */
  loadingDelayMs?: number;
  className?: string;
};

/**
 * Exactly one source is required: either a `value` to encode, or a pre-rendered
 * QR as an image data URI (`imageData`, e.g. base64 PNG/SVG) rendered as-is.
 */
export type QRCodeProps = QRCodeBaseProps &
  ({ value: string; imageData?: never } | { imageData: string; value?: never });

/**
 * Domain-agnostic QR code. While loading, a centered spinner replaces the QR,
 * which fades in once loading ends.
 */
const QRCode = ({
  value,
  imageData,
  localizedLabel,
  size = 224,
  level = 'H',
  logoSrc,
  minVersion = 1,
  loading = false,
  loadingDelayMs,
  className,
}: QRCodeProps) => {
  const [delaying, setDelaying] = useState(!!loadingDelayMs);
  useEffect(() => {
    if (!loadingDelayMs) {
      setDelaying(false);
      return;
    }
    setDelaying(true);
    const timer = setTimeout(() => setDelaying(false), loadingDelayMs);
    return () => clearTimeout(timer);
  }, [loadingDelayMs]);

  const isLoading = loading || delaying;
  const logoSize = Math.round(size * LOGO_RATIO);
  const excavateSize = logoSize + LOGO_PADDING_PX * 2;
  const imageSettings = logoSrc
    ? {
        src: TRANSPARENT_PIXEL,
        width: excavateSize,
        height: excavateSize,
        excavate: true,
      }
    : undefined;
  return (
    <div
      className={classNames(
        'relative w-fit rounded-xl bg-white p-4',
        !isLoading && 'border border-black',
        className
      )}
    >
      {isLoading && (
        <div
          className="absolute inset-0 flex items-center justify-center rounded-xl bg-white"
          data-testid="qrcode-loading"
        >
          <LoadingSpinner imageClassName="w-10 h-10 animate-spin" />
        </div>
      )}
      <div
        className={classNames(
          'relative transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
      >
        {imageData ? (
          <img
            src={imageData}
            alt={localizedLabel}
            width={size}
            height={size}
            className="block"
          />
        ) : (
          <QRCodeSVG
            value={value ?? ''}
            size={size}
            level={level}
            minVersion={minVersion}
            imageSettings={imageSettings}
            role="img"
            aria-label={localizedLabel}
            className="block"
          />
        )}
        {logoSrc && !imageData && (
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-3">
            <img
              src={logoSrc}
              alt=""
              className="block"
              style={{ width: logoSize, height: logoSize }}
            />
          </span>
        )}
      </div>
    </div>
  );
};

export default QRCode;

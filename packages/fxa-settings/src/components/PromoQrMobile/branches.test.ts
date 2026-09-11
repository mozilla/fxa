/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { allowedQrOrigins, controlQr, resolvePromo } from './branches';

const APP_ORIGIN = 'http://localhost';
const CDN_ORIGIN = 'https://accounts-cdn.example.com';
const ORIGINS = [APP_ORIGIN, CDN_ORIGIN];

describe('allowedQrOrigins', () => {
  it('allows the app origin and the CDN origin', () => {
    expect(allowedQrOrigins(`${CDN_ORIGIN}/settings/stage/static`)).toEqual([
      APP_ORIGIN,
      CDN_ORIGIN,
    ]);
  });

  it('allows only the app origin when the CDN base is unset', () => {
    expect(allowedQrOrigins(undefined)).toEqual([APP_ORIGIN]);
  });

  it('allows only the app origin when the CDN base does not parse', () => {
    expect(allowedQrOrigins('not-a-url')).toEqual([APP_ORIGIN]);
  });
});

describe('resolvePromo', () => {
  it('returns the control QR and no slug when not enrolled', () => {
    expect(
      resolvePromo({ branch: 'treatment-a', heading: 'Hi' }, false, ORIGINS)
    ).toEqual({ qr: controlQr });
  });

  it('returns the control QR and no slug when there is no feature', () => {
    expect(resolvePromo(undefined, true, ORIGINS)).toEqual({ qr: controlQr });
  });

  it('reports the control slug when an enrolled arm names no branch', () => {
    expect(resolvePromo({ enabled: true }, true, ORIGINS).slug).toBe('control');
  });

  it('passes through the copy the arm supplies', () => {
    expect(
      resolvePromo(
        {
          enabled: true,
          branch: 'treatment-c',
          heading: 'The browser you trust, on your phone',
          description: 'Point your camera here',
        },
        true,
        ORIGINS
      )
    ).toEqual({
      slug: 'treatment-c',
      heading: 'The browser you trust, on your phone',
      description: 'Point your camera here',
      qr: controlQr,
    });
  });

  it.each([
    ['a same-origin path', '/settings/static/qr/a.svg'],
    ['an app-origin url', `${APP_ORIGIN}/static/qr/a.svg`],
    ['a CDN url', `${CDN_ORIGIN}/settings/stage/static/qr/a.svg`],
  ])('accepts %s as the QR', (_label, qrUrl) => {
    expect(resolvePromo({ enabled: true, qrUrl }, true, ORIGINS).qr).toBe(
      qrUrl
    );
  });

  it.each([
    ['a javascript url', 'javascript:alert(1)'],
    ['a data url', 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4='],
    ['a foreign https host', 'https://evil.example.net/qr.svg'],
    ['a protocol-relative url', '//evil.example.net/qr.svg'],
    ['plain http on an allowed host', `http://accounts-cdn.example.com/a.svg`],
    ['a value that is not a url', 'not-a-url'],
  ])('falls back to the control QR for %s', (_label, qrUrl) => {
    expect(resolvePromo({ enabled: true, qrUrl }, true, ORIGINS).qr).toBe(
      controlQr
    );
  });
});

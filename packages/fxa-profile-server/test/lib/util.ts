/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export function assertSecurityHeaders(res: any): void {
  const expected: Record<string, string> = {
    'strict-transport-security': 'max-age=31536000; includeSubDomains',
    'x-content-type-options': 'nosniff',
    'x-xss-protection': '1; mode=block',
    'x-frame-options': 'DENY',
    'cache-control': 'private, no-cache, no-store, must-revalidate',
  };

  for (const [header, value] of Object.entries(expected)) {
    expect(res.headers[header]).toBe(value);
  }
}

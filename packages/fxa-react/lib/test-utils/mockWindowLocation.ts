/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export function mockWindowLocation({
  pathname = '/',
  search = '',
  hash = '',
}: {
  pathname?: string;
  search?: string;
  hash?: string;
}) {
  delete (window as any).location;

  (window as any).location = {
    ...window.location,
    assign: jest.fn(),
    reload: jest.fn(),
    replace: jest.fn(),
    pathname,
    search,
    hash,
    href: `http://localhost${pathname}${search}${hash}`,
  };
}

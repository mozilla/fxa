/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { UrlQueryData } from './url-query-data';

describe('url-search-data', () => {
  it('creates', () => {
    const data = new UrlQueryData(window);
    expect(data).toBeDefined();
  });

  it('sets and gets', () => {
    const data = new UrlQueryData(window);
    data.set('foo', 'bar');
    expect(data.get('foo')).toEqual('bar');
  });

  it('does not require sync', () => {
    const data = new UrlQueryData(window);
    expect(data.requiresSync()).toBeFalsy();
  });
});

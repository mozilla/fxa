/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { NavigateFn, WindowLocation } from '@reach/router';
import { ReachRouterWindow } from '../../window';
import { UrlQueryData } from './url-query-data';

describe('url-search-data', () => {
  // Fake ReachRouterWindow. The default implementation will timeout when
  // callling await window.navigate(url).
  // This mock is crafted specifically for url-search-data tests, and is not a
  // full implementation!
  class MockReachRouterWindow extends ReachRouterWindow {
    private _location = new URL('http://localhost');
    public get navigate(): NavigateFn {
      return async (url) => {
        if (typeof url === 'string') {
          this._location = new URL(url);
        }
      };
    }
    public get location() {
      return this._location as unknown as WindowLocation<any>;
    }
  }
  const window = new MockReachRouterWindow();

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

  it('gets query params', async () => {
    const data = new UrlQueryData(window);
    data.set('foo', 'bar');

    const search = await data.toSearchQuery();
    expect(search).toContain('foo=bar');
    expect(window.location.href).toContain('foo=bar');
  });

  it('encodes parameters', async () => {
    const data = new UrlQueryData(window);
    data.set('foo', 'bar+bar');

    const search = await data.toSearchQuery();
    expect(search).toContain('foo=bar%2Bbar');
  });

  it('prevents un-encoded parameters', async () => {
    const temp = window.location.search;
    window.location.search = 'foo=bar+bar';
    expect(() => new UrlQueryData(window, true)).toThrow();
    window.location.search = temp;
  });
});

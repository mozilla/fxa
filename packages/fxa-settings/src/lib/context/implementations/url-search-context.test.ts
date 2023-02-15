/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { UrlSearchContext } from './url-search-context';

describe('url-search-context', () => {
  it('creates', () => {
    const context = new UrlSearchContext(window);
    expect(context).toBeDefined();
  });

  it('sets and gets', () => {
    const context = new UrlSearchContext(window);
    context.set('foo', 'bar');
    expect(context.get('foo')).toEqual('bar');
  });

  it('does not require sync', () => {
    const context = new UrlSearchContext(window);
    expect(context.requiresSync()).toBeFalsy();
  });
});

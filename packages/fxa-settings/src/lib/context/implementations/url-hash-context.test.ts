/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { UrlHashContext } from './url-hash-context';

describe('urls-hash-context', () => {
  it('creates', () => {
    const context = new UrlHashContext(window);
    expect(context).toBeDefined();
  });

  it('sets and gets', () => {
    const context = new UrlHashContext(window);
    context.set('foo', 'bar');
    expect(context.get('foo')).toEqual('bar');
  });

  it('does not require sync', () => {
    const context = new UrlHashContext(window);
    expect(context.requiresSync()).toBeFalsy();
  });
});

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ReachRouterWindow } from '../../window';
import { UrlHashData } from './url-hash-data';

describe('url-hash-data', () => {
  const window = new ReachRouterWindow();

  it('creates', () => {
    const data = new UrlHashData(window);
    expect(data).toBeDefined();
  });

  it('sets and gets', () => {
    const data = new UrlHashData(window);
    data.set('foo', 'bar');
    expect(data.get('foo')).toEqual('bar');
  });

  it('does not require sync', () => {
    const data = new UrlHashData(window);
    expect(data.requiresSync()).toBeFalsy();
  });
});

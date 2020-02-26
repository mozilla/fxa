/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

window.console.log = jest.fn();
import './index';

describe('index.tsx', () => {
  describe('init', () => {
    it('log an error on reject', async () => {
      expect((window.console.log as jest.Mock).mock.calls[0][0]).toBe(
        'init error'
      );
    });
  });
});

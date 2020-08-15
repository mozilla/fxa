/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { copy } from './clipboard';

const copyable = 'B-47zyCix7g';
let originalClipboard: Clipboard;

function redefineClipboard(value: any) {
  Object.defineProperty(window.navigator, 'clipboard', {
    value,
    writable: true,
  });
}

describe('copy', () => {
  beforeEach(() => {
    originalClipboard = window.navigator.clipboard;
  });

  afterEach(() => {
    redefineClipboard(originalClipboard);
  });

  describe('using navigator.clipboard when its available', () => {
    beforeEach(() => {
      redefineClipboard({ writeText: jest.fn() });
    });

    it('copies to the clipboard', async () => {
      await copy(copyable);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(copyable);
    });
  });

  describe('using document.execCommand as a fallback', () => {
    beforeEach(() => {
      // Make sure this is unavailable
      redefineClipboard(undefined);

      document.execCommand = jest.fn();
    });

    it('copies to the clipboard', async () => {
      await copy(copyable);
      expect(document.execCommand).toHaveBeenCalledWith('copy');
    });
  });
});

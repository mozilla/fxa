/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { downloadTextFile } from './download';

const MOCK_OBJECT_URL = 'blob:http://localhost/mock-object-url';
const MOCK_CONTENT = 'some file contents';
const MOCK_FILENAME = 'some-file.txt';

// Not fake timers: the blob assertion below reads through the fetch polyfill,
// which they deadlock.
const flushMacrotask = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('downloadTextFile', () => {
  let createObjectURL: jest.MockedFunction<typeof URL.createObjectURL>;
  let revokeObjectURL: jest.MockedFunction<typeof URL.revokeObjectURL>;
  let click: jest.SpyInstance;

  beforeEach(() => {
    // setupTests installs these as jest.fn(); spyOn would hand back the same
    // mock rather than wrapping it, so adopt and clear them instead.
    createObjectURL = jest.mocked(window.URL.createObjectURL);
    revokeObjectURL = jest.mocked(window.URL.revokeObjectURL);
    createObjectURL.mockClear().mockReturnValue(MOCK_OBJECT_URL);
    revokeObjectURL.mockClear();
    click = jest
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});
  });

  afterEach(async () => {
    // Drain the deferred revoke so it cannot fire during a later test
    await flushMacrotask();
    jest.restoreAllMocks();
  });

  /** Captures the anchor as it is clicked, since the helper then removes it. */
  const captureClickedAnchor = () => {
    const captured: { anchor?: HTMLAnchorElement; wasAttached?: boolean } = {};
    click.mockImplementation(function (this: HTMLAnchorElement) {
      captured.anchor = this;
      captured.wasAttached = document.body.contains(this);
    });
    return captured;
  };

  it('creates a text/plain blob holding the content', async () => {
    downloadTextFile(MOCK_CONTENT, MOCK_FILENAME);

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    const blob = createObjectURL.mock.calls[0][0] as Blob;
    expect(blob.type).toBe('text/plain');
    // jsdom's Blob has no `text()`; Response comes from the fetch polyfill
    expect(await new Response(blob).text()).toBe(MOCK_CONTENT);
  });

  it('downloads the blob under the given filename', () => {
    const captured = captureClickedAnchor();

    downloadTextFile(MOCK_CONTENT, MOCK_FILENAME);

    expect(click).toHaveBeenCalledTimes(1);
    expect(captured.anchor?.getAttribute('href')).toBe(MOCK_OBJECT_URL);
    expect(captured.anchor?.getAttribute('download')).toBe(MOCK_FILENAME);
  });

  // Firefox ignores click() on a detached anchor
  it('attaches the anchor to the document before clicking it', () => {
    const captured = captureClickedAnchor();

    downloadTextFile(MOCK_CONTENT, MOCK_FILENAME);

    expect(captured.wasAttached).toBe(true);
  });

  it('defers revoking the object URL past the click task', async () => {
    downloadTextFile(MOCK_CONTENT, MOCK_FILENAME);

    expect(revokeObjectURL).not.toHaveBeenCalled();

    await flushMacrotask();

    expect(revokeObjectURL).toHaveBeenCalledWith(MOCK_OBJECT_URL);
  });

  it('removes the anchor from the document', () => {
    downloadTextFile(MOCK_CONTENT, MOCK_FILENAME);

    expect(document.querySelector('a[download]')).toBeNull();
  });

  it('cleans up the anchor and object URL when the click throws', async () => {
    click.mockImplementation(() => {
      throw new Error('click failed');
    });

    expect(() => downloadTextFile(MOCK_CONTENT, MOCK_FILENAME)).toThrow(
      'click failed'
    );
    expect(document.querySelector('a[download]')).toBeNull();

    await flushMacrotask();

    expect(revokeObjectURL).toHaveBeenCalledWith(MOCK_OBJECT_URL);
  });
});

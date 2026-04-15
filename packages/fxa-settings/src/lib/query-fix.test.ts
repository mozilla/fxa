/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// query-fix.js is a plain JS script with no exports, so we test it by reading
// the file from disk and executing it with vm.runInNewContext inside a sandbox
// that provides fake window.location and a jest.fn() for history.replaceState.
// Each test builds a FakeLocation matching a specific URL scenario and asserts
// on what replaceState was (or wasn't) called with.

import { readFileSync } from 'fs';
import path from 'path';
import { runInNewContext } from 'vm';

type FakeLocation = {
  readonly href: string;
  readonly hash: string;
  readonly search: string;
};

function runQueryFix(location: FakeLocation) {
  const replaceState = jest.fn();
  const script = readFileSync(
    path.join(__dirname, '../../public/query-fix.js'),
    'utf8'
  );

  runInNewContext(script, {
    location,
    window: {
      location,
      history: {
        replaceState,
      },
    },
  });

  return replaceState;
}

describe('query-fix.js', () => {
  it('re-encodes query parameters without changing URLs that have no hash', () => {
    const replaceState = runQueryFix({
      href: 'https://accounts.example.com/pair/supp?scope=profile+sync',
      hash: '',
      search: '?scope=profile+sync',
    });

    expect(replaceState).toHaveBeenCalledWith({}, '', '?scope=profile%2Bsync');
  });

  it('preserves the pairing hash when query parameters are re-encoded', () => {
    const hash = '#channel_id=abc&channel_key=def';
    const replaceState = runQueryFix({
      href: `https://accounts.example.com/pair/supp?scope=profile+sync${hash}`,
      hash,
      search: '?scope=profile+sync',
    });

    expect(replaceState).toHaveBeenCalledWith(
      {},
      '',
      '?scope=profile%2Bsync#channel_id=abc&channel_key=def'
    );
  });

  it('preserves the original pairing hash if later location reads lose it', () => {
    const hash = '#channel_id=abc&channel_key=def';
    const hrefWithHash = `https://accounts.example.com/pair/supp?scope=profile+sync${hash}`;
    const hrefWithoutHash =
      'https://accounts.example.com/pair/supp?scope=profile+sync';
    let queryWasRead = false;

    const location = {
      get href() {
        return queryWasRead ? hrefWithoutHash : hrefWithHash;
      },
      get hash() {
        return queryWasRead ? '' : hash;
      },
      get search() {
        queryWasRead = true;
        return '?scope=profile+sync';
      },
    };

    const replaceState = runQueryFix(location);

    expect(replaceState).toHaveBeenCalledWith(
      {},
      '',
      '?scope=profile%2Bsync#channel_id=abc&channel_key=def'
    );
  });

  it('does not rewrite the URL when the query does not need re-encoding', () => {
    const hash = '#channel_id=abc&channel_key=def';
    const replaceState = runQueryFix({
      href: `https://accounts.example.com/pair/supp?scope=profile%2Bsync${hash}`,
      hash,
      search: '?scope=profile%2Bsync',
    });

    expect(replaceState).not.toHaveBeenCalled();
  });
});

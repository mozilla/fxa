/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assert } from 'chai';
import 'mocha';

import { extractRegionFromUrl } from '../../bin/worker';

describe('Worker', () => {
  it('extracts the region from the config', () => {
    const url = 'https://sqs.us-east-1.amazonaws.com/8284828319293/service-notifications';
    const region = extractRegionFromUrl(url);
    assert.equal(region, 'us-east-1');
  });

  it('extracts undefined for invalid url', () => {
    const url = 'http://example.com/example';
    const region = extractRegionFromUrl(url);
    assert.equal(region, undefined);
  });
});

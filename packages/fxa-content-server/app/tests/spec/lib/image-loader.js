/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// test the metrics library

import chai from 'chai';
import ImageLoader from 'lib/image-loader';

var assert = chai.assert;
var pngSrc =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVQYV2P4DwABAQEAWk1v8QAAAABJRU5ErkJggg==';

describe('lib/image-loader', function() {
  it('loads an image', function() {
    return ImageLoader.load(pngSrc).then(function(img) {
      assert.equal(img.src, pngSrc);
    });
  });

  it('fails to load an image', function() {
    return ImageLoader.load('bad image src').then(
      function() {
        assert.catch('unexpected success');
      },
      function() {
        // nothing to do here
        return true;
      }
    );
  });
});

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Serve the WAICT integrity manifest. The manifest maps served script URLs to
 * their SHA-256 hashes and is generated at build time (see the `waict-manifest`
 * grunt task) into the static directory. It is served with the
 * `application/waict-integrity-manifest` content-type the WAICT spec requires.
 */

'use strict';
const fs = require('fs');
const path = require('path');
const logger = require('../logging/log')();
const { staticDirectory } = require('../static-paths');

const MANIFEST_CONTENT_TYPE = 'application/waict-integrity-manifest';

module.exports = function (config) {
  const manifestFile = path.join(
    staticDirectory(config),
    'waict-manifest.json'
  );

  return {
    method: 'get',
    path: config.get('waict.manifestPath'),
    process: function (req, res) {
      fs.readFile(manifestFile, (err, body) => {
        if (err) {
          // The manifest is produced by the build; if it is missing the page
          // still works (report mode is non-blocking) so log and 404 rather
          // than erroring the request.
          logger.warn('waict.manifest.missing', { path: manifestFile });
          res.status(404).end();
          return;
        }

        res.type(MANIFEST_CONTENT_TYPE);
        res.send(body);
      });
    },
  };
};

module.exports.MANIFEST_CONTENT_TYPE = MANIFEST_CONTENT_TYPE;

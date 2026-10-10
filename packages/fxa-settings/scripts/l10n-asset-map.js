/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// The hashed l10n file map that gets embedded into index.html at build time.

const fs = require('fs');
const path = require('path');

const MANIFEST_PATH = path.join(
  __dirname,
  '../public/static/static-asset-manifest.json'
);

// main.ftl is the only bundle the client asks for, so the other ~590 entries
// are dead weight on every HTML response.
const MAIN_FTL = /^locales\/[^/]+\/main\.ftl$/;

function readL10nAssetMap() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.warn(
      `${MANIFEST_PATH} is missing, so index.html gets no l10n asset map. Run the build-static target first.`
    );
    return {};
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

  return Object.fromEntries(
    Object.entries(manifest).filter(([file]) => MAIN_FTL.test(file))
  );
}

// URI encoded like the fxa-config meta, so it is safe in an attribute.
function encodeL10nAssetMap() {
  const map = readL10nAssetMap();

  // An embedded empty map resolves every locale to no strings at all. Embed
  // nothing instead, so the client falls back to the unhashed paths.
  if (Object.keys(map).length === 0) {
    return '';
  }

  return encodeURIComponent(JSON.stringify(map));
}

module.exports = { encodeL10nAssetMap };

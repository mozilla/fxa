/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Mocha tries `import()` on each spec file before it falls back to `require()`.
// For a .ts file the import fails, but it first puts an unlinked chai record in the
// ESM registry. The later `require('chai')` then throws ERR_REQUIRE_ESM_RACE_CONDITION.
// This preload loads chai as an ES module, so the registry holds a complete record.
import 'chai';

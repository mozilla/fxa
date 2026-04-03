/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Storybook runs in the browser; nock is Node.js-only.
// Stories import test-utils.tsx which imports nock at the top level,
// so we stub it out here to prevent webpack from trying to bundle it.
module.exports = {};

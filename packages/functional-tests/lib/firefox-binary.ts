/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Resolves the desktop Firefox that pairing tests drive over Marionette.
 *
 * The v2 chrome commands ship in Nightly, so the v2 specs need it. Playwright
 * launches only its own build and never comes through here.
 */

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { firefox } from 'playwright';

/** Default install locations for Firefox Nightly, by platform. */
const NIGHTLY_PATHS: Record<string, string[]> = {
  darwin: [
    '/Applications/Firefox Nightly.app/Contents/MacOS/firefox',
    path.join(
      os.homedir(),
      'Applications/Firefox Nightly.app/Contents/MacOS/firefox'
    ),
  ],
  linux: [
    '/usr/bin/firefox-nightly',
    '/usr/local/bin/firefox-nightly',
    '/opt/firefox-nightly/firefox',
    path.join(os.homedir(), 'firefox-nightly/firefox'),
  ],
  win32: [
    'C:\\Program Files\\Firefox Nightly\\firefox.exe',
    'C:\\Program Files (x86)\\Firefox Nightly\\firefox.exe',
  ],
};

function findFirefoxNightly(): string | undefined {
  return (NIGHTLY_PATHS[process.platform] || []).find((p) => fs.existsSync(p));
}

/** A v2-capable Firefox, or undefined. FIREFOX_BINARY wins, so a local build works. */
export function findV2AuthorityBinary(): string | undefined {
  return process.env.FIREFOX_BINARY || findFirefoxNightly();
}

/** Binary for the `marionetteAuthority` fixture. The v1 specs run on either. */
export function resolveAuthorityBinary(): string {
  return findV2AuthorityBinary() || firefox.executablePath();
}

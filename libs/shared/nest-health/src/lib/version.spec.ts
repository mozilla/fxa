/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import fs from 'fs';
import os from 'os';
import path from 'path';

import { getVersionInfo } from './version';

describe('getVersionInfo', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nest-health-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('reads hash and source from a version.json above cwd', () => {
    fs.writeFileSync(
      path.join(tmpDir, 'version.json'),
      JSON.stringify({
        version: { hash: 'abc123', source: 'https://example.com/repo' },
      })
    );
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({ version: '1.2.3' })
    );
    const cwd = path.join(tmpDir, 'nested');
    fs.mkdirSync(cwd);

    expect(getVersionInfo(cwd)).toStrictEqual({
      commit: 'abc123',
      source: 'https://example.com/repo',
      version: '1.2.3',
    });
  });

  it('falls back without a throw when no version.json exists', () => {
    expect(getVersionInfo(tmpDir)).toStrictEqual({
      commit: 'unknown',
      source: 'unknown',
      version: undefined,
    });
  });
});

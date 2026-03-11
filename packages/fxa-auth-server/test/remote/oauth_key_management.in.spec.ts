export {};

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const crypto = require('crypto');
const rimraf = require('rimraf');

describe('the signing-key management scripts', () => {
  let runScript: (name: string) => Buffer;
  let workDir: string, keyFile: string, newKeyFile: string, oldKeyFile: string;

  beforeEach(() => {
    const uniqName = crypto.randomBytes(8).toString('hex');
    workDir = path.join(os.tmpdir(), `fxa-oauth-server-tests-${uniqName}`);
    fs.mkdirSync(workDir);
    keyFile = path.join(workDir, 'key.json');
    newKeyFile = path.join(workDir, 'newKey.json');
    oldKeyFile = path.join(workDir, 'oldKey.json');
    runScript = (name: string) => {
      const base = path.resolve(__dirname, '../../scripts');
      return execFileSync(
        process.execPath,
        ['-r', 'esbuild-register', path.join(base, name)],
        {
          env: {
            FXA_OPENID_KEYFILE: keyFile,
            FXA_OPENID_NEWKEYFILE: newKeyFile,
            FXA_OPENID_OLDKEYFILE: oldKeyFile,
            NODE_ENV: 'dev',
            TS_NODE_TRANSPILE_ONLY: 'true',
            TS_NODE_PROJECT: path.join(base, '../tsconfig.json'),
          },
          stdio: [0, 'pipe', 'pipe'],
        }
      );
    };
  });

  afterEach(() => {
    rimraf.sync(workDir);
  });

  it(
    'work as intended',
    () => {
      // Initially, the directory is empty.
      expect(fs.readdirSync(workDir)).toEqual([]);

      // We can't run any of the other management scripts until we generate initial set of keys.
      expect(() => runScript('prepare-new-signing-key.js')).toThrow(
        /oauthServer\.openid\.key is missing/
      );
      expect(() => runScript('activate-new-signing-key.js')).toThrow(
        /oauthServer\.openid\.key is missing/
      );
      expect(() => runScript('retire-old-signing-key.js')).toThrow(
        /oauthServer\.openid\.key is missing/
      );

      // Need to initialize some keys
      runScript('oauth_gen_keys.js');
      expect(fs.readdirSync(workDir).length).toBe(2);
      expect(fs.existsSync(keyFile)).toBe(true);
      expect(fs.existsSync(newKeyFile)).toBe(false);
      expect(fs.existsSync(oldKeyFile)).toBe(true);

      const kid = JSON.parse(fs.readFileSync(keyFile, 'utf-8')).kid;
      expect(kid).toBeTruthy();

      // That generated a fake old key, which we can retire.
      runScript('retire-old-signing-key.js');
      expect(fs.readdirSync(workDir).length).toBe(1);
      expect(fs.existsSync(keyFile)).toBe(true);
      expect(fs.existsSync(newKeyFile)).toBe(false);
      expect(fs.existsSync(oldKeyFile)).toBe(false);

      // But it didn't generate a new key, so we can't activate it.
      expect(() => runScript('activate-new-signing-key.js')).toThrow(
        /missing new signing key/
      );

      // Generate new signing key.
      runScript('prepare-new-signing-key.js');
      expect(fs.readdirSync(workDir).length).toBe(2);
      expect(fs.existsSync(keyFile)).toBe(true);
      expect(fs.existsSync(newKeyFile)).toBe(true);
      expect(fs.existsSync(oldKeyFile)).toBe(false);

      const newKid = JSON.parse(fs.readFileSync(newKeyFile, 'utf-8')).kid;
      expect(newKid).toBeTruthy();
      expect(newKid).not.toBe(kid);

      // Now we can activate it.
      runScript('activate-new-signing-key.js');
      expect(fs.readdirSync(workDir).length).toBe(2);
      expect(fs.existsSync(keyFile)).toBe(true);
      expect(fs.existsSync(newKeyFile)).toBe(false);
      expect(fs.existsSync(oldKeyFile)).toBe(true);

      const activatedKid = JSON.parse(
        fs.readFileSync(keyFile, 'utf-8')
      ).kid;
      expect(activatedKid).toBe(newKid);

      // Which should have moved the previous key to old-key.
      const retiringKid = JSON.parse(
        fs.readFileSync(oldKeyFile, 'utf-8')
      ).kid;
      expect(retiringKid).toBe(kid);

      // From where we can retire it completely.
      runScript('retire-old-signing-key.js');
      expect(fs.readdirSync(workDir).length).toBe(1);
      expect(fs.existsSync(keyFile)).toBe(true);
      expect(fs.existsSync(newKeyFile)).toBe(false);
      expect(fs.existsSync(oldKeyFile)).toBe(false);
    },
    60000
  );
});

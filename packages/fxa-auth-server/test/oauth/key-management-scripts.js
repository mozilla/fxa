/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { assert } = require('chai');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const crypto = require('crypto');
const rimraf = require('rimraf');

describe('the signing-key management scripts', function() {
  let runScript;
  let workDir, keyFile, newKeyFile, oldKeyFile;

  this.timeout(30000);

  beforeEach(() => {
    const uniqName = crypto.randomBytes(8).toString('hex');
    workDir = path.join(os.tmpdir(), `fxa-oauth-server-tests-${uniqName}`);
    fs.mkdirSync(workDir);
    keyFile = path.join(workDir, 'key.json');
    newKeyFile = path.join(workDir, 'newKey.json');
    oldKeyFile = path.join(workDir, 'oldKey.json');
    runScript = name => {
      const base = path.resolve(__dirname, '../../scripts');
      return execFileSync(
        process.execPath,
        [
          require.resolve('ts-node').replace('index.js', 'bin.js'),
          '-P',
          path.join(base, '../tsconfig.json'),
          path.join(base, name),
        ],
        {
          env: {
            FXA_OPENID_KEYFILE: keyFile,
            FXA_OPENID_NEWKEYFILE: newKeyFile,
            FXA_OPENID_OLDKEYFILE: oldKeyFile,
            NODE_ENV: 'dev',
          },
          stdio: [0, 'pipe', 'pipe'],
        }
      );
    };
  });

  afterEach(() => {
    rimraf.sync(workDir);
  });

  it('work as intended', () => {
    // Initially, the directory is empty.
    assert.deepEqual(fs.readdirSync(workDir), []);

    // We can't run any of the other management scripts until we generate initial set of keys.
    assert.throws(
      () => runScript('prepare-new-signing-key.js'),
      /oauthServer\.openid\.key is missing/
    );
    assert.throws(
      () => runScript('activate-new-signing-key.js'),
      /oauthServer\.openid\.key is missing/
    );
    assert.throws(
      () => runScript('retire-old-signing-key.js'),
      /oauthServer\.openid\.key is missing/
    );

    // Need to initialize some keys
    runScript('oauth_gen_keys.js');
    assert.equal(fs.readdirSync(workDir).length, 2);
    assert.ok(fs.existsSync(keyFile));
    assert.ok(!fs.existsSync(newKeyFile));
    assert.ok(fs.existsSync(oldKeyFile));

    const kid = JSON.parse(fs.readFileSync(keyFile)).kid;
    assert.ok(kid);

    // That generated a fake old key, which we can retire.
    runScript('retire-old-signing-key.js');
    assert.equal(fs.readdirSync(workDir).length, 1);
    assert.ok(fs.existsSync(keyFile));
    assert.ok(!fs.existsSync(newKeyFile));
    assert.ok(!fs.existsSync(oldKeyFile));

    // But it didn't generate a new key, so we can't activate it.
    assert.throws(
      () => runScript('activate-new-signing-key.js'),
      /missing new signing key/
    );

    // Generate new signing key.
    runScript('prepare-new-signing-key.js');
    assert.equal(fs.readdirSync(workDir).length, 2);
    assert.ok(fs.existsSync(keyFile));
    assert.ok(fs.existsSync(newKeyFile));
    assert.ok(!fs.existsSync(oldKeyFile));

    const newKid = JSON.parse(fs.readFileSync(newKeyFile)).kid;
    assert.ok(newKid);
    assert.notEqual(newKid, kid);

    // Now we can activate it.
    runScript('activate-new-signing-key.js');
    assert.equal(fs.readdirSync(workDir).length, 2);
    assert.ok(fs.existsSync(keyFile));
    assert.ok(!fs.existsSync(newKeyFile));
    assert.ok(fs.existsSync(oldKeyFile));

    const activatedKid = JSON.parse(fs.readFileSync(keyFile)).kid;
    assert.equal(activatedKid, newKid);

    // Which should have moved the previous key to old-key.
    const retiringKid = JSON.parse(fs.readFileSync(oldKeyFile)).kid;
    assert.equal(retiringKid, kid);

    // From where we can retire it completely.
    runScript('retire-old-signing-key.js');
    assert.equal(fs.readdirSync(workDir).length, 1);
    assert.ok(fs.existsSync(keyFile));
    assert.ok(!fs.existsSync(newKeyFile));
    assert.ok(!fs.existsSync(oldKeyFile));
  });
});

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);
const path = require('path');
const buf = (v) => (Buffer.isBuffer(v) ? v : Buffer.from(v, 'hex'));
const hex = (v) => (Buffer.isBuffer(v) ? v.toString('hex') : v);
const ScopeSet = require('fxa-shared').oauth.scopes;
const crypto = require('crypto');

const db = require('../../lib/oauth/db');

const POCKET_CLIENT_IDS = [
  '749818d3f2e7857f', // pocket-web
  '7377719276ad44ee', // pocket-mobile
];

function randomString(len) {
  return crypto.randomBytes(Math.ceil(len)).toString('hex');
}

describe('#integration - scripts/prune-pocket-access-tokens', function () {
  this.timeout(15000);

  const cwd = path.resolve(__dirname, '../..');

  let pocketWebClientId;
  let pocketMobileClientId;
  let nonPocketClientId;
  let userId;
  const scope = ScopeSet.fromArray(['profile']);

  let originalPocketWeb = null;
  let originalPocketMobile = null;

  before(async function () {
    pocketWebClientId = buf(POCKET_CLIENT_IDS[0]);
    pocketMobileClientId = buf(POCKET_CLIENT_IDS[1]);
    nonPocketClientId = buf(randomString(8));
    userId = buf(randomString(16));

    // Check if Pocket clients already exist in the CI DB, and save them for cleanup.
    // Without these checks, we get a "ER_DUP_ENTRY" error thrown in CI.
    originalPocketWeb = await db.getClient(pocketWebClientId);
    originalPocketMobile = await db.getClient(pocketMobileClientId);

    // Only register if they don't exist
    if (!originalPocketWeb) {
      await db.registerClient({
        id: pocketWebClientId,
        name: 'Pocket Web Test',
        hashedSecret: randomString(32),
        imageUri: 'https://example.com/logo',
        redirectUri: 'https://example.com/return',
        trusted: true,
      });
    }

    if (!originalPocketMobile) {
      await db.registerClient({
        id: pocketMobileClientId,
        name: 'Pocket Mobile Test',
        hashedSecret: randomString(32),
        imageUri: 'https://example.com/logo',
        redirectUri: 'https://example.com/return',
        trusted: true,
      });
    }

    await db.registerClient({
      id: nonPocketClientId,
      name: 'Non-Pocket Client Test',
      hashedSecret: randomString(32),
      imageUri: 'https://example.com/logo',
      redirectUri: 'https://example.com/return',
      trusted: true,
    });
  });

  after(async function () {
    // Remove clients we created; restore originals if they existed
    if (!originalPocketWeb) {
      await db.removeClient(hex(pocketWebClientId));
    } else {
      await db.updateClient(originalPocketWeb);
    }

    if (!originalPocketMobile) {
      await db.removeClient(hex(pocketMobileClientId));
    } else {
      await db.updateClient(originalPocketMobile);
    }

    await db.removeClient(hex(nonPocketClientId));
  });

  it('prints help', async () => {
    const { stdout } = await exec(
      'NODE_ENV=dev node -r esbuild-register scripts/prune-pocket-access-tokens.ts --help',
      { cwd }
    );

    assert.match(stdout, /Usage:/);
    assert.match(stdout, /--dry-run/);
    assert.match(stdout, /--batch-size/);
    assert.match(stdout, /--wait/);
  });

  it('runs in dry-run mode by default', async () => {
    const { stderr } = await exec(
      'NODE_ENV=dev node -r esbuild-register scripts/prune-pocket-access-tokens.ts',
      {
        cwd,
        shell: '/bin/bash',
      }
    );

    assert.match(stderr, /"dryRun":true/);
    assert.match(stderr, /Pocket token pruning start/);
  });

  it('parses arguments correctly', async () => {
    const { stderr } = await exec(
      'NODE_ENV=dev node -r esbuild-register scripts/prune-pocket-access-tokens.ts --batch-size=500 --wait=2000',
      {
        cwd,
        shell: '/bin/bash',
      }
    );

    assert.match(stderr, /"batchSize":500/);
    assert.match(stderr, /"waitMs":2000/);
  });

  describe('token deletion', function () {
    let pocketWebTokens = [];
    let pocketMobileTokens = [];
    let nonPocketToken;

    beforeEach(async function () {
      const mysql = db.mysql;

      // match oauth/db/mysql/index.js
      const QUERY_ACCESS_TOKEN_INSERT =
        'INSERT INTO tokens (clientId, userId, token, type, scope, expiresAt, createdAt, profileChangedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';

      // Create multiple Pocket Web tokens directly in MySQL
      for (let i = 0; i < 3; i++) {
        const tokenId = buf(randomString(32));
        await mysql._write(QUERY_ACCESS_TOKEN_INSERT, [
          pocketWebClientId,
          userId,
          tokenId,
          'bearer',
          scope.toString(),
          new Date(Date.now() + 3600000), // 1 hour from now
          new Date(),
          0,
        ]);
        pocketWebTokens.push(hex(tokenId));
      }

      // Create multiple Pocket Mobile tokens directly in MySQL
      for (let i = 0; i < 2; i++) {
        const tokenId = buf(randomString(32));
        await mysql._write(QUERY_ACCESS_TOKEN_INSERT, [
          pocketMobileClientId,
          userId,
          tokenId,
          'bearer',
          scope.toString(),
          new Date(Date.now() + 3600000),
          new Date(),
          0,
        ]);
        pocketMobileTokens.push(hex(tokenId));
      }

      // Create non-Pocket client token directly in MySQL.
      // In production these should go to Redis, but we insert one for testing to
      // verify that the script only deletes Pocket tokens based on client ID.
      const nonPocketTokenId = buf(randomString(32));
      await mysql._write(QUERY_ACCESS_TOKEN_INSERT, [
        nonPocketClientId,
        userId,
        nonPocketTokenId,
        'bearer',
        scope.toString(),
        new Date(Date.now() + 3600000),
        new Date(),
        0,
      ]);
      nonPocketToken = hex(nonPocketTokenId);
    });

    afterEach(async function () {
      // Clean up any remaining tokens
      const allTokens = [
        ...pocketWebTokens,
        ...pocketMobileTokens,
        nonPocketToken,
      ];
      for (const token of allTokens) {
        try {
          await db.removeAccessToken({ tokenId: buf(token) });
        } catch (e) {
          // Token may already be deleted
        }
      }
      pocketWebTokens = [];
      pocketMobileTokens = [];
    });

    it('counts Pocket tokens correctly in dry-run mode', async function () {
      const { stdout } = await exec(
        'NODE_ENV=dev node -r esbuild-register scripts/prune-pocket-access-tokens.ts',
        {
          cwd,
          shell: '/bin/bash',
        }
      );

      assert.match(stdout, /Found \d+ Pocket access tokens/);
      assert.match(stdout, new RegExp(POCKET_CLIENT_IDS[0]));
      assert.match(stdout, new RegExp(POCKET_CLIENT_IDS[1]));
      assert.match(stdout, /Dry run mode is on/);
    });

    it('deletes Pocket tokens but not other tokens', async function () {
      // Verify tokens exist before deletion
      const pocketWebTokenExists = await db.getAccessToken(pocketWebTokens[0]);
      const pocketMobileTokenExists = await db.getAccessToken(
        pocketMobileTokens[0]
      );
      let nonPocketTokenExists = await db.getAccessToken(nonPocketToken);

      assert.ok(pocketWebTokenExists, 'Pocket Web token should exist');
      assert.ok(pocketMobileTokenExists, 'Pocket Mobile token should exist');
      assert.ok(nonPocketTokenExists, 'Normal token should exist');

      // Run the script with dry-run=false
      const { stdout, stderr } = await exec(
        'NODE_ENV=dev node -r esbuild-register scripts/prune-pocket-access-tokens.ts --dry-run=false',
        {
          cwd,
          shell: '/bin/bash',
        }
      );

      assert.match(stderr, /Deleted batch of Pocket tokens/);
      assert.match(stderr, /Deleted all pocket tokens for client/);
      assert.match(stdout, /Pocket access token pruning complete/);

      // Verify Pocket tokens are deleted
      for (const token of pocketWebTokens) {
        const exists = await db.getAccessToken(token);
        assert.isUndefined(exists, 'Pocket Web token should be deleted');
      }

      for (const token of pocketMobileTokens) {
        const exists = await db.getAccessToken(token);
        assert.isUndefined(exists, 'Pocket Mobile token should be deleted');
      }

      // Verify normal token still exists
      nonPocketTokenExists = await db.getAccessToken(nonPocketToken);
      assert.ok(nonPocketTokenExists, 'Normal token should still exist');
    });

    it('deletes tokens in batches', async function () {
      const mysql = db.mysql;

      const initialCount = await mysql._read(
        'SELECT COUNT(*) as total FROM tokens WHERE clientId = ?',
        [pocketWebClientId]
      );
      const initial = Number(initialCount[0].total);
      assert.isAtLeast(initial, 3, 'Should have at least 3 tokens');

      // Run the script with small batch size
      const { stderr } = await exec(
        'NODE_ENV=dev node -r esbuild-register scripts/prune-pocket-access-tokens.ts --dry-run=false --batch-size=2 --wait=100',
        {
          cwd,
          shell: '/bin/bash',
        }
      );

      // Should see multiple batch deletions
      assert.match(stderr, /batchNumber/);
      assert.match(stderr, /Deleted all pocket tokens for client/);

      // Verify all Pocket tokens are deleted
      const finalCount = await mysql._read(
        'SELECT COUNT(*) as total FROM tokens WHERE clientId = ?',
        [pocketWebClientId]
      );

      assert.equal(
        Number(finalCount[0].total),
        0,
        'All Pocket Web tokens should be deleted'
      );
    });
  });
});

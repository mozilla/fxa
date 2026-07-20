/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import path from 'path';
import { fileURLToPath } from 'url';
import Patcher from '../lib/mysql-patcher.js';
import mockMySQL from './mock-mysql.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.join(__dirname, 'fixtures');

describe('mysql-patcher', () => {
  describe('constructor', () => {
    it('throws if dir is missing', () => {
      expect(() => new Patcher({ patchLevel: 0, mysql: mockMySQL() })).toThrow(
        "Option 'dir' is required"
      );
    });

    it('throws if patchLevel is missing', () => {
      expect(() => new Patcher({ dir: '/tmp', mysql: mockMySQL() })).toThrow(
        "Option 'patchLevel' is required"
      );
    });

    it('throws if mysql is missing', () => {
      expect(() => new Patcher({ dir: '/tmp', patchLevel: 0 })).toThrow(
        "Option 'mysql' must be a mysql module object"
      );
    });

    it('throws if mysql has no createConnection', () => {
      expect(
        () => new Patcher({ dir: '/tmp', patchLevel: 0, mysql: {} })
      ).toThrow("Option 'mysql' must be a mysql module object");
    });

    it('throws if database is missing', () => {
      expect(
        () => new Patcher({ dir: '/tmp', patchLevel: 0, mysql: mockMySQL() })
      ).toThrow("Option 'database' is required");
    });

    it('throws if database is empty string', () => {
      expect(
        () =>
          new Patcher({
            dir: '/tmp',
            patchLevel: 0,
            mysql: mockMySQL(),
            database: '',
          })
      ).toThrow("Option 'database' is required");
    });
  });

  describe('readPatchFiles', () => {
    it('reads patch set correctly', async () => {
      const p = new Patcher({
        dir: path.join(fixturesDir, 'patches'),
        patchLevel: 0,
        database: 'testdb',
        mysql: mockMySQL(),
      });

      await p.readPatchFiles();

      const patches = p.patches;
      expect(Object.keys(patches).length).toBe(3);

      expect(Object.keys(patches[0]).length).toBe(1);
      expect(Object.keys(patches[1]).length).toBe(2);
      expect(Object.keys(patches[2]).length).toBe(1);

      expect(patches[0][1]).toBe('-- 0->1\n');
      expect(patches[1][2]).toBe('-- 1->2\n');
      expect(patches[2][1]).toBe('-- 2->1\n');
      expect(patches[1][0]).toBe('-- 1->0\n');
    });
  });

  describe('checkAllPatchesAvailable', () => {
    it('finds all forward patches', () => {
      const p = new Patcher({
        patchLevel: 2,
        dir: 'nonexistent',
        database: 'testdb',
        mysql: mockMySQL(),
      });
      p.currentPatchLevel = 0;
      p.patches = {
        0: { 1: '-- 0->1\n' },
        1: { 2: '-- 1->2\n' },
      };

      p.checkAllPatchesAvailable();

      expect(p.patchesToApply).toEqual([
        { sql: '-- 0->1\n', from: 0, to: 1 },
        { sql: '-- 1->2\n', from: 1, to: 2 },
      ]);
    });

    it('finds all backward patches when reversePatchAllowed', () => {
      const p = new Patcher({
        patchLevel: 0,
        dir: 'nonexistent',
        database: 'testdb',
        mysql: mockMySQL(),
        reversePatchAllowed: true,
      });
      p.currentPatchLevel = 2;
      p.patches = {
        2: { 1: '-- 2->1\n' },
        1: { 0: '-- 1->0\n' },
      };

      p.checkAllPatchesAvailable();

      expect(p.patchesToApply).toEqual([
        { sql: '-- 2->1\n', from: 2, to: 1 },
        { sql: '-- 1->0\n', from: 1, to: 0 },
      ]);
    });

    it('throws when reverse patching is not allowed', () => {
      const p = new Patcher({
        patchLevel: 0,
        dir: 'nonexistent',
        database: 'testdb',
        mysql: mockMySQL(),
      });
      p.currentPatchLevel = 2;
      p.patches = {
        2: { 1: '-- 2->1\n' },
        1: { 0: '-- 1->0\n' },
      };

      expect(() => p.checkAllPatchesAvailable()).toThrow(
        'Reverse patching from level 2 to 0 is not allowed'
      );
    });

    it('errors when patch #2 is missing', () => {
      const p = new Patcher({
        patchLevel: 2,
        dir: 'nonexistent',
        database: 'testdb',
        mysql: mockMySQL(),
      });
      p.currentPatchLevel = 0;
      p.patches = {
        0: { 1: '-- 0->1\n' },
      };

      expect(() => p.checkAllPatchesAvailable()).toThrow(
        'Patch from level 1 to 2 does not exist'
      );
    });

    it('errors when patch #1 is missing', () => {
      const p = new Patcher({
        patchLevel: 2,
        dir: 'nonexistent',
        database: 'testdb',
        mysql: mockMySQL(),
      });
      p.currentPatchLevel = 0;
      p.patches = {
        1: { 2: '-- 1->2\n' },
      };

      expect(() => p.checkAllPatchesAvailable()).toThrow(
        'Patch from level 0 to 1 does not exist'
      );
    });

    it('returns no patches when already at target level', () => {
      const p = new Patcher({
        patchLevel: 2,
        dir: 'nonexistent',
        database: 'testdb',
        mysql: mockMySQL(),
      });
      p.currentPatchLevel = 2;
      p.patches = {};

      p.checkAllPatchesAvailable();

      expect(p.patchesToApply).toEqual([]);
    });
  });

  describe('applyPatches with mock connection', () => {
    it('executes all patches in order', async () => {
      let count = 0;
      const p = new Patcher({
        dir: path.join(fixturesDir, 'end-to-end'),
        database: 'testdb',
        metaTable: 'metadata',
        patchKey: 'schema-patch-level',
        patchLevel: 3,
        mysql: mockMySQL({
          query(sql, args, callback) {
            if (typeof callback === 'undefined') {
              callback = args;
            }
            if (sql.match(/SELECT value FROM metadata WHERE name/)) {
              return callback(null, [{ value: '' + count }]);
            }
            if (sql.match(/SELECT .+ AS count FROM information_schema/)) {
              return callback(null, [{ count: 1 }]);
            }
            expect(sql).toBe(p.patchesToApply[count].sql);
            count += 1;
            callback(null, []);
          },
        }),
      });
      p.currentPatchLevel = 0;

      await p.connect();
      await p.readPatchFiles();
      p.checkAllPatchesAvailable();
      await p.applyPatches();

      expect(count).toBe(3);
      expect(p.currentPatchLevel).toBe(3);
    });

    it('returns error when a patch SQL fails', async () => {
      const p = new Patcher({
        metaTable: 'metadata',
        patchKey: 'level',
        patchLevel: 0,
        database: 'testdb',
        dir: 'nonexistent',
        mysql: mockMySQL({
          query(sql, args, callback) {
            if (typeof callback === 'undefined') {
              callback = args;
            }
            if (sql.match(/SELECT .+ AS count FROM information_schema/)) {
              return callback(null, [{ count: 0 }]);
            }
            expect(sql).toBe('-- 0->1');
            callback(new Error('Something went wrong'));
          },
        }),
      });
      p.patchesToApply = [{ sql: '-- 0->1' }];

      await p.connect();

      await expect(p.applyPatches()).rejects.toThrow('Something went wrong');
    });
  });

  describe('connect error handling', () => {
    it('cleans up connection and rethrows on connect failure', async () => {
      let endCalled = false;
      const p = new Patcher({
        dir: '/tmp',
        patchLevel: 0,
        database: 'testdb',
        mysql: {
          createConnection() {
            return {
              connect(callback) {
                callback(new Error('ECONNREFUSED'));
              },
              end(callback) {
                endCalled = true;
                callback();
              },
              changeUser(opts, callback) {
                callback();
              },
              query() {
                throw new Error('should not be called');
              },
            };
          },
        },
      });

      await expect(p.connect()).rejects.toThrow('ECONNREFUSED');
      expect(endCalled).toBe(true);
      expect(p.connection).toBeNull();
    });

    it('cleans up connection and rethrows on changeUser failure', async () => {
      let endCalled = false;
      const p = new Patcher({
        dir: '/tmp',
        patchLevel: 0,
        database: 'testdb',
        mysql: {
          createConnection() {
            return {
              connect(callback) {
                callback();
              },
              end(callback) {
                endCalled = true;
                callback();
              },
              changeUser(opts, callback) {
                callback(new Error('Access denied'));
              },
              query(sql, args, callback) {
                if (typeof callback === 'undefined') callback = args;
                callback(null, []);
              },
            };
          },
        },
      });

      await expect(p.connect()).rejects.toThrow('Access denied');
      expect(endCalled).toBe(true);
      expect(p.connection).toBeNull();
    });
  });

  describe('Patcher.patch static method', () => {
    it('errors with missing options', async () => {
      await expect(Patcher.patch({})).rejects.toThrow(/required/);
    });
  });
});

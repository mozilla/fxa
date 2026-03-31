/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Vendored from https://github.com/chilts/mysql-patcher v0.7.0
// Modernized: async/await, removed async/bluebird/clone/glob/xtend deps

import fs from 'fs/promises';
import path from 'path';
import { promisify } from 'util';

const ERR_NO_SUCH_TABLE = 1146;

function promisifyConnection(conn) {
  return {
    raw: conn,
    connect: promisify(conn.connect.bind(conn)),
    query: promisify(conn.query.bind(conn)),
    changeUser: promisify(conn.changeUser.bind(conn)),
    end: promisify(conn.end.bind(conn)),
  };
}

function Patcher(options) {
  this.options = { ...options };

  if (!this.options.dir) {
    throw new Error("Option 'dir' is required");
  }

  if (!('patchLevel' in this.options)) {
    throw new Error("Option 'patchLevel' is required");
  }

  if (!this.options.mysql || !this.options.mysql.createConnection) {
    throw new Error("Option 'mysql' must be a mysql module object");
  }

  if (typeof this.options.database !== 'string' || this.options.database.length === 0) {
    throw new Error("Option 'database' is required and must be a non-empty string");
  }

  this.options.metaTable = this.options.metaTable ?? 'metadata';
  this.options.reversePatchAllowed = this.options.reversePatchAllowed ?? false;
  this.options.patchKey = this.options.patchKey ?? 'patch';
  this.options.createDatabase = this.options.createDatabase ?? false;
  this.options.filePrefix = this.options.filePrefix ?? 'patch';
  this.options.multipleStatements = true;

  this.connection = null;
  this.metaTableExists = undefined;
  this.currentPatchLevel = undefined;
  this.patches = {};
  this.patchesToApply = [];
}

Patcher.prototype.connect = async function connect() {
  const { database, ...opts } = this.options;

  const rawConn = this.options.mysql.createConnection(opts);
  this.connection = promisifyConnection(rawConn);

  try {
    await this.connection.connect();

    if (this.options.createDatabase) {
      await this.connection.query(
        `CREATE DATABASE IF NOT EXISTS ${database} CHARACTER SET utf8 COLLATE utf8_unicode_ci`
      );
    }

    await this.connection.changeUser({
      user: this.options.user,
      password: this.options.password,
      database,
    });

    const result = await this.connection.query(
      'SELECT COUNT(*) AS count FROM information_schema.TABLES WHERE table_schema = ? AND table_name = ?',
      [database, this.options.metaTable]
    );
    this.metaTableExists = result[0].count !== 0;

    if (this.metaTableExists) {
      const rows = await this.connection.query(
        `SELECT value FROM ${this.options.metaTable} WHERE name = ?`,
        [this.options.patchKey]
      );
      this.currentPatchLevel = rows.length === 0 ? 0 : +rows[0].value;
    } else {
      this.currentPatchLevel = 0;
    }
  } catch (err) {
    if (this.connection) {
      try {
        await this.connection.end();
      } catch (_) {}
      this.connection = null;
    }
    throw err;
  }
};

Patcher.prototype.end = async function end() {
  if (this.connection) {
    try {
      await this.connection.end();
    } catch (_) {}
    this.connection = null;
  }
};

Patcher.prototype.patch = async function patch() {
  if (!this.connection) {
    throw new Error('must call connect() before calling patch()');
  }

  await this.readPatchFiles();
  this.checkAllPatchesAvailable();
  await this.applyPatches();
};

Patcher.prototype.readPatchFiles = async function readPatchFiles() {
  this.patches = {};

  const { dir, filePrefix: prefix } = this.options;

  const entries = await fs.readdir(dir);
  const sqlFiles = entries
    .filter((name) => name.endsWith('.sql') && name.startsWith(`${prefix}-`))
    .map((name) => path.join(dir, name));

  for (const filename of sqlFiles) {
    const info = extractBaseAndLevels(filename);
    if (!info || info.base !== prefix || (info.from === 0 && info.to === 0)) {
      continue;
    }

    this.patches[info.from] ??= {};
    this.patches[info.from][info.to] = await fs.readFile(filename, {
      encoding: 'utf8',
    });
  }
};

Patcher.prototype.checkAllPatchesAvailable =
  function checkAllPatchesAvailable() {
    this.patchesToApply = [];

    if (this.options.patchLevel === this.currentPatchLevel) {
      return;
    }

    const direction = this.currentPatchLevel < this.options.patchLevel ? 1 : -1;

    if (direction === -1 && !this.options.reversePatchAllowed) {
      throw new Error(
        `Reverse patching from level ${this.currentPatchLevel} to ${this.options.patchLevel} is not allowed`
      );
    }

    let currentLevel = this.currentPatchLevel;

    while (currentLevel !== this.options.patchLevel) {
      const nextLevel = currentLevel + direction;

      if (!this.patches[currentLevel]?.[nextLevel]) {
        throw new Error(
          `Patch from level ${currentLevel} to ${nextLevel} does not exist`
        );
      }

      this.patchesToApply.push({
        sql: this.patches[currentLevel][nextLevel],
        from: currentLevel,
        to: nextLevel,
      });
      currentLevel += direction;
    }
  };

Patcher.prototype.applyPatches = async function applyPatches() {
  for (const patch of this.patchesToApply) {
    await this.connection.query(patch.sql);

    try {
      const result = await this.connection.query(
        `SELECT value FROM ${this.options.metaTable} WHERE name = ?`,
        [this.options.patchKey]
      );

      if (result.length === 0) {
        throw new Error('The patchKey does not exist in the metaTable');
      }

      const level = +result[0].value;
      if (level !== patch.to) {
        throw new Error(
          `Patch level in metaTable (${level}) is incorrect after this patch (${patch.to})`
        );
      }

      this.currentPatchLevel = level;
    } catch (err) {
      // Patching to level 0 may drop the metaTable — that's expected
      if (patch.to === 0 && err.errno === ERR_NO_SUCH_TABLE) {
        this.currentPatchLevel = 0;
        this.metaTableExists = false;
        continue;
      }
      throw err;
    }
  }

  if (!this.metaTableExists) {
    const result = await this.connection.query(
      'SELECT COUNT(*) AS count FROM information_schema.TABLES WHERE table_schema = ? AND table_name = ?',
      [this.options.database, this.options.metaTable]
    );
    this.metaTableExists = result[0].count !== 0;
  }
};

Patcher.patch = async function patch(options) {
  const patcher = new Patcher(options);
  await patcher.connect();
  try {
    await patcher.patch();
  } finally {
    await patcher.end();
  }
};

function extractBaseAndLevels(filename) {
  const basename = path.basename(filename, '.sql');
  let parts = basename.split('-');

  if (parts.length < 3) return null;

  if (parts.length > 3) {
    parts = [parts.slice(0, -2).join('-'), parts.at(-2), parts.at(-1)];
  }

  const from = parseInt(parts[1], 10);
  const to = parseInt(parts[2], 10);

  if (Number.isNaN(from) || Number.isNaN(to)) {
    return null;
  }

  return {
    base: parts[0],
    from,
    to,
  };
}

export default Patcher;

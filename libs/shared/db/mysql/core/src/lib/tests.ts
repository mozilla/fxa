/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import fs from 'fs';
import { Knex } from 'knex';
import path from 'path';

export const runSql = async (filePaths: string[], instance: Knex) =>
  Promise.all(
    filePaths
      .map((x) => path.join(__dirname, x))
      .map((x) => fs.readFileSync(x, 'utf8'))
      .map((x) => instance.raw.bind(instance)(x))
  );

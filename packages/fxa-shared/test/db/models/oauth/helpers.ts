/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import fs from 'fs';
import path from 'path';

import { Knex } from 'knex';

export async function testOauthDatabaseSetup(instance: Knex): Promise<void> {
  // TODO: Setup DTOs for oauth. Once in place, we can do something like this:
  // BaseOauthModel.knex(knex);

  const runSql = async (filePaths: string[]) =>
    Promise.all(
      filePaths
        .map((x) => path.join(__dirname, x))
        .map((x) => fs.readFileSync(x, 'utf8'))
        .map((x) => instance.raw.bind(instance)(x))
    );

  await runSql([
    './clientDevelopers.sql',
    './clients.sql',
    './dbMetaData.sql',
    './developers.sql',
    './scopes.sql',

    './tokens.sql',
    './refreshTokens.sql',
  ]);

  await runSql(['./codes.sql']);

  /*/ Debugging Assistance
   knex.on('query', (data) => {
     console.dir(data);
   });
   //*/
}

import { knex, Knex } from 'knex';
import { setupDatabase } from '../../db';
import { MySQLConfig } from '../../db/config';
import { testAuthDatabaseSetup } from './models/auth/helpers';
import { testOauthDatabaseSetup } from './models/oauth/helpers';
import { testProfileDatabaseSetup } from './models/profile/helpers';

export const defaultOpts = {
  recreate: true,
  auth: true,
  oauth: true,
  profile: true,
  testDbConfig: {
    database: 'testAdmin',
    host: 'localhost',
    password: '',
    port: 3306,
    user: 'root',
  },
  mainDbConfig: {
    client: 'mysql',
    connection: {
      charset: 'UTF8MB4_BIN',
      host: 'localhost',
      password: '',
      port: 3306,
      user: 'root',
    },
  },
};

export async function testDatabaseSetup(
  opts: {
    recreate: boolean;
    auth: boolean;
    oauth: boolean;
    profile: boolean;
    mainDbConfig: Knex.Config;
    testDbConfig: MySQLConfig;
  } = defaultOpts
) {
  if (opts.recreate) {
    const instance = knex(opts.mainDbConfig);
    await instance.raw('DROP DATABASE IF EXISTS testAdmin');
    await instance.raw('CREATE DATABASE testAdmin');
    await instance.destroy();
  }

  const instance = setupDatabase(opts.testDbConfig);
  if (opts.auth) await testAuthDatabaseSetup(instance);
  if (opts.oauth) await testOauthDatabaseSetup(instance);
  if (opts.profile) await testProfileDatabaseSetup(instance);

  return instance;
}

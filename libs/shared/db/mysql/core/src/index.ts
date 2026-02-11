/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import 'reflect-metadata';
export {
  MySQLConfig,
  makeConvictMySQLConfig,
  makeValidatedMySQLConfig,
} from './lib/config';
export {
  createDialect,
  createKnex,
  generateFxAUuid,
  monitorKnexConnectionPool,
} from './lib/core';
export { runSql } from './lib/tests';
export { intBoolTransformer, uuidTransformer } from './lib/transformers';
export * from './lib/providers';

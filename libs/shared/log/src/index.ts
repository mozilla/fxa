/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export { logger } from './lib/logging';
export { monkeyPatchServerLogging } from './lib/monkey-patch';
export { LoggingModule, LOGGER_PROVIDER } from './lib/nest/logging.module';
export type { Logger } from './lib/nest/logging.module';

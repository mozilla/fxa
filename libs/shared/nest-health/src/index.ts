/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export { HEALTH_CONFIG } from './lib/health.constants';
export { HealthModule } from './lib/health.module';
export type {
  HealthControllerConfigParams,
  HealthModuleAsyncParams,
} from './lib/health.module';
export { getVersionInfo } from './lib/version';
export type { Version } from './lib/version';

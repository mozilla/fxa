/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { BaseTarget } from './base';
import { LocalTarget } from './local';
import { StageTarget } from './stage';
import { ProductionTarget } from './production';

export const TargetNames = [
  LocalTarget.target,
  StageTarget.target,
  ProductionTarget.target,
] as const;
export type TargetName = (typeof TargetNames)[number];

const targets = {
  [LocalTarget.target]: LocalTarget,
  [StageTarget.target]: StageTarget,
  [ProductionTarget.target]: ProductionTarget,
};

export function create(name: TargetName): BaseTarget {
  return new targets[name]();
}

export { BaseTarget as ServerTarget };
export { Credentials } from './base';

/**
 * Helper function to get a value from the environment. If the key + __ + targetName exists, this
 * will be returned. Otherwise, if $key exists it will be returned. Otherwise undefined will be
 * returned.
 * @param key The environment variable name
 * @param targetName The current target, eg local, stage, production.
 * @returns the env value, given deference to the env with key + __ + targetName.
 */
export function getFromEnv(key: string, targetName: TargetName) {
  return (
    process.env[`${key}__${targetName.toUpperCase()}`] || process.env[`${key}`]
  );
}

/**
 * Same as getFromEnv, expect supports a fall back value if the environment variable is missing.
 * @param key The environment variable name
 * @param targetName The current target. eg local, stage, production.
 * @param fallbackValue A default value to return if no env value can be resolved.
 * @returns The env value, given deference to the env with key + __ + targetName.
 */
export function getFromEnvWithFallback(
  key: string,
  targetName: TargetName,
  fallbackValue: string
) {
  return (
    process.env[`${key}__${targetName.toUpperCase()}`] ||
    process.env[`${key}`] ||
    fallbackValue
  );
}

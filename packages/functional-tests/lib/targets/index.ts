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

// Default test number, see Twilio test credentials phone numbers:
// https://www.twilio.com/docs/iam/test-credentials
export const TEST_NUMBER = '4159929960';

/**
 * Checks the process env for a configured twilio test phone number. Defaults
 * to generic magic test number if one is not provided.
 * @param targetName The test target name. eg local, stage, prod.
 * @returns
 */
export function getPhoneNumber(targetName: TargetName) {
  if (targetName === 'local') {
    return TEST_NUMBER;
  }
  return getFromEnvWithFallback(
    'FUNCTIONAL_TESTS__TWILIO__TEST_NUMBER',
    targetName,
    TEST_NUMBER
  );
}

export function usingRealTestPhoneNumber(targetName: TargetName) {
  return getPhoneNumber(targetName) !== TEST_NUMBER;
}

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

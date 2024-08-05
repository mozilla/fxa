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

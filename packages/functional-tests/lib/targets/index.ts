import { BaseTarget } from './base';
import { LocalTarget } from './local';
import { StageTarget } from './stage';
import { ProductionTarget } from './production';

export const TargetNames = [
  LocalTarget.target,
  StageTarget.target,
  ProductionTarget.target,
] as const;
export type TargetName = typeof TargetNames[number];

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

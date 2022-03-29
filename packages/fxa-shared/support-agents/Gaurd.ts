/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/** Feature configuration */
export interface IFeature {
  /** Human readable name of feature */
  name: string;

  /** Optional description of feature. */
  description?: string;

  /** Permission level required. */
  level: number;
}

export type Permissions = Record<string, IFeature>;

/** Gaurds access to various features */
export abstract class Gaurd<TFeatures extends string, TGroup> {
  protected constructor(protected readonly permissions: Permissions) {}

  /** Determines permission level from group name. */
  abstract groupToLevel(group: TGroup): number;

  /** Looks up underlying feature state */
  getFeature(feature: TFeatures) {
    if (!this.permissions[feature]) {
      throw new Error('Uknown feature ' + feature);
    }

    return this.permissions[feature];
  }

  /** Determimes if feature is allowed for group */
  allow(feature: TFeatures, group: TGroup) {
    const level = this.groupToLevel(group);
    const featureConfig = this.getFeature(feature);
    return level <= featureConfig.level;
  }
}

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* The maximum value that should be allowed for a permission level. */
export const MaxPermissionLevel = 100;

/** Feature configuration */
export interface IFeature {
  /** Human readable name of feature */
  name: string;

  /** Optional description of feature. */
  description?: string;

  /** Permission level required. */
  level: number;
}

/** PermissionSummary */
export interface IFeatureFlag extends Pick<IFeature, 'name' | 'description'> {
  id: string;
  enabled: boolean;
}

/** Group configuration */
export interface IGroup {
  /** Human readable name for group */
  name: string;

  /** Header value */
  header: string;

  /** Groups assigned permission level */
  level: number;
}

export type Permissions = Record<string, IFeature>;
export type Groups = Record<string, IGroup>;

/** Guards access to various features */
export abstract class Guard<TFeatures extends string, TGroup extends string> {
  protected constructor(
    protected readonly permissions: Permissions,
    protected readonly groups: Groups
  ) {}

  /** Given a remote group header, finds the group with the higest permissions. */
  getBestGroup(remoteGroupHeader: string) {
    const list = this.getBestGroups(remoteGroupHeader);
    if (list.length > 0) {
      return list[0];
    }
    return { name: '', header: '', level: MaxPermissionLevel };
  }

  private getBestGroups(remoteGroupHeader: string): IGroup[] {
    const list = remoteGroupHeader.split(',').map((x) => x.trim());
    return Object.keys(this.groups)
      .filter((x) => list.indexOf(x) >= 0)
      .map((x) => this.groups[x])
      .sort((a, b) => a.level - b.level);
  }

  /** Looks up group by name */
  getGroup(group: TGroup) {
    if (!this.groups[group]) {
      throw new Error(`Unknown group ${group}`);
    }
    return this.groups[group];
  }

  /** Looks up underlying feature state */
  getFeature(feature: TFeatures) {
    if (!this.permissions[feature]) {
      throw new Error(`Unknown feature ${feature}`);
    }
    return this.permissions[feature];
  }

  /** Get a list of all supported features */
  getFeatureFlags(group: IGroup): IFeatureFlag[] {
    const featureFlags: IFeatureFlag[] = [];
    for (const key in this.permissions) {
      const permission = this.permissions[key];
      featureFlags.push({
        id: key,
        enabled: group.level <= permission.level,
        name: permission.name,
        description: permission.description,
      });
    }
    return featureFlags;
  }

  /** Determimes if feature is allowed for group */
  allow(f: TFeatures | IFeature, g: TGroup | IGroup) {
    const resolvedFeature =
      typeof f === 'string' ? this.getFeature(f) : (f as IFeature);
    const resolvedGroup =
      typeof g === 'string' ? this.getGroup(g) : (g as IGroup);
    const result = resolvedGroup.level <= resolvedFeature.level;
    return result;
  }
}

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { Gaurd, Permissions } from './Gaurd';

/** Enum of known permission levels */
export enum PermissionLevel {
  Admin = 0,
  Support = 1,
  None = 10,
}

/** Enum of known features */
export enum Feature {
  LookupByEmail = 'LookupByEmail',
  LookupByUID = 'LookupByUID',
  AccountLogs = 'AccountLogs',
  ActiveSessions = 'ActiveSessions',
  ClearEmailBounces = 'ClearEmailBounces',
  DisableAccounts = 'DisableAccounts',
  UnVerifyAccounts = 'UnVerifyAccounts',
}

/** Enum of known user groups */
export enum Groups {
  AdminProd = 'vpn_fxa_admin_panel_prod',
  AdminStage = 'vpn_fxa_admin_panel_stage',
  SupportAgentProd = 'vpn_fxa_supportagent_prod',
  SupportAgentStage = 'vpn_fxa_supportagent_stage',
  None = '',
}

/** Default state of feature config. */
export const defaultAdminPanelPermissions: Permissions = {
  [Feature.LookupByEmail]: {
    name: 'Lookup Account By Email',
    level: PermissionLevel.Admin,
  },
  [Feature.LookupByUID]: {
    name: 'Lookup Account By UID',
    level: PermissionLevel.Admin,
  },
  [Feature.AccountLogs]: {
    name: 'View Account Logs',
    level: PermissionLevel.Admin,
  },
  [Feature.ActiveSessions]: {
    name: 'View Active Sessions',
    level: PermissionLevel.Admin,
  },
  [Feature.ClearEmailBounces]: {
    name: 'Clear Email Bounces',
    level: PermissionLevel.Admin,
  },
  [Feature.DisableAccounts]: {
    name: 'Disable Accounts',
    level: PermissionLevel.Admin,
  },
  [Feature.UnVerifyAccounts]: {
    name: 'Unverify Accounts',
    level: PermissionLevel.Admin,
  },
};

export class AdminPanelGaurd extends Gaurd<Feature, Groups> {
  constructor() {
    super(defaultAdminPanelPermissions);
  }

  public groupToLevel(group: Groups): PermissionLevel {
    switch (group) {
      case Groups.AdminProd:
      case Groups.AdminStage:
        return PermissionLevel.Admin;
      case Groups.SupportAgentProd:
      case Groups.SupportAgentStage:
        return PermissionLevel.Support;
      default:
        return PermissionLevel.None;
    }
  }
}

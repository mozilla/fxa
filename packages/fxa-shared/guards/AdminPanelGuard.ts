/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Guard, Permissions, Groups, MaxPermissionLevel } from './Guard';

/** Enum of known permission levels. A lower level will indicate increased permissions. */
export enum PermissionLevel {
  Admin = 0,
  Support = 1,
  None = MaxPermissionLevel,
}

/** Enum of known features */
export enum AdminPanelFeature {
  AccountLogs = 'AccountLogs',
  AccountSearch = 'AccountSearch',
  ConnectedServices = 'ActiveSessions',
  ClearEmailBounces = 'ClearEmailBounces',
  DisableAccounts = 'DisableAccounts',
  SiteStatus = 'SiteStatus',
  UnVerifyAccounts = 'UnVerifyAccounts',
}

/** Enum of known user groups */
export enum AdminPanelGroup {
  AdminProd = 'vpn_fxa_admin_panel_prod',
  AdminStage = 'vpn_fxa_admin_panel_stage',
  SupportAgentProd = 'vpn_fxa_supportagent_prod',
  SupportAgentStage = 'vpn_fxa_supportagent_stage',
  None = 'None',
}

const defaultAdminPanelGroups: Groups = {
  [AdminPanelGroup.AdminProd]: {
    name: 'Admin',
    level: PermissionLevel.Admin,
  },
  [AdminPanelGroup.AdminStage]: {
    name: 'Admin',
    level: PermissionLevel.Admin,
  },
  [AdminPanelGroup.SupportAgentProd]: {
    name: 'Support',
    level: PermissionLevel.Support,
  },
  [AdminPanelGroup.SupportAgentStage]: {
    name: 'Support',
    level: PermissionLevel.Support,
  },
  [AdminPanelGroup.None]: {
    name: 'Unknown',
    level: PermissionLevel.None,
  },
};

/** Default state of feature config. */
const defaultAdminPanelPermissions: Permissions = {
  [AdminPanelFeature.AccountSearch]: {
    name: 'Lookup Account By Email/UID',
    level: PermissionLevel.Support,
  },
  [AdminPanelFeature.AccountLogs]: {
    name: 'View Account Logs',
    level: PermissionLevel.Support,
  },
  [AdminPanelFeature.ConnectedServices]: {
    name: 'View Active Sessions',
    level: PermissionLevel.Support,
  },
  [AdminPanelFeature.ClearEmailBounces]: {
    name: 'Clear Email Bounces',
    level: PermissionLevel.Support,
  },
  [AdminPanelFeature.DisableAccounts]: {
    name: 'Disable Accounts',
    level: PermissionLevel.Admin,
  },
  [AdminPanelFeature.SiteStatus]: {
    name: 'Site Status',
    level: PermissionLevel.Support,
  },
  [AdminPanelFeature.UnVerifyAccounts]: {
    name: 'Unverify Accounts',
    level: PermissionLevel.Admin,
  },
};

/** Setup configured guard for admin panel */
class AdminPanelGuard extends Guard<AdminPanelFeature, AdminPanelGroup> {
  constructor() {
    super(defaultAdminPanelPermissions, defaultAdminPanelGroups);
  }
}

export const guard = new AdminPanelGuard();

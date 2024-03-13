/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Guard, Permissions, Groups, MaxPermissionLevel } from './Guard';

/** The header key containing the user group. */
export const USER_GROUP_HEADER = 'remote-groups';

/** The header key containing the user email. */
export const USER_EMAIL_HEADER = 'oidc-claim-id-token-email';

/** Enum of known permission levels. A lower level will indicate increased permissions. */
export enum PermissionLevel {
  Admin = 0,
  Support = 1,
  None = MaxPermissionLevel,
}

/** Enum of known features */

export enum AdminPanelFeature {
  AccountSearch = 'AccountSearch',
  AccountHistory = 'AccountHistory',
  AccountDelete = 'AccountDelete',
  ConnectedServices = 'ConnectedServices',
  LinkedAccounts = 'LinkedAccounts',
  ClearEmailBounces = 'ClearEmailBounces',
  DisableAccount = 'DisableAccount',
  EditLocale = 'EditLocale',
  EnableAccount = 'EnableAccount',
  UnverifyEmail = 'UnverifyEmail',
  UnlinkAccount = 'UnlinkAccount',
  DeleteAccount = 'DeleteAccount',
  RelyingParties = 'RelyingParties',
  RelyingPartiesEditNotes = 'RelyingPartiesEditNotes',
  SendPasswordResetEmail = 'SendPasswordResetEmail',
  UnsubscribeFromMailingLists = 'UnsubscribeFromMailingLists',
}

/** Enum of known user groups */
export enum AdminPanelGroup {
  AdminProd = 'vpn_fxa_admin_panel_prod',
  AdminStage = 'vpn_fxa_admin_panel_stage',
  SupportAgentProd = 'vpn_fxa_supportagent_prod',
  SupportAgentStage = 'vpn_fxa_supportagent_stage',
  None = '',
}

/** Enum for known environment names */
export enum AdminPanelEnv {
  Prod = 'prod',
  Stage = 'stage',
}

const adminPanelGroups: Groups = {
  [AdminPanelGroup.AdminProd]: {
    name: 'Admin',
    header: AdminPanelGroup.AdminProd,
    level: PermissionLevel.Admin,
    env: AdminPanelEnv.Prod,
  },
  [AdminPanelGroup.AdminStage]: {
    name: 'Admin',
    header: AdminPanelGroup.AdminStage,
    level: PermissionLevel.Admin,
    env: AdminPanelEnv.Stage,
  },
  [AdminPanelGroup.SupportAgentProd]: {
    name: 'Support',
    header: AdminPanelGroup.SupportAgentProd,
    level: PermissionLevel.Support,
    env: AdminPanelEnv.Prod,
  },
  [AdminPanelGroup.SupportAgentStage]: {
    name: 'Support',
    header: AdminPanelGroup.SupportAgentStage,
    level: PermissionLevel.Support,
    env: AdminPanelEnv.Stage,
  },
  [AdminPanelGroup.None]: {
    name: 'Unknown',
    header: AdminPanelGroup.None,
    level: PermissionLevel.None,
  },
};

/** Reference to an unknown group which is commonly used as a default state. */
export const unknownGroup = adminPanelGroups[AdminPanelGroup.None];

/** Default state of feature config. */
const defaultAdminPanelPermissions: Permissions = {
  [AdminPanelFeature.AccountSearch]: {
    name: 'Lookup Account By Email/UID',
    level: PermissionLevel.Support,
  },
  [AdminPanelFeature.AccountHistory]: {
    name: 'Account History',
    level: PermissionLevel.Support,
  },
  [AdminPanelFeature.AccountDelete]: {
    name: 'Delete Account By Email/UID',
    level: PermissionLevel.Admin,
  },
  [AdminPanelFeature.ConnectedServices]: {
    name: 'View Active Sessions',
    level: PermissionLevel.Support,
  },
  [AdminPanelFeature.LinkedAccounts]: {
    name: 'View Linked Accounts',
    level: PermissionLevel.Support,
  },
  [AdminPanelFeature.ClearEmailBounces]: {
    name: 'Clear Email Bounces',
    level: PermissionLevel.Support,
  },
  [AdminPanelFeature.DisableAccount]: {
    name: 'Disable Account',
    level: PermissionLevel.Admin,
  },
  [AdminPanelFeature.EditLocale]: {
    name: 'Edit Locale',
    level: PermissionLevel.Support,
  },
  [AdminPanelFeature.EnableAccount]: {
    name: 'Enable Account',
    level: PermissionLevel.Admin,
  },
  [AdminPanelFeature.UnverifyEmail]: {
    name: 'Unconfirm Email Address',
    level: PermissionLevel.Admin,
  },
  [AdminPanelFeature.UnlinkAccount]: {
    name: 'Unlink Account',
    level: PermissionLevel.Admin,
  },
  [AdminPanelFeature.DeleteAccount]: {
    name: 'DeleteAccount Account',
    level: PermissionLevel.Admin,
  },
  [AdminPanelFeature.RelyingParties]: {
    name: 'View Relying Parties',
    level: PermissionLevel.Support,
  },
  [AdminPanelFeature.RelyingPartiesEditNotes]: {
    name: 'Edit Relying Parties Notes',
    level: PermissionLevel.Admin,
  },
  [AdminPanelFeature.SendPasswordResetEmail]: {
    name: 'Send Password Reset Email',
    level: PermissionLevel.Support,
  },
  [AdminPanelFeature.UnsubscribeFromMailingLists]: {
    name: 'Unsubscribe User From Mozilla Mailing Lists',
    level: PermissionLevel.Support,
  },
};

/**
 * Determines the set of valid admin panel groups for a given environment
 * @param env The target environment
 * @returns Set of groups
 */
export function getGroupsByEnv(env?: AdminPanelEnv) {
  return Object.values(adminPanelGroups)
    .filter((x) => env == null || x.env == null || x.env === env)
    .reduce((map: Groups, x) => {
      map[x.header] = x;
      return map;
    }, {});
}

/** Setup configured guard for admin panel */
export class AdminPanelGuard extends Guard<AdminPanelFeature, AdminPanelGroup> {
  protected envToNum(env?: AdminPanelEnv): number {
    return env === 'prod' ? 10 : env === 'stage' ? 20 : 30;
  }

  constructor(env?: AdminPanelEnv) {
    super(defaultAdminPanelPermissions, getGroupsByEnv(env));
  }
}

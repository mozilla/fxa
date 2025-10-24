/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  Guard,
  Permissions,
  Groups,
  MaxPermissionLevel,
  GuardEnv,
} from './guard';

/** The header key containing the user group. */
export const USER_GROUP_HEADER = 'remote-groups';

/** The header key containing the user email. */
export const USER_EMAIL_HEADER = 'oidc-claim-id-token-email';

/** Enum of known permission levels. A lower level will indicate increased permissions. */
export enum PermissionLevel {
  Admin = 0,
  Support = 1,
  DSAR = 2,
  ReadOnly = 3,
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
  Remove2FA = 'Remove2FA',
  UnverifyEmail = 'UnverifyEmail',
  UnlinkAccount = 'UnlinkAccount',
  DeleteAccount = 'DeleteAccount',
  RelyingParties = 'RelyingParties',
  CreateRelyingParty = 'CreateRelyingParty',
  UpdateRelyingParty = 'UpdateRelyingParty',
  DeleteRelyingParty = 'DeleteRelyingParty',
  UnsubscribeFromMailingLists = 'UnsubscribeFromMailingLists',
  RateLimiting = 'RateLimiting',
  DeleteRecoveryPhone = 'DeleteRecoveryPhone',
}

/** Enum of known user groups */
export enum AdminPanelGroup {
  AdminProd = 'vpn_fxa_admin_panel_prod',
  AdminStage = 'vpn_fxa_admin_panel_stage',
  SupportAgentProd = 'vpn_fxa_supportagent_prod',
  SupportAgentStage = 'vpn_fxa_supportagent_stage',
  ReadOnlyProd = 'vpn_fxa_admin_ro_prod',
  ReadOnlyStage = 'vpn_fxa_admin_ro_stage',
  DsarProd = 'vpn_fxa_admin_dsar_prod',
  DsarStage = 'vpn_fxa_admin_dsar_stage',
  None = '',
}

const adminPanelGroups: Groups = {
  [AdminPanelGroup.AdminProd]: {
    name: 'Admin',
    header: AdminPanelGroup.AdminProd,
    level: PermissionLevel.Admin,
    env: GuardEnv.Prod,
  },
  [AdminPanelGroup.AdminStage]: {
    name: 'Admin',
    header: AdminPanelGroup.AdminStage,
    level: PermissionLevel.Admin,
    env: GuardEnv.Stage,
  },
  [AdminPanelGroup.SupportAgentProd]: {
    name: 'Support',
    header: AdminPanelGroup.SupportAgentProd,
    level: PermissionLevel.Support,
    env: GuardEnv.Prod,
  },
  [AdminPanelGroup.SupportAgentStage]: {
    name: 'Support',
    header: AdminPanelGroup.SupportAgentStage,
    level: PermissionLevel.Support,
    env: GuardEnv.Stage,
  },
  [AdminPanelGroup.DsarProd]: {
    name: 'DSAR',
    header: AdminPanelGroup.DsarProd,
    level: PermissionLevel.DSAR,
    env: GuardEnv.Prod,
  },
  [AdminPanelGroup.DsarStage]: {
    name: 'DSAR',
    header: AdminPanelGroup.DsarStage,
    level: PermissionLevel.DSAR,
    env: GuardEnv.Stage,
  },
  [AdminPanelGroup.ReadOnlyProd]: {
    name: 'ReadOnly',
    header: AdminPanelGroup.ReadOnlyProd,
    level: PermissionLevel.ReadOnly,
    env: GuardEnv.Prod,
  },
  [AdminPanelGroup.ReadOnlyStage]: {
    name: 'ReadOnly',
    header: AdminPanelGroup.ReadOnlyStage,
    level: PermissionLevel.ReadOnly,
    env: GuardEnv.Stage,
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
    level: PermissionLevel.ReadOnly,
  },
  [AdminPanelFeature.AccountHistory]: {
    name: 'Account History',
    level: PermissionLevel.ReadOnly,
  },
  [AdminPanelFeature.AccountDelete]: {
    name: 'Delete Account By Email/UID',
    level: PermissionLevel.DSAR,
  },
  [AdminPanelFeature.ConnectedServices]: {
    name: 'View Active Sessions',
    level: PermissionLevel.ReadOnly,
  },
  [AdminPanelFeature.LinkedAccounts]: {
    name: 'View Linked Accounts',
    level: PermissionLevel.ReadOnly,
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
  [AdminPanelFeature.Remove2FA]: {
    name: 'Reset 2FA',
    level: PermissionLevel.Support,
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
    level: PermissionLevel.DSAR,
  },
  [AdminPanelFeature.RelyingParties]: {
    name: 'View Relying Parties',
    level: PermissionLevel.Support,
  },
  [AdminPanelFeature.CreateRelyingParty]: {
    name: 'Edit Relying Parties Notes',
    level: PermissionLevel.Admin,
  },
  [AdminPanelFeature.DeleteRelyingParty]: {
    name: 'Edit Relying Parties Notes',
    level: PermissionLevel.Admin,
  },
  [AdminPanelFeature.UpdateRelyingParty]: {
    name: 'Edit Relying Parties Notes',
    level: PermissionLevel.Admin,
  },
  [AdminPanelFeature.UnsubscribeFromMailingLists]: {
    name: 'Unsubscribe User From Mozilla Mailing Lists',
    level: PermissionLevel.Support,
  },
  [AdminPanelFeature.RateLimiting]: {
    name: 'View Rate Limiting Blocks and Bans',
    level: PermissionLevel.Support,
  },
  [AdminPanelFeature.DeleteRecoveryPhone]: {
    name: 'Delete Recovery Phone',
    level: PermissionLevel.Admin,
  },
};

/**
 * Determines the set of valid admin panel groups for a given environment
 * @param env The target environment
 * @returns Set of groups
 */
export function getGroupsByEnv(env?: GuardEnv) {
  return Object.values(adminPanelGroups)
    .filter((x) => env == null || x.env == null || x.env === env)
    .reduce((map: Groups, x) => {
      map[x.header] = x;
      return map;
    }, {});
}

/** Setup configured guard for admin panel */
export class AdminPanelGuard extends Guard<AdminPanelFeature, AdminPanelGroup> {
  protected envToNum(env?: GuardEnv): number {
    return env === 'prod' ? 10 : env === 'stage' ? 20 : 30;
  }

  constructor(env?: GuardEnv) {
    super(defaultAdminPanelPermissions, getGroupsByEnv(env));
  }
}

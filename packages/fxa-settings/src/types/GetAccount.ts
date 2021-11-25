/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetAccount
// ====================================================

export interface GetAccount_account_avatar {
  /**
   * ID for the user's avatar.
   */
  id: string | null;
  /**
   * url for the user's avatar.
   */
  url: string | null;
  isDefault: boolean;
}

export interface GetAccount_account_primaryEmail {
  /**
   * The email address.
   */
  email: string;
}

export interface GetAccount_account_emails {
  /**
   * The email address.
   */
  email: string;
  /**
   * Whether or not the email is the primary email.
   */
  isPrimary: boolean;
  /**
   * Whether or not the email is verified.
   */
  verified: boolean;
}

export interface GetAccount_account_totp {
  /**
   * Whether a TOTP token exists for the user.
   */
  exists: boolean;
  /**
   * Whether the current session was verified with the TOTP token.
   */
  verified: boolean;
}

export interface GetAccount_account_subscriptions {
  created: number | null;
  productName: string;
}

export interface GetAccount_account_attachedClients_location {
  city: string | null;
  country: string | null;
  state: string | null;
  stateCode: string | null;
}

export interface GetAccount_account_attachedClients {
  clientId: string | null;
  isCurrentSession: boolean;
  userAgent: string;
  deviceType: string | null;
  deviceId: string | null;
  name: string | null;
  lastAccessTime: number | null;
  lastAccessTimeFormatted: string | null;
  approximateLastAccessTime: number | null;
  approximateLastAccessTimeFormatted: string | null;
  location: GetAccount_account_attachedClients_location | null;
  os: string | null;
  sessionTokenId: string | null;
  refreshTokenId: string | null;
}

export interface GetAccount_account {
  /**
   * Firefox Account User ID.
   */
  uid: string;
  /**
   * Display name the user has set.
   */
  displayName: string | null;
  avatar: GetAccount_account_avatar;
  /**
   * Timestamp when the account was created.
   */
  accountCreated: number;
  /**
   * Timestamp the password was created or last changed.
   */
  passwordCreated: number;
  /**
   * Whether the user has had a recovery key issued.
   */
  recoveryKey: boolean;
  /**
   * Whether metrics are enabled and may be reported
   */
  metricsEnabled: boolean;
  primaryEmail: GetAccount_account_primaryEmail;
  /**
   * Email addresses for the user.
   */
  emails: GetAccount_account_emails[];
  totp: GetAccount_account_totp;
  /**
   * Active subscriptions for the user.
   */
  subscriptions: GetAccount_account_subscriptions[];
  /**
   * Client sessions attached to the user.
   */
  attachedClients: GetAccount_account_attachedClients[];
}

export interface GetAccount {
  account: GetAccount_account | null;
}

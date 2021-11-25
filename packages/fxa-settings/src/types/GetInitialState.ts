/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetInitialState
// ====================================================

export interface GetInitialState_account_avatar {
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

export interface GetInitialState_account_primaryEmail {
  /**
   * The email address.
   */
  email: string;
}

export interface GetInitialState_account_emails {
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

export interface GetInitialState_account_totp {
  /**
   * Whether a TOTP token exists for the user.
   */
  exists: boolean;
  /**
   * Whether the current session was verified with the TOTP token.
   */
  verified: boolean;
}

export interface GetInitialState_account_subscriptions {
  created: number | null;
  productName: string;
}

export interface GetInitialState_account {
  /**
   * Firefox Account User ID.
   */
  uid: string;
  /**
   * Display name the user has set.
   */
  displayName: string | null;
  avatar: GetInitialState_account_avatar;
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
  primaryEmail: GetInitialState_account_primaryEmail;
  /**
   * Email addresses for the user.
   */
  emails: GetInitialState_account_emails[];
  totp: GetInitialState_account_totp;
  /**
   * Active subscriptions for the user.
   */
  subscriptions: GetInitialState_account_subscriptions[];
}

export interface GetInitialState_session {
  /**
   * Whether the current session is verified
   */
  verified: boolean;
}

export interface GetInitialState {
  account: GetInitialState_account | null;
  session: GetInitialState_session;
}

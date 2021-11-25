/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: accountFields
// ====================================================

export interface accountFields_avatar {
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

export interface accountFields_primaryEmail {
  /**
   * The email address.
   */
  email: string;
}

export interface accountFields_emails {
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

export interface accountFields_totp {
  /**
   * Whether a TOTP token exists for the user.
   */
  exists: boolean;
  /**
   * Whether the current session was verified with the TOTP token.
   */
  verified: boolean;
}

export interface accountFields_subscriptions {
  created: number | null;
  productName: string;
}

export interface accountFields {
  /**
   * Firefox Account User ID.
   */
  uid: string;
  /**
   * Display name the user has set.
   */
  displayName: string | null;
  avatar: accountFields_avatar;
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
  primaryEmail: accountFields_primaryEmail;
  /**
   * Email addresses for the user.
   */
  emails: accountFields_emails[];
  totp: accountFields_totp;
  /**
   * Active subscriptions for the user.
   */
  subscriptions: accountFields_subscriptions[];
}

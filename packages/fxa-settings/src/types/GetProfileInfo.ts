/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetProfileInfo
// ====================================================

export interface GetProfileInfo_account_avatar {
  /**
   * ID for the user's avatar.
   */
  id: string | null;
  /**
   * url for the user's avatar.
   */
  url: string | null;
}

export interface GetProfileInfo_account_primaryEmail {
  /**
   * The email address.
   */
  email: string;
}

export interface GetProfileInfo_account_emails {
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

export interface GetProfileInfo_account {
  /**
   * Firefox Account User ID.
   */
  uid: string;
  /**
   * Display name the user has set.
   */
  displayName: string | null;
  avatar: GetProfileInfo_account_avatar;
  primaryEmail: GetProfileInfo_account_primaryEmail;
  /**
   * Email addresses for the user.
   */
  emails: GetProfileInfo_account_emails[];
}

export interface GetProfileInfo {
  account: GetProfileInfo_account | null;
}

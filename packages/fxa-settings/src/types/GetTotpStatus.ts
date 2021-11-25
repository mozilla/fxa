/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetTotpStatus
// ====================================================

export interface GetTotpStatus_account_totp {
  /**
   * Whether a TOTP token exists for the user.
   */
  exists: boolean;
  /**
   * Whether the current session was verified with the TOTP token.
   */
  verified: boolean;
}

export interface GetTotpStatus_account {
  totp: GetTotpStatus_account_totp;
}

export interface GetTotpStatus {
  account: GetTotpStatus_account | null;
}

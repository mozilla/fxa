/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: UpdatePassword
// ====================================================

export interface UpdatePassword_account {
  /**
   * Timestamp the password was created or last changed.
   */
  passwordCreated: number;
}

export interface UpdatePassword_session {
  /**
   * Whether the current session is verified
   */
  verified: boolean;
}

export interface UpdatePassword {
  account: UpdatePassword_account | null;
  session: UpdatePassword_session;
}

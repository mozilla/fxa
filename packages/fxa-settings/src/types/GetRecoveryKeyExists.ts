/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetRecoveryKeyExists
// ====================================================

export interface GetRecoveryKeyExists_account {
  /**
   * Whether the user has had a recovery key issued.
   */
  recoveryKey: boolean;
}

export interface GetRecoveryKeyExists {
  account: GetRecoveryKeyExists_account | null;
}

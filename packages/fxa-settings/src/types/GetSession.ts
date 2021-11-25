/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetSession
// ====================================================

export interface GetSession_session {
  /**
   * Whether the current session is verified
   */
  verified: boolean;
  token: string;
}

export interface GetSession {
  session: GetSession_session;
}

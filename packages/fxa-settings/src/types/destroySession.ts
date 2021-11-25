/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DestroySessionInput } from './globalTypes';

// ====================================================
// GraphQL mutation operation: destroySession
// ====================================================

export interface destroySession_destroySession {
  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null;
}

export interface destroySession {
  /**
   * Logs out the current session
   */
  destroySession: destroySession_destroySession;
}

export interface destroySessionVariables {
  input: DestroySessionInput;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { AttachedClientDisconnectInput } from './globalTypes';

// ====================================================
// GraphQL mutation operation: attachedClientDisconnect
// ====================================================

export interface attachedClientDisconnect_attachedClientDisconnect {
  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null;
}

export interface attachedClientDisconnect {
  /**
   * Destroy all tokens held by a connected client, disconnecting it from the user's account.
   */
  attachedClientDisconnect: attachedClientDisconnect_attachedClientDisconnect;
}

export interface attachedClientDisconnectVariables {
  input: AttachedClientDisconnectInput;
}

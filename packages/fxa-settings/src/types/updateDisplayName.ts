/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UpdateDisplayNameInput } from './globalTypes';

// ====================================================
// GraphQL mutation operation: updateDisplayName
// ====================================================

export interface updateDisplayName_updateDisplayName {
  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null;
}

export interface updateDisplayName {
  /**
   * Update the display name.
   */
  updateDisplayName: updateDisplayName_updateDisplayName;
}

export interface updateDisplayNameVariables {
  input: UpdateDisplayNameInput;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { DeleteAvatarInput } from './globalTypes';

// ====================================================
// GraphQL mutation operation: deleteAvatar
// ====================================================

export interface deleteAvatar_deleteAvatar {
  /**
   * A unique identifier for the client performing the mutation.
   */
  clientMutationId: string | null;
}

export interface deleteAvatar {
  /**
   * Delete the avatar.
   */
  deleteAvatar: deleteAvatar_deleteAvatar;
}

export interface deleteAvatarVariables {
  input: DeleteAvatarInput;
}

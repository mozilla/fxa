/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export interface AttachedClientDisconnectInput {
  clientMutationId?: string | null;
  clientId?: string | null;
  sessionTokenId?: string | null;
  refreshTokenId?: string | null;
  deviceId?: string | null;
}

export interface DeleteAvatarInput {
  clientMutationId?: string | null;
  id: string;
}

export interface DestroySessionInput {
  clientMutationId?: string | null;
}

export interface MetricsOptInput {
  clientMutationId?: string | null;
  state: string;
}

export interface UpdateDisplayNameInput {
  clientMutationId?: string | null;
  displayName?: string | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: attachedClientsFields
// ====================================================

export interface attachedClientsFields_attachedClients_location {
  city: string | null;
  country: string | null;
  state: string | null;
  stateCode: string | null;
}

export interface attachedClientsFields_attachedClients {
  clientId: string | null;
  isCurrentSession: boolean;
  userAgent: string;
  deviceType: string | null;
  deviceId: string | null;
  name: string | null;
  lastAccessTime: number | null;
  lastAccessTimeFormatted: string | null;
  approximateLastAccessTime: number | null;
  approximateLastAccessTimeFormatted: string | null;
  location: attachedClientsFields_attachedClients_location | null;
  os: string | null;
  sessionTokenId: string | null;
  refreshTokenId: string | null;
}

export interface attachedClientsFields {
  /**
   * Client sessions attached to the user.
   */
  attachedClients: attachedClientsFields_attachedClients[];
}

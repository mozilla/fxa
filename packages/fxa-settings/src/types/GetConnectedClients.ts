/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetConnectedClients
// ====================================================

export interface GetConnectedClients_account_attachedClients_location {
  city: string | null;
  country: string | null;
  state: string | null;
  stateCode: string | null;
}

export interface GetConnectedClients_account_attachedClients {
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
  location: GetConnectedClients_account_attachedClients_location | null;
  os: string | null;
  sessionTokenId: string | null;
  refreshTokenId: string | null;
}

export interface GetConnectedClients_account {
  /**
   * Client sessions attached to the user.
   */
  attachedClients: GetConnectedClients_account_attachedClients[];
}

export interface GetConnectedClients {
  account: GetConnectedClients_account | null;
}

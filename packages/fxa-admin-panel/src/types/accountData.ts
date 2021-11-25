/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { BounceType, BounceSubType } from './globalTypes';

// ====================================================
// GraphQL fragment: accountData
// ====================================================

export interface accountData_emails {
  email: string;
  isVerified: boolean;
  isPrimary: boolean;
  createdAt: number;
}

export interface accountData_emailBounces {
  email: string;
  createdAt: number;
  bounceType: BounceType;
  bounceSubType: BounceSubType;
}

export interface accountData_securityEvents {
  uid: string | null;
  nameId: number | null;
  verified: boolean | null;
  createdAt: number | null;
  name: string | null;
}

export interface accountData_totp {
  verified: boolean;
  createdAt: number;
  enabled: boolean;
}

export interface accountData_recoveryKeys {
  createdAt: number | null;
  verifiedAt: number | null;
  enabled: boolean | null;
}

export interface accountData_sessionTokens {
  tokenId: string | null;
  uid: string | null;
  createdAt: number | null;
  uaBrowser: string | null;
  uaBrowserVersion: string | null;
  uaOS: string | null;
  uaOSVersion: string | null;
  uaDeviceType: string | null;
  lastAccessTime: number | null;
}

export interface accountData {
  uid: string;
  createdAt: number;
  disabledAt: number | null;
  emails: accountData_emails[] | null;
  emailBounces: accountData_emailBounces[] | null;
  securityEvents: accountData_securityEvents[] | null;
  totp: accountData_totp[] | null;
  recoveryKeys: accountData_recoveryKeys[] | null;
  sessionTokens: accountData_sessionTokens[] | null;
}

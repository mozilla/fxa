/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { BounceType, BounceSubType } from './globalTypes';

// ====================================================
// GraphQL query operation: getAccountByUid
// ====================================================

export interface getAccountByUid_accountByUid_emails {
  email: string;
  isVerified: boolean;
  isPrimary: boolean;
  createdAt: number;
}

export interface getAccountByUid_accountByUid_emailBounces {
  email: string;
  createdAt: number;
  bounceType: BounceType;
  bounceSubType: BounceSubType;
}

export interface getAccountByUid_accountByUid_securityEvents {
  uid: string | null;
  nameId: number | null;
  verified: boolean | null;
  createdAt: number | null;
  name: string | null;
}

export interface getAccountByUid_accountByUid_totp {
  verified: boolean;
  createdAt: number;
  enabled: boolean;
}

export interface getAccountByUid_accountByUid_recoveryKeys {
  createdAt: number | null;
  verifiedAt: number | null;
  enabled: boolean | null;
}

export interface getAccountByUid_accountByUid_sessionTokens {
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

export interface getAccountByUid_accountByUid {
  uid: string;
  createdAt: number;
  disabledAt: number | null;
  emails: getAccountByUid_accountByUid_emails[] | null;
  emailBounces: getAccountByUid_accountByUid_emailBounces[] | null;
  securityEvents: getAccountByUid_accountByUid_securityEvents[] | null;
  totp: getAccountByUid_accountByUid_totp[] | null;
  recoveryKeys: getAccountByUid_accountByUid_recoveryKeys[] | null;
  sessionTokens: getAccountByUid_accountByUid_sessionTokens[] | null;
}

export interface getAccountByUid {
  accountByUid: getAccountByUid_accountByUid | null;
}

export interface getAccountByUidVariables {
  uid: string;
}

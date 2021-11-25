/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { BounceType, BounceSubType } from './globalTypes';

// ====================================================
// GraphQL query operation: getAccountByEmail
// ====================================================

export interface getAccountByEmail_accountByEmail_emails {
  email: string;
  isVerified: boolean;
  isPrimary: boolean;
  createdAt: number;
}

export interface getAccountByEmail_accountByEmail_emailBounces {
  email: string;
  createdAt: number;
  bounceType: BounceType;
  bounceSubType: BounceSubType;
}

export interface getAccountByEmail_accountByEmail_securityEvents {
  uid: string | null;
  nameId: number | null;
  verified: boolean | null;
  createdAt: number | null;
  name: string | null;
}

export interface getAccountByEmail_accountByEmail_totp {
  verified: boolean;
  createdAt: number;
  enabled: boolean;
}

export interface getAccountByEmail_accountByEmail_recoveryKeys {
  createdAt: number | null;
  verifiedAt: number | null;
  enabled: boolean | null;
}

export interface getAccountByEmail_accountByEmail_sessionTokens {
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

export interface getAccountByEmail_accountByEmail {
  uid: string;
  createdAt: number;
  disabledAt: number | null;
  emails: getAccountByEmail_accountByEmail_emails[] | null;
  emailBounces: getAccountByEmail_accountByEmail_emailBounces[] | null;
  securityEvents: getAccountByEmail_accountByEmail_securityEvents[] | null;
  totp: getAccountByEmail_accountByEmail_totp[] | null;
  recoveryKeys: getAccountByEmail_accountByEmail_recoveryKeys[] | null;
  sessionTokens: getAccountByEmail_accountByEmail_sessionTokens[] | null;
}

export interface getAccountByEmail {
  accountByEmail: getAccountByEmail_accountByEmail | null;
}

export interface getAccountByEmailVariables {
  email: string;
}

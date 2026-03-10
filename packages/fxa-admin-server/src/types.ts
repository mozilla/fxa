/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Shared TypeScript types for fxa-admin-server REST API.
 * These replace the auto-generated GraphQL types previously in src/graphql.ts.
 * Imported by fxa-admin-panel.
 */

export enum BounceType {
  unmapped,
  Permanent,
  Transient,
  Complaint,
  Undetermined,
}

export enum BounceSubType {
  unmapped,
  Undetermined,
  General,
  NoEmail,
  Suppressed,
  MailboxFull,
  MessageTooLarge,
  ContentRejected,
  AttachmentRejected,
  Abuse,
  AuthFailure,
  Fraud,
  NotSpam,
  Other,
  Virus,
  OnAccountSuppressionList,
}

export interface Email {
  email: string;
  isVerified: boolean;
  isPrimary: boolean;
  createdAt: number;
}

export interface EmailBounce {
  email: string;
  templateName: string;
  bounceType: string;
  bounceSubType: string;
  createdAt: number;
  diagnosticCode?: string;
}

export interface SecurityEvents {
  uid?: string;
  nameId?: number;
  verified?: boolean;
  ipAddrHmac?: string;
  createdAt?: number;
  tokenVerificationId?: string;
  name?: string;
  ipAddr?: string;
  additionalInfo?: string;
}

export interface AccountEvent {
  name?: string;
  createdAt?: number;
  eventType?: string;
  template?: string;
  flowId?: string;
  service?: string;
}

export interface Totp {
  verified: boolean;
  createdAt: number;
  enabled: boolean;
}

export interface RecoveryKeys {
  uid?: string;
  createdAt?: number;
  verifiedAt?: number;
  enabled?: boolean;
  hint?: string;
}

export interface BackupCodes {
  hasBackupCodes: boolean;
  count: number;
}

export interface RecoveryPhone {
  exists: boolean;
  lastFourDigits?: string;
}

export interface LinkedAccount {
  uid?: string;
  authAt?: number;
  providerId?: number;
  enabled?: boolean;
}

export interface Location {
  city?: string;
  country?: string;
  countryCode?: string;
  state?: string;
  stateCode?: string;
}

export interface AttachedClient {
  clientId?: string;
  deviceId?: string;
  sessionTokenId?: string;
  refreshTokenId?: string;
  isCurrentSession?: boolean;
  deviceType?: string;
  name?: string;
  scope?: string[];
  location?: Location;
  userAgent?: string;
  os?: string;
  createdTime?: number;
  createdTimeFormatted?: string;
  lastAccessTime?: number;
  lastAccessTimeFormatted?: string;
  approximateLastAccessTime?: number;
  approximateLastAccessTimeFormatted?: string;
}

export interface MozSubscription {
  created: number;
  currentPeriodEnd: number;
  currentPeriodStart: number;
  cancelAtPeriodEnd: boolean;
  endedAt?: number;
  latestInvoice: string;
  manageSubscriptionLink?: string;
  planId: string;
  productName: string;
  productId: string;
  status: string;
  subscriptionId: string;
}

export interface TaxAddress {
  countryCode: string;
  postalCode: string;
}

export interface Cart {
  id: string;
  uid?: string;
  state: string;
  errorReasonId?: string;
  offeringConfigId: string;
  interval: string;
  experiment?: string;
  taxAddress?: TaxAddress;
  currency?: string;
  createdAt: number;
  updatedAt: number;
  couponCode?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  amount: number;
  version: number;
  eligibilityStatus: string;
}

export interface Account {
  uid: string;
  email: string;
  emailVerified: boolean;
  clientSalt?: string;
  createdAt: number;
  disabledAt?: number;
  locale?: string;
  lockedAt?: number;
  verifierSetAt?: number;
  emails: Email[];
  emailBounces: EmailBounce[];
  totp: Totp[];
  recoveryKeys: RecoveryKeys[];
  securityEvents: SecurityEvents[];
  attachedClients: AttachedClient[];
  subscriptions: MozSubscription[];
  linkedAccounts: LinkedAccount[];
  accountEvents: AccountEvent[];
  carts: Cart[];
  backupCodes: BackupCodes[];
  recoveryPhone: RecoveryPhone[];
}

export interface RelyingPartyUpdateDto {
  name: string;
  imageUri: string;
  redirectUri: string;
  canGrant: boolean;
  publicClient: boolean;
  trusted: boolean;
  allowedScopes: string;
  notes: string;
}

export interface RelyingPartyDto {
  id: string;
  createdAt: number;
  name: string;
  imageUri: string;
  redirectUri: string;
  canGrant: boolean;
  publicClient: boolean;
  trusted: boolean;
  allowedScopes: string;
  notes: string;
  hasSecret: boolean;
  hasPreviousSecret: boolean;
}

export interface RelyingPartyCreatedDto {
  id: string;
  secret: string;
}

export interface RotateSecretDto {
  secret: string;
}

export interface BlockStatus {
  retryAfter: number;
  reason: string;
  action: string;
  blockingOn: string;
  startTime: number;
  duration: number;
  attempt: number;
  policy: string;
}

export enum AccountDeleteStatus {
  Success = 'Success',
  Failure = 'Failure',
  NoAccount = 'No account found',
}

export interface AccountDeleteResponse {
  taskName: string;
  locator: string;
  status: AccountDeleteStatus;
}

export interface AccountDeleteTaskStatus {
  taskName: string;
  status: string;
}

export enum AccountResetStatus {
  Success = 'Success',
  Failure = 'Failure',
  NoAccount = 'No account found',
}

export interface AccountResetResponse {
  locator: string;
  status: AccountResetStatus;
}

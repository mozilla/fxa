/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */
export enum BounceType {
  unmapped = 'unmapped',
  Permanent = 'Permanent',
  Transient = 'Transient',
  Complaint = 'Complaint',
}

export enum BounceSubType {
  unmapped = 'unmapped',
  Undetermined = 'Undetermined',
  General = 'General',
  NoEmail = 'NoEmail',
  Suppressed = 'Suppressed',
  MailboxFull = 'MailboxFull',
  MessageTooLarge = 'MessageTooLarge',
  ContentRejected = 'ContentRejected',
  AttachmentRejected = 'AttachmentRejected',
  Abuse = 'Abuse',
  AuthFailure = 'AuthFailure',
  Fraud = 'Fraud',
  NotSpam = 'NotSpam',
  Other = 'Other',
  Virus = 'Virus',
}

export enum ProviderId {
  unmapped = 'unmapped',
  GOOGLE = 'GOOGLE',
  APPLE = 'APPLE',
}

export interface Location {
  city?: Nullable<string>;
  country?: Nullable<string>;
  countryCode?: Nullable<string>;
  state?: Nullable<string>;
  stateCode?: Nullable<string>;
}

export interface AttachedClient {
  clientId?: Nullable<string>;
  deviceId?: Nullable<string>;
  sessionTokenId?: Nullable<string>;
  refreshTokenId?: Nullable<string>;
  isCurrentSession?: Nullable<boolean>;
  deviceType?: Nullable<string>;
  name?: Nullable<string>;
  scope?: Nullable<string[]>;
  location?: Nullable<Location>;
  userAgent?: Nullable<string>;
  os?: Nullable<string>;
  createdTime?: Nullable<number>;
  createdTimeFormatted?: Nullable<string>;
  lastAccessTime?: Nullable<number>;
  lastAccessTimeFormatted?: Nullable<string>;
  approximateLastAccessTime?: Nullable<number>;
  approximateLastAccessTimeFormatted?: Nullable<string>;
}

export interface EmailBounce {
  email: string;
  templateName: string;
  bounceType: BounceType;
  bounceSubType: BounceSubType;
  createdAt: number;
}

export interface Email {
  email: string;
  isVerified: boolean;
  isPrimary: boolean;
  createdAt: number;
}

export interface RecoveryKeys {
  createdAt?: Nullable<number>;
  verifiedAt?: Nullable<number>;
  enabled?: Nullable<boolean>;
}

export interface SecurityEvents {
  uid?: Nullable<string>;
  nameId?: Nullable<number>;
  verified?: Nullable<boolean>;
  ipAddrHmac?: Nullable<string>;
  createdAt?: Nullable<number>;
  tokenVerificationId?: Nullable<string>;
  name?: Nullable<string>;
}

export interface Totp {
  verified: boolean;
  createdAt: number;
  enabled: boolean;
}

export interface LinkedAccount {
  uid: string;
  authAt: number;
  providerId: ProviderId;
  enabled: boolean;
}

export interface Account {
  uid: string;
  email: string;
  emailVerified: boolean;
  createdAt: number;
  disabledAt?: Nullable<number>;
  emails?: Nullable<Email[]>;
  emailBounces?: Nullable<EmailBounce[]>;
  totp?: Nullable<Totp[]>;
  recoveryKeys?: Nullable<RecoveryKeys[]>;
  securityEvents?: Nullable<SecurityEvents[]>;
  attachedClients?: Nullable<AttachedClient[]>;
  linkedAccounts?: Nullable<LinkedAccount[]>;
}

export interface IQuery {
  accountByUid(uid: string): Nullable<Account> | Promise<Nullable<Account>>;
  accountByEmail(email: string): Nullable<Account> | Promise<Nullable<Account>>;
  getEmailsLike(search: string): Nullable<Email[]> | Promise<Nullable<Email[]>>;
}

export interface IMutation {
  unverifyEmail(email: string): boolean | Promise<boolean>;
  disableAccount(uid: string): boolean | Promise<boolean>;
  unlinkAccount(uid: string): boolean | Promise<boolean>;
  clearEmailBounce(email: string): boolean | Promise<boolean>;
}

type Nullable<T> = T | null;

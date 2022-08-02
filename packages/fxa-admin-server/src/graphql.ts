
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */
export enum BounceType {
    unmapped = "unmapped",
    Undetermined = "Undetermined",
    Permanent = "Permanent",
    Transient = "Transient",
    Complaint = "Complaint"
}

export enum BounceSubType {
    unmapped = "unmapped",
    Undetermined = "Undetermined",
    General = "General",
    NoEmail = "NoEmail",
    OnAccountSuppressionList = "OnAccountSuppressionList",
    Suppressed = "Suppressed",
    MailboxFull = "MailboxFull",
    MessageTooLarge = "MessageTooLarge",
    ContentRejected = "ContentRejected",
    AttachmentRejected = "AttachmentRejected",
    Abuse = "Abuse",
    AuthFailure = "AuthFailure",
    Fraud = "Fraud",
    NotSpam = "NotSpam",
    Other = "Other",
    Virus = "Virus"
}

export enum ProviderId {
    unmapped = "unmapped",
    GOOGLE = "GOOGLE",
    APPLE = "APPLE"
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
    diagnosticCode: string;
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

export interface MozSubscription {
    created: number;
    currentPeriodEnd: number;
    currentPeriodStart: number;
    cancelAtPeriodEnd: boolean;
    endedAt?: Nullable<number>;
    latestInvoice: string;
    manageSubscriptionLink?: Nullable<string>;
    planId: string;
    productName: string;
    productId: string;
    status: string;
    subscriptionId: string;
}

export interface Account {
    uid: string;
    email: string;
    emailVerified: boolean;
    createdAt: number;
    disabledAt?: Nullable<number>;
    lockedAt?: Nullable<number>;
    emails?: Nullable<Email[]>;
    emailBounces?: Nullable<EmailBounce[]>;
    totp?: Nullable<Totp[]>;
    recoveryKeys?: Nullable<RecoveryKeys[]>;
    securityEvents?: Nullable<SecurityEvents[]>;
    attachedClients?: Nullable<AttachedClient[]>;
    subscriptions?: Nullable<MozSubscription[]>;
    linkedAccounts?: Nullable<LinkedAccount[]>;
}

export interface RelyingParty {
    id: string;
    name: string;
    imageUri: string;
    redirectUri: string;
    canGrant: boolean;
    publicClient: boolean;
    createdAt: number;
    trusted: boolean;
    allowedScopes?: Nullable<string>;
}

export interface IQuery {
    accountByUid(uid: string): Nullable<Account> | Promise<Nullable<Account>>;
    accountByEmail(autoCompleted: boolean, email: string): Nullable<Account> | Promise<Nullable<Account>>;
    getEmailsLike(search: string): Nullable<Email[]> | Promise<Nullable<Email[]>>;
    relyingParties(): RelyingParty[] | Promise<RelyingParty[]>;
}

export interface IMutation {
    unverifyEmail(email: string): boolean | Promise<boolean>;
    disableAccount(uid: string): boolean | Promise<boolean>;
    enableAccount(uid: string): boolean | Promise<boolean>;
    recordAdminSecurityEvent(name: string, uid: string): boolean | Promise<boolean>;
    unlinkAccount(uid: string): boolean | Promise<boolean>;
    clearEmailBounce(email: string): boolean | Promise<boolean>;
}

type Nullable<T> = T | null;

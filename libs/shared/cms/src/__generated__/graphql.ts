/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  DateTime: { input: any; output: any; }
  /** A string used to identify an i18n locale */
  I18NLocaleCode: { input: any; output: any; }
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: { input: any; output: any; }
};

export type BooleanFilterInput = {
  and: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  between: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  contains: InputMaybe<Scalars['Boolean']['input']>;
  containsi: InputMaybe<Scalars['Boolean']['input']>;
  endsWith: InputMaybe<Scalars['Boolean']['input']>;
  eq: InputMaybe<Scalars['Boolean']['input']>;
  eqi: InputMaybe<Scalars['Boolean']['input']>;
  gt: InputMaybe<Scalars['Boolean']['input']>;
  gte: InputMaybe<Scalars['Boolean']['input']>;
  in: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  lt: InputMaybe<Scalars['Boolean']['input']>;
  lte: InputMaybe<Scalars['Boolean']['input']>;
  ne: InputMaybe<Scalars['Boolean']['input']>;
  nei: InputMaybe<Scalars['Boolean']['input']>;
  not: InputMaybe<BooleanFilterInput>;
  notContains: InputMaybe<Scalars['Boolean']['input']>;
  notContainsi: InputMaybe<Scalars['Boolean']['input']>;
  notIn: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  notNull: InputMaybe<Scalars['Boolean']['input']>;
  null: InputMaybe<Scalars['Boolean']['input']>;
  or: InputMaybe<Array<InputMaybe<Scalars['Boolean']['input']>>>;
  startsWith: InputMaybe<Scalars['Boolean']['input']>;
};

export type CancelInterstitialOffer = {
  __typename?: 'CancelInterstitialOffer';
  advertisedSavings: Scalars['Int']['output'];
  createdAt: Maybe<Scalars['DateTime']['output']>;
  ctaMessage: Scalars['String']['output'];
  currentInterval: Enum_Cancelinterstitialoffer_Currentinterval;
  documentId: Scalars['ID']['output'];
  internalName: Scalars['String']['output'];
  locale: Maybe<Scalars['String']['output']>;
  localizations: Array<Maybe<CancelInterstitialOffer>>;
  localizations_connection: Maybe<CancelInterstitialOfferRelationResponseCollection>;
  modalHeading1: Scalars['String']['output'];
  modalHeading2: Maybe<Scalars['String']['output']>;
  modalMessage: Scalars['String']['output'];
  offering: Maybe<Offering>;
  offeringApiIdentifier: Scalars['String']['output'];
  productPageUrl: Scalars['String']['output'];
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
  upgradeButtonLabel: Scalars['String']['output'];
  upgradeButtonUrl: Scalars['String']['output'];
  upgradeInterval: Enum_Cancelinterstitialoffer_Upgradeinterval;
};


export type CancelInterstitialOfferLocalizationsArgs = {
  filters: InputMaybe<CancelInterstitialOfferFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type CancelInterstitialOfferLocalizations_ConnectionArgs = {
  filters: InputMaybe<CancelInterstitialOfferFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type CancelInterstitialOfferEntityResponseCollection = {
  __typename?: 'CancelInterstitialOfferEntityResponseCollection';
  nodes: Array<CancelInterstitialOffer>;
  pageInfo: Pagination;
};

export type CancelInterstitialOfferFiltersInput = {
  advertisedSavings: InputMaybe<IntFilterInput>;
  and: InputMaybe<Array<InputMaybe<CancelInterstitialOfferFiltersInput>>>;
  createdAt: InputMaybe<DateTimeFilterInput>;
  ctaMessage: InputMaybe<StringFilterInput>;
  currentInterval: InputMaybe<StringFilterInput>;
  documentId: InputMaybe<IdFilterInput>;
  internalName: InputMaybe<StringFilterInput>;
  locale: InputMaybe<StringFilterInput>;
  localizations: InputMaybe<CancelInterstitialOfferFiltersInput>;
  modalHeading1: InputMaybe<StringFilterInput>;
  modalHeading2: InputMaybe<StringFilterInput>;
  modalMessage: InputMaybe<StringFilterInput>;
  not: InputMaybe<CancelInterstitialOfferFiltersInput>;
  offering: InputMaybe<OfferingFiltersInput>;
  offeringApiIdentifier: InputMaybe<StringFilterInput>;
  or: InputMaybe<Array<InputMaybe<CancelInterstitialOfferFiltersInput>>>;
  productPageUrl: InputMaybe<StringFilterInput>;
  publishedAt: InputMaybe<DateTimeFilterInput>;
  updatedAt: InputMaybe<DateTimeFilterInput>;
  upgradeButtonLabel: InputMaybe<StringFilterInput>;
  upgradeButtonUrl: InputMaybe<StringFilterInput>;
  upgradeInterval: InputMaybe<StringFilterInput>;
};

export type CancelInterstitialOfferInput = {
  advertisedSavings: InputMaybe<Scalars['Int']['input']>;
  ctaMessage: InputMaybe<Scalars['String']['input']>;
  currentInterval: InputMaybe<Enum_Cancelinterstitialoffer_Currentinterval>;
  internalName: InputMaybe<Scalars['String']['input']>;
  modalHeading1: InputMaybe<Scalars['String']['input']>;
  modalHeading2: InputMaybe<Scalars['String']['input']>;
  modalMessage: InputMaybe<Scalars['String']['input']>;
  offering: InputMaybe<Scalars['ID']['input']>;
  offeringApiIdentifier: InputMaybe<Scalars['String']['input']>;
  productPageUrl: InputMaybe<Scalars['String']['input']>;
  publishedAt: InputMaybe<Scalars['DateTime']['input']>;
  upgradeButtonLabel: InputMaybe<Scalars['String']['input']>;
  upgradeButtonUrl: InputMaybe<Scalars['String']['input']>;
  upgradeInterval: InputMaybe<Enum_Cancelinterstitialoffer_Upgradeinterval>;
};

export type CancelInterstitialOfferRelationResponseCollection = {
  __typename?: 'CancelInterstitialOfferRelationResponseCollection';
  nodes: Array<CancelInterstitialOffer>;
};

export type Capability = {
  __typename?: 'Capability';
  createdAt: Maybe<Scalars['DateTime']['output']>;
  description: Maybe<Scalars['String']['output']>;
  documentId: Scalars['ID']['output'];
  internalName: Scalars['String']['output'];
  offerings: Array<Maybe<Offering>>;
  offerings_connection: Maybe<OfferingRelationResponseCollection>;
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  services: Array<Maybe<Service>>;
  services_connection: Maybe<ServiceRelationResponseCollection>;
  slug: Scalars['String']['output'];
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};


export type CapabilityOfferingsArgs = {
  filters: InputMaybe<OfferingFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type CapabilityOfferings_ConnectionArgs = {
  filters: InputMaybe<OfferingFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type CapabilityServicesArgs = {
  filters: InputMaybe<ServiceFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type CapabilityServices_ConnectionArgs = {
  filters: InputMaybe<ServiceFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type CapabilityEntityResponseCollection = {
  __typename?: 'CapabilityEntityResponseCollection';
  nodes: Array<Capability>;
  pageInfo: Pagination;
};

export type CapabilityFiltersInput = {
  and: InputMaybe<Array<InputMaybe<CapabilityFiltersInput>>>;
  createdAt: InputMaybe<DateTimeFilterInput>;
  description: InputMaybe<StringFilterInput>;
  documentId: InputMaybe<IdFilterInput>;
  internalName: InputMaybe<StringFilterInput>;
  not: InputMaybe<CapabilityFiltersInput>;
  offerings: InputMaybe<OfferingFiltersInput>;
  or: InputMaybe<Array<InputMaybe<CapabilityFiltersInput>>>;
  publishedAt: InputMaybe<DateTimeFilterInput>;
  services: InputMaybe<ServiceFiltersInput>;
  slug: InputMaybe<StringFilterInput>;
  updatedAt: InputMaybe<DateTimeFilterInput>;
};

export type CapabilityInput = {
  description: InputMaybe<Scalars['String']['input']>;
  internalName: InputMaybe<Scalars['String']['input']>;
  offerings: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  publishedAt: InputMaybe<Scalars['DateTime']['input']>;
  services: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  slug: InputMaybe<Scalars['String']['input']>;
};

export type CapabilityRelationResponseCollection = {
  __typename?: 'CapabilityRelationResponseCollection';
  nodes: Array<Capability>;
};

export type ChurnIntervention = {
  __typename?: 'ChurnIntervention';
  churnInterventionId: Scalars['String']['output'];
  churnType: Enum_Churnintervention_Churntype;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  ctaMessage: Scalars['String']['output'];
  discountAmount: Scalars['Int']['output'];
  documentId: Scalars['ID']['output'];
  internalName: Scalars['String']['output'];
  interval: Enum_Churnintervention_Interval;
  locale: Maybe<Scalars['String']['output']>;
  localizations: Array<Maybe<ChurnIntervention>>;
  localizations_connection: Maybe<ChurnInterventionRelationResponseCollection>;
  modalHeading: Scalars['String']['output'];
  modalMessage: Scalars['String']['output'];
  offerings: Array<Maybe<Offering>>;
  offerings_connection: Maybe<OfferingRelationResponseCollection>;
  productPageUrl: Scalars['String']['output'];
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  redemptionLimit: Maybe<Scalars['Int']['output']>;
  stripeCouponId: Scalars['String']['output'];
  termsDetails: Scalars['String']['output'];
  termsHeading: Scalars['String']['output'];
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};


export type ChurnInterventionLocalizationsArgs = {
  filters: InputMaybe<ChurnInterventionFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type ChurnInterventionLocalizations_ConnectionArgs = {
  filters: InputMaybe<ChurnInterventionFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type ChurnInterventionOfferingsArgs = {
  filters: InputMaybe<OfferingFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type ChurnInterventionOfferings_ConnectionArgs = {
  filters: InputMaybe<OfferingFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ChurnInterventionEntityResponseCollection = {
  __typename?: 'ChurnInterventionEntityResponseCollection';
  nodes: Array<ChurnIntervention>;
  pageInfo: Pagination;
};

export type ChurnInterventionFiltersInput = {
  and: InputMaybe<Array<InputMaybe<ChurnInterventionFiltersInput>>>;
  churnInterventionId: InputMaybe<StringFilterInput>;
  churnType: InputMaybe<StringFilterInput>;
  createdAt: InputMaybe<DateTimeFilterInput>;
  ctaMessage: InputMaybe<StringFilterInput>;
  discountAmount: InputMaybe<IntFilterInput>;
  documentId: InputMaybe<IdFilterInput>;
  internalName: InputMaybe<StringFilterInput>;
  interval: InputMaybe<StringFilterInput>;
  locale: InputMaybe<StringFilterInput>;
  localizations: InputMaybe<ChurnInterventionFiltersInput>;
  modalHeading: InputMaybe<StringFilterInput>;
  modalMessage: InputMaybe<StringFilterInput>;
  not: InputMaybe<ChurnInterventionFiltersInput>;
  offerings: InputMaybe<OfferingFiltersInput>;
  or: InputMaybe<Array<InputMaybe<ChurnInterventionFiltersInput>>>;
  productPageUrl: InputMaybe<StringFilterInput>;
  publishedAt: InputMaybe<DateTimeFilterInput>;
  redemptionLimit: InputMaybe<IntFilterInput>;
  stripeCouponId: InputMaybe<StringFilterInput>;
  termsDetails: InputMaybe<StringFilterInput>;
  termsHeading: InputMaybe<StringFilterInput>;
  updatedAt: InputMaybe<DateTimeFilterInput>;
};

export type ChurnInterventionInput = {
  churnInterventionId: InputMaybe<Scalars['String']['input']>;
  churnType: InputMaybe<Enum_Churnintervention_Churntype>;
  ctaMessage: InputMaybe<Scalars['String']['input']>;
  discountAmount: InputMaybe<Scalars['Int']['input']>;
  internalName: InputMaybe<Scalars['String']['input']>;
  interval: InputMaybe<Enum_Churnintervention_Interval>;
  modalHeading: InputMaybe<Scalars['String']['input']>;
  modalMessage: InputMaybe<Scalars['String']['input']>;
  offerings: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  productPageUrl: InputMaybe<Scalars['String']['input']>;
  publishedAt: InputMaybe<Scalars['DateTime']['input']>;
  redemptionLimit: InputMaybe<Scalars['Int']['input']>;
  stripeCouponId: InputMaybe<Scalars['String']['input']>;
  termsDetails: InputMaybe<Scalars['String']['input']>;
  termsHeading: InputMaybe<Scalars['String']['input']>;
};

export type ChurnInterventionRelationResponseCollection = {
  __typename?: 'ChurnInterventionRelationResponseCollection';
  nodes: Array<ChurnIntervention>;
};

export type CommonContent = {
  __typename?: 'CommonContent';
  cancellationUrl: Maybe<Scalars['String']['output']>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  emailIcon: Maybe<Scalars['String']['output']>;
  internalName: Scalars['String']['output'];
  locale: Maybe<Scalars['String']['output']>;
  localizations: Array<Maybe<CommonContent>>;
  localizations_connection: Maybe<CommonContentRelationResponseCollection>;
  newsletterLabelTextCode: Maybe<Scalars['String']['output']>;
  newsletterSlug: Maybe<Scalars['JSON']['output']>;
  privacyNoticeDownloadUrl: Scalars['String']['output'];
  privacyNoticeUrl: Scalars['String']['output'];
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  successActionButtonLabel: Maybe<Scalars['String']['output']>;
  successActionButtonUrl: Scalars['String']['output'];
  supportUrl: Scalars['String']['output'];
  termsOfServiceDownloadUrl: Scalars['String']['output'];
  termsOfServiceUrl: Scalars['String']['output'];
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};


export type CommonContentLocalizationsArgs = {
  filters: InputMaybe<CommonContentFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type CommonContentLocalizations_ConnectionArgs = {
  filters: InputMaybe<CommonContentFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type CommonContentEntityResponseCollection = {
  __typename?: 'CommonContentEntityResponseCollection';
  nodes: Array<CommonContent>;
  pageInfo: Pagination;
};

export type CommonContentFiltersInput = {
  and: InputMaybe<Array<InputMaybe<CommonContentFiltersInput>>>;
  cancellationUrl: InputMaybe<StringFilterInput>;
  createdAt: InputMaybe<DateTimeFilterInput>;
  documentId: InputMaybe<IdFilterInput>;
  emailIcon: InputMaybe<StringFilterInput>;
  internalName: InputMaybe<StringFilterInput>;
  locale: InputMaybe<StringFilterInput>;
  localizations: InputMaybe<CommonContentFiltersInput>;
  newsletterLabelTextCode: InputMaybe<StringFilterInput>;
  newsletterSlug: InputMaybe<JsonFilterInput>;
  not: InputMaybe<CommonContentFiltersInput>;
  or: InputMaybe<Array<InputMaybe<CommonContentFiltersInput>>>;
  privacyNoticeDownloadUrl: InputMaybe<StringFilterInput>;
  privacyNoticeUrl: InputMaybe<StringFilterInput>;
  publishedAt: InputMaybe<DateTimeFilterInput>;
  successActionButtonLabel: InputMaybe<StringFilterInput>;
  successActionButtonUrl: InputMaybe<StringFilterInput>;
  supportUrl: InputMaybe<StringFilterInput>;
  termsOfServiceDownloadUrl: InputMaybe<StringFilterInput>;
  termsOfServiceUrl: InputMaybe<StringFilterInput>;
  updatedAt: InputMaybe<DateTimeFilterInput>;
};

export type CommonContentInput = {
  cancellationUrl: InputMaybe<Scalars['String']['input']>;
  emailIcon: InputMaybe<Scalars['String']['input']>;
  internalName: InputMaybe<Scalars['String']['input']>;
  newsletterLabelTextCode: InputMaybe<Scalars['String']['input']>;
  newsletterSlug: InputMaybe<Scalars['JSON']['input']>;
  privacyNoticeDownloadUrl: InputMaybe<Scalars['String']['input']>;
  privacyNoticeUrl: InputMaybe<Scalars['String']['input']>;
  publishedAt: InputMaybe<Scalars['DateTime']['input']>;
  successActionButtonLabel: InputMaybe<Scalars['String']['input']>;
  successActionButtonUrl: InputMaybe<Scalars['String']['input']>;
  supportUrl: InputMaybe<Scalars['String']['input']>;
  termsOfServiceDownloadUrl: InputMaybe<Scalars['String']['input']>;
  termsOfServiceUrl: InputMaybe<Scalars['String']['input']>;
};

export type CommonContentRelationResponseCollection = {
  __typename?: 'CommonContentRelationResponseCollection';
  nodes: Array<CommonContent>;
};

export type ComponentAccountsEmailConfig = {
  __typename?: 'ComponentAccountsEmailConfig';
  description: Scalars['String']['output'];
  headline: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  subject: Scalars['String']['output'];
};

export type ComponentAccountsEmailConfigFiltersInput = {
  and: InputMaybe<Array<InputMaybe<ComponentAccountsEmailConfigFiltersInput>>>;
  description: InputMaybe<StringFilterInput>;
  headline: InputMaybe<StringFilterInput>;
  not: InputMaybe<ComponentAccountsEmailConfigFiltersInput>;
  or: InputMaybe<Array<InputMaybe<ComponentAccountsEmailConfigFiltersInput>>>;
  subject: InputMaybe<StringFilterInput>;
};

export type ComponentAccountsEmailConfigInput = {
  description: InputMaybe<Scalars['String']['input']>;
  headline: InputMaybe<Scalars['String']['input']>;
  id: InputMaybe<Scalars['ID']['input']>;
  subject: InputMaybe<Scalars['String']['input']>;
};

export type ComponentAccountsFeatureFlags = {
  __typename?: 'ComponentAccountsFeatureFlags';
  id: Scalars['ID']['output'];
  syncConfirmedPageHideCTA: Maybe<Scalars['Boolean']['output']>;
  syncHidePromoAfterLogin: Maybe<Scalars['Boolean']['output']>;
};

export type ComponentAccountsFeatureFlagsFiltersInput = {
  and: InputMaybe<Array<InputMaybe<ComponentAccountsFeatureFlagsFiltersInput>>>;
  not: InputMaybe<ComponentAccountsFeatureFlagsFiltersInput>;
  or: InputMaybe<Array<InputMaybe<ComponentAccountsFeatureFlagsFiltersInput>>>;
  syncConfirmedPageHideCTA: InputMaybe<BooleanFilterInput>;
  syncHidePromoAfterLogin: InputMaybe<BooleanFilterInput>;
};

export type ComponentAccountsFeatureFlagsInput = {
  id: InputMaybe<Scalars['ID']['input']>;
  syncConfirmedPageHideCTA: InputMaybe<Scalars['Boolean']['input']>;
  syncHidePromoAfterLogin: InputMaybe<Scalars['Boolean']['input']>;
};

export type ComponentAccountsImage = {
  __typename?: 'ComponentAccountsImage';
  altText: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  url: Scalars['String']['output'];
};

export type ComponentAccountsImageFiltersInput = {
  altText: InputMaybe<StringFilterInput>;
  and: InputMaybe<Array<InputMaybe<ComponentAccountsImageFiltersInput>>>;
  not: InputMaybe<ComponentAccountsImageFiltersInput>;
  or: InputMaybe<Array<InputMaybe<ComponentAccountsImageFiltersInput>>>;
  url: InputMaybe<StringFilterInput>;
};

export type ComponentAccountsImageInput = {
  altText: InputMaybe<Scalars['String']['input']>;
  id: InputMaybe<Scalars['ID']['input']>;
  url: InputMaybe<Scalars['String']['input']>;
};

export type ComponentAccountsPageConfig = {
  __typename?: 'ComponentAccountsPageConfig';
  description: Maybe<Scalars['String']['output']>;
  headline: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  logoAltText: Maybe<Scalars['String']['output']>;
  logoUrl: Maybe<Scalars['String']['output']>;
  pageTitle: Maybe<Scalars['String']['output']>;
  primaryButtonText: Scalars['String']['output'];
  primaryImage: Maybe<ComponentAccountsImage>;
  splitLayout: Maybe<Scalars['Boolean']['output']>;
};

export type ComponentAccountsPageConfigFiltersInput = {
  and: InputMaybe<Array<InputMaybe<ComponentAccountsPageConfigFiltersInput>>>;
  description: InputMaybe<StringFilterInput>;
  headline: InputMaybe<StringFilterInput>;
  logoAltText: InputMaybe<StringFilterInput>;
  logoUrl: InputMaybe<StringFilterInput>;
  not: InputMaybe<ComponentAccountsPageConfigFiltersInput>;
  or: InputMaybe<Array<InputMaybe<ComponentAccountsPageConfigFiltersInput>>>;
  pageTitle: InputMaybe<StringFilterInput>;
  primaryButtonText: InputMaybe<StringFilterInput>;
  primaryImage: InputMaybe<ComponentAccountsImageFiltersInput>;
  splitLayout: InputMaybe<BooleanFilterInput>;
};

export type ComponentAccountsPageConfigInput = {
  description: InputMaybe<Scalars['String']['input']>;
  headline: InputMaybe<Scalars['String']['input']>;
  id: InputMaybe<Scalars['ID']['input']>;
  logoAltText: InputMaybe<Scalars['String']['input']>;
  logoUrl: InputMaybe<Scalars['String']['input']>;
  pageTitle: InputMaybe<Scalars['String']['input']>;
  primaryButtonText: InputMaybe<Scalars['String']['input']>;
  primaryImage: InputMaybe<ComponentAccountsImageInput>;
  splitLayout: InputMaybe<Scalars['Boolean']['input']>;
};

export type ComponentAccountsShared = {
  __typename?: 'ComponentAccountsShared';
  backgrounds: Maybe<ComponentAccountsSharedBackgrounds>;
  buttonColor: Maybe<Scalars['String']['output']>;
  emailFromName: Maybe<Scalars['String']['output']>;
  emailLogoAltText: Maybe<Scalars['String']['output']>;
  emailLogoUrl: Maybe<Scalars['String']['output']>;
  emailLogoWidth: Maybe<Scalars['String']['output']>;
  favicon: Maybe<Scalars['String']['output']>;
  featureFlags: Maybe<ComponentAccountsFeatureFlags>;
  headerLogoAltText: Maybe<Scalars['String']['output']>;
  headerLogoUrl: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  logoAltText: Maybe<Scalars['String']['output']>;
  logoUrl: Maybe<Scalars['String']['output']>;
  pageTitle: Maybe<Scalars['String']['output']>;
};

export type ComponentAccountsSharedBackgrounds = {
  __typename?: 'ComponentAccountsSharedBackgrounds';
  defaultLayout: Maybe<Scalars['String']['output']>;
  header: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  splitLayout: Maybe<Scalars['String']['output']>;
  splitLayoutAltText: Maybe<Scalars['String']['output']>;
};

export type ComponentAccountsSharedBackgroundsFiltersInput = {
  and: InputMaybe<Array<InputMaybe<ComponentAccountsSharedBackgroundsFiltersInput>>>;
  defaultLayout: InputMaybe<StringFilterInput>;
  header: InputMaybe<StringFilterInput>;
  not: InputMaybe<ComponentAccountsSharedBackgroundsFiltersInput>;
  or: InputMaybe<Array<InputMaybe<ComponentAccountsSharedBackgroundsFiltersInput>>>;
  splitLayout: InputMaybe<StringFilterInput>;
  splitLayoutAltText: InputMaybe<StringFilterInput>;
};

export type ComponentAccountsSharedBackgroundsInput = {
  defaultLayout: InputMaybe<Scalars['String']['input']>;
  header: InputMaybe<Scalars['String']['input']>;
  id: InputMaybe<Scalars['ID']['input']>;
  splitLayout: InputMaybe<Scalars['String']['input']>;
  splitLayoutAltText: InputMaybe<Scalars['String']['input']>;
};

export type ComponentAccountsSharedFiltersInput = {
  and: InputMaybe<Array<InputMaybe<ComponentAccountsSharedFiltersInput>>>;
  backgrounds: InputMaybe<ComponentAccountsSharedBackgroundsFiltersInput>;
  buttonColor: InputMaybe<StringFilterInput>;
  emailFromName: InputMaybe<StringFilterInput>;
  emailLogoAltText: InputMaybe<StringFilterInput>;
  emailLogoUrl: InputMaybe<StringFilterInput>;
  emailLogoWidth: InputMaybe<StringFilterInput>;
  favicon: InputMaybe<StringFilterInput>;
  featureFlags: InputMaybe<ComponentAccountsFeatureFlagsFiltersInput>;
  headerLogoAltText: InputMaybe<StringFilterInput>;
  headerLogoUrl: InputMaybe<StringFilterInput>;
  logoAltText: InputMaybe<StringFilterInput>;
  logoUrl: InputMaybe<StringFilterInput>;
  not: InputMaybe<ComponentAccountsSharedFiltersInput>;
  or: InputMaybe<Array<InputMaybe<ComponentAccountsSharedFiltersInput>>>;
  pageTitle: InputMaybe<StringFilterInput>;
};

export type ComponentAccountsSharedInput = {
  backgrounds: InputMaybe<ComponentAccountsSharedBackgroundsInput>;
  buttonColor: InputMaybe<Scalars['String']['input']>;
  emailFromName: InputMaybe<Scalars['String']['input']>;
  emailLogoAltText: InputMaybe<Scalars['String']['input']>;
  emailLogoUrl: InputMaybe<Scalars['String']['input']>;
  emailLogoWidth: InputMaybe<Scalars['String']['input']>;
  favicon: InputMaybe<Scalars['String']['input']>;
  featureFlags: InputMaybe<ComponentAccountsFeatureFlagsInput>;
  headerLogoAltText: InputMaybe<Scalars['String']['input']>;
  headerLogoUrl: InputMaybe<Scalars['String']['input']>;
  id: InputMaybe<Scalars['ID']['input']>;
  logoAltText: InputMaybe<Scalars['String']['input']>;
  logoUrl: InputMaybe<Scalars['String']['input']>;
  pageTitle: InputMaybe<Scalars['String']['input']>;
};

export type ComponentIapAppleProductIDs = {
  __typename?: 'ComponentIapAppleProductIDs';
  appleProductID: Scalars['String']['output'];
  id: Scalars['ID']['output'];
};

export type ComponentIapGoogleSkUs = {
  __typename?: 'ComponentIapGoogleSkUs';
  googleSKU: Scalars['String']['output'];
  id: Scalars['ID']['output'];
};

export type ComponentIapStripeLegacyIapPrices = {
  __typename?: 'ComponentIapStripeLegacyIapPrices';
  id: Scalars['ID']['output'];
  stripeLegacyIapPrices: Scalars['String']['output'];
};

export type ComponentIapStripePlanChoices = {
  __typename?: 'ComponentIapStripePlanChoices';
  id: Scalars['ID']['output'];
  stripePlanChoices: Scalars['String']['output'];
};

export type ComponentStripeStripeLegacyPlans = {
  __typename?: 'ComponentStripeStripeLegacyPlans';
  id: Scalars['ID']['output'];
  stripeLegacyPlan: Scalars['String']['output'];
};

export type ComponentStripeStripeLegacyPlansFiltersInput = {
  and: InputMaybe<Array<InputMaybe<ComponentStripeStripeLegacyPlansFiltersInput>>>;
  not: InputMaybe<ComponentStripeStripeLegacyPlansFiltersInput>;
  or: InputMaybe<Array<InputMaybe<ComponentStripeStripeLegacyPlansFiltersInput>>>;
  stripeLegacyPlan: InputMaybe<StringFilterInput>;
};

export type ComponentStripeStripeLegacyPlansInput = {
  id: InputMaybe<Scalars['ID']['input']>;
  stripeLegacyPlan: InputMaybe<Scalars['String']['input']>;
};

export type ComponentStripeStripePlanChoices = {
  __typename?: 'ComponentStripeStripePlanChoices';
  id: Scalars['ID']['output'];
  stripePlanChoice: Scalars['String']['output'];
};

export type ComponentStripeStripePlanChoicesFiltersInput = {
  and: InputMaybe<Array<InputMaybe<ComponentStripeStripePlanChoicesFiltersInput>>>;
  not: InputMaybe<ComponentStripeStripePlanChoicesFiltersInput>;
  or: InputMaybe<Array<InputMaybe<ComponentStripeStripePlanChoicesFiltersInput>>>;
  stripePlanChoice: InputMaybe<StringFilterInput>;
};

export type ComponentStripeStripePlanChoicesInput = {
  id: InputMaybe<Scalars['ID']['input']>;
  stripePlanChoice: InputMaybe<Scalars['String']['input']>;
};

export type ComponentStripeStripePromoCodes = {
  __typename?: 'ComponentStripeStripePromoCodes';
  PromoCode: Scalars['String']['output'];
  id: Scalars['ID']['output'];
};

export type ComponentStripeStripePromoCodesFiltersInput = {
  PromoCode: InputMaybe<StringFilterInput>;
  and: InputMaybe<Array<InputMaybe<ComponentStripeStripePromoCodesFiltersInput>>>;
  not: InputMaybe<ComponentStripeStripePromoCodesFiltersInput>;
  or: InputMaybe<Array<InputMaybe<ComponentStripeStripePromoCodesFiltersInput>>>;
};

export type ComponentStripeStripePromoCodesInput = {
  PromoCode: InputMaybe<Scalars['String']['input']>;
  id: InputMaybe<Scalars['ID']['input']>;
};

export type CouponConfig = {
  __typename?: 'CouponConfig';
  countries: Maybe<Scalars['JSON']['output']>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  internalName: Scalars['String']['output'];
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  stripePromotionCodes: Maybe<Array<Maybe<ComponentStripeStripePromoCodes>>>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};


export type CouponConfigStripePromotionCodesArgs = {
  filters: InputMaybe<ComponentStripeStripePromoCodesFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type CouponConfigEntityResponseCollection = {
  __typename?: 'CouponConfigEntityResponseCollection';
  nodes: Array<CouponConfig>;
  pageInfo: Pagination;
};

export type CouponConfigFiltersInput = {
  and: InputMaybe<Array<InputMaybe<CouponConfigFiltersInput>>>;
  countries: InputMaybe<JsonFilterInput>;
  createdAt: InputMaybe<DateTimeFilterInput>;
  documentId: InputMaybe<IdFilterInput>;
  internalName: InputMaybe<StringFilterInput>;
  not: InputMaybe<CouponConfigFiltersInput>;
  or: InputMaybe<Array<InputMaybe<CouponConfigFiltersInput>>>;
  publishedAt: InputMaybe<DateTimeFilterInput>;
  stripePromotionCodes: InputMaybe<ComponentStripeStripePromoCodesFiltersInput>;
  updatedAt: InputMaybe<DateTimeFilterInput>;
};

export type CouponConfigInput = {
  countries: InputMaybe<Scalars['JSON']['input']>;
  internalName: InputMaybe<Scalars['String']['input']>;
  publishedAt: InputMaybe<Scalars['DateTime']['input']>;
  stripePromotionCodes: InputMaybe<Array<InputMaybe<ComponentStripeStripePromoCodesInput>>>;
};

export type DateTimeFilterInput = {
  and: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>;
  between: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>;
  contains: InputMaybe<Scalars['DateTime']['input']>;
  containsi: InputMaybe<Scalars['DateTime']['input']>;
  endsWith: InputMaybe<Scalars['DateTime']['input']>;
  eq: InputMaybe<Scalars['DateTime']['input']>;
  eqi: InputMaybe<Scalars['DateTime']['input']>;
  gt: InputMaybe<Scalars['DateTime']['input']>;
  gte: InputMaybe<Scalars['DateTime']['input']>;
  in: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>;
  lt: InputMaybe<Scalars['DateTime']['input']>;
  lte: InputMaybe<Scalars['DateTime']['input']>;
  ne: InputMaybe<Scalars['DateTime']['input']>;
  nei: InputMaybe<Scalars['DateTime']['input']>;
  not: InputMaybe<DateTimeFilterInput>;
  notContains: InputMaybe<Scalars['DateTime']['input']>;
  notContainsi: InputMaybe<Scalars['DateTime']['input']>;
  notIn: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>;
  notNull: InputMaybe<Scalars['Boolean']['input']>;
  null: InputMaybe<Scalars['Boolean']['input']>;
  or: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>;
  startsWith: InputMaybe<Scalars['DateTime']['input']>;
};

export type DeleteMutationResponse = {
  __typename?: 'DeleteMutationResponse';
  documentId: Scalars['ID']['output'];
};

export enum Enum_Cancelinterstitialoffer_Currentinterval {
  Daily = 'daily',
  Halfyearly = 'halfyearly',
  Monthly = 'monthly',
  Weekly = 'weekly',
  Yearly = 'yearly'
}

export enum Enum_Cancelinterstitialoffer_Upgradeinterval {
  Daily = 'daily',
  Halfyearly = 'halfyearly',
  Monthly = 'monthly',
  Weekly = 'weekly',
  Yearly = 'yearly'
}

export enum Enum_Churnintervention_Churntype {
  Cancel = 'cancel',
  StaySubscribed = 'stay_subscribed'
}

export enum Enum_Churnintervention_Interval {
  Daily = 'daily',
  Halfyearly = 'halfyearly',
  Monthly = 'monthly',
  Weekly = 'weekly',
  Yearly = 'yearly'
}

export enum Enum_Iap_Interval {
  Daily = 'daily',
  Halfyearly = 'halfyearly',
  Monthly = 'monthly',
  Weekly = 'weekly',
  Yearly = 'yearly'
}

export type FileInfoInput = {
  alternativeText: InputMaybe<Scalars['String']['input']>;
  caption: InputMaybe<Scalars['String']['input']>;
  name: InputMaybe<Scalars['String']['input']>;
};

export type FloatFilterInput = {
  and: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  between: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  contains: InputMaybe<Scalars['Float']['input']>;
  containsi: InputMaybe<Scalars['Float']['input']>;
  endsWith: InputMaybe<Scalars['Float']['input']>;
  eq: InputMaybe<Scalars['Float']['input']>;
  eqi: InputMaybe<Scalars['Float']['input']>;
  gt: InputMaybe<Scalars['Float']['input']>;
  gte: InputMaybe<Scalars['Float']['input']>;
  in: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  lt: InputMaybe<Scalars['Float']['input']>;
  lte: InputMaybe<Scalars['Float']['input']>;
  ne: InputMaybe<Scalars['Float']['input']>;
  nei: InputMaybe<Scalars['Float']['input']>;
  not: InputMaybe<FloatFilterInput>;
  notContains: InputMaybe<Scalars['Float']['input']>;
  notContainsi: InputMaybe<Scalars['Float']['input']>;
  notIn: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  notNull: InputMaybe<Scalars['Boolean']['input']>;
  null: InputMaybe<Scalars['Boolean']['input']>;
  or: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  startsWith: InputMaybe<Scalars['Float']['input']>;
};

export type GenericMorph = CancelInterstitialOffer | Capability | ChurnIntervention | CommonContent | ComponentAccountsEmailConfig | ComponentAccountsFeatureFlags | ComponentAccountsImage | ComponentAccountsPageConfig | ComponentAccountsShared | ComponentAccountsSharedBackgrounds | ComponentIapAppleProductIDs | ComponentIapGoogleSkUs | ComponentIapStripeLegacyIapPrices | ComponentIapStripePlanChoices | ComponentStripeStripeLegacyPlans | ComponentStripeStripePlanChoices | ComponentStripeStripePromoCodes | CouponConfig | I18NLocale | Iap | Offering | Purchase | PurchaseDetail | RelyingParty | ReviewWorkflowsWorkflow | ReviewWorkflowsWorkflowStage | Service | Subgroup | UploadFile | UsersPermissionsPermission | UsersPermissionsRole | UsersPermissionsUser;

export type I18NLocale = {
  __typename?: 'I18NLocale';
  code: Maybe<Scalars['String']['output']>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  name: Maybe<Scalars['String']['output']>;
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};

export type I18NLocaleEntityResponseCollection = {
  __typename?: 'I18NLocaleEntityResponseCollection';
  nodes: Array<I18NLocale>;
  pageInfo: Pagination;
};

export type I18NLocaleFiltersInput = {
  and: InputMaybe<Array<InputMaybe<I18NLocaleFiltersInput>>>;
  code: InputMaybe<StringFilterInput>;
  createdAt: InputMaybe<DateTimeFilterInput>;
  documentId: InputMaybe<IdFilterInput>;
  name: InputMaybe<StringFilterInput>;
  not: InputMaybe<I18NLocaleFiltersInput>;
  or: InputMaybe<Array<InputMaybe<I18NLocaleFiltersInput>>>;
  publishedAt: InputMaybe<DateTimeFilterInput>;
  updatedAt: InputMaybe<DateTimeFilterInput>;
};

export type IdFilterInput = {
  and: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  between: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  contains: InputMaybe<Scalars['ID']['input']>;
  containsi: InputMaybe<Scalars['ID']['input']>;
  endsWith: InputMaybe<Scalars['ID']['input']>;
  eq: InputMaybe<Scalars['ID']['input']>;
  eqi: InputMaybe<Scalars['ID']['input']>;
  gt: InputMaybe<Scalars['ID']['input']>;
  gte: InputMaybe<Scalars['ID']['input']>;
  in: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  lt: InputMaybe<Scalars['ID']['input']>;
  lte: InputMaybe<Scalars['ID']['input']>;
  ne: InputMaybe<Scalars['ID']['input']>;
  nei: InputMaybe<Scalars['ID']['input']>;
  not: InputMaybe<IdFilterInput>;
  notContains: InputMaybe<Scalars['ID']['input']>;
  notContainsi: InputMaybe<Scalars['ID']['input']>;
  notIn: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  notNull: InputMaybe<Scalars['Boolean']['input']>;
  null: InputMaybe<Scalars['Boolean']['input']>;
  or: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  startsWith: InputMaybe<Scalars['ID']['input']>;
};

export type Iap = {
  __typename?: 'Iap';
  createdAt: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  internalName: Maybe<Scalars['String']['output']>;
  interval: Enum_Iap_Interval;
  offering: Maybe<Offering>;
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  storeID: Scalars['String']['output'];
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};

export type IapEntityResponseCollection = {
  __typename?: 'IapEntityResponseCollection';
  nodes: Array<Iap>;
  pageInfo: Pagination;
};

export type IapFiltersInput = {
  and: InputMaybe<Array<InputMaybe<IapFiltersInput>>>;
  createdAt: InputMaybe<DateTimeFilterInput>;
  documentId: InputMaybe<IdFilterInput>;
  internalName: InputMaybe<StringFilterInput>;
  interval: InputMaybe<StringFilterInput>;
  not: InputMaybe<IapFiltersInput>;
  offering: InputMaybe<OfferingFiltersInput>;
  or: InputMaybe<Array<InputMaybe<IapFiltersInput>>>;
  publishedAt: InputMaybe<DateTimeFilterInput>;
  storeID: InputMaybe<StringFilterInput>;
  updatedAt: InputMaybe<DateTimeFilterInput>;
};

export type IapInput = {
  internalName: InputMaybe<Scalars['String']['input']>;
  interval: InputMaybe<Enum_Iap_Interval>;
  offering: InputMaybe<Scalars['ID']['input']>;
  publishedAt: InputMaybe<Scalars['DateTime']['input']>;
  storeID: InputMaybe<Scalars['String']['input']>;
};

export type IapRelationResponseCollection = {
  __typename?: 'IapRelationResponseCollection';
  nodes: Array<Iap>;
};

export type IntFilterInput = {
  and: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  between: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  contains: InputMaybe<Scalars['Int']['input']>;
  containsi: InputMaybe<Scalars['Int']['input']>;
  endsWith: InputMaybe<Scalars['Int']['input']>;
  eq: InputMaybe<Scalars['Int']['input']>;
  eqi: InputMaybe<Scalars['Int']['input']>;
  gt: InputMaybe<Scalars['Int']['input']>;
  gte: InputMaybe<Scalars['Int']['input']>;
  in: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  lt: InputMaybe<Scalars['Int']['input']>;
  lte: InputMaybe<Scalars['Int']['input']>;
  ne: InputMaybe<Scalars['Int']['input']>;
  nei: InputMaybe<Scalars['Int']['input']>;
  not: InputMaybe<IntFilterInput>;
  notContains: InputMaybe<Scalars['Int']['input']>;
  notContainsi: InputMaybe<Scalars['Int']['input']>;
  notIn: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  notNull: InputMaybe<Scalars['Boolean']['input']>;
  null: InputMaybe<Scalars['Boolean']['input']>;
  or: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  startsWith: InputMaybe<Scalars['Int']['input']>;
};

export type JsonFilterInput = {
  and: InputMaybe<Array<InputMaybe<Scalars['JSON']['input']>>>;
  between: InputMaybe<Array<InputMaybe<Scalars['JSON']['input']>>>;
  contains: InputMaybe<Scalars['JSON']['input']>;
  containsi: InputMaybe<Scalars['JSON']['input']>;
  endsWith: InputMaybe<Scalars['JSON']['input']>;
  eq: InputMaybe<Scalars['JSON']['input']>;
  eqi: InputMaybe<Scalars['JSON']['input']>;
  gt: InputMaybe<Scalars['JSON']['input']>;
  gte: InputMaybe<Scalars['JSON']['input']>;
  in: InputMaybe<Array<InputMaybe<Scalars['JSON']['input']>>>;
  lt: InputMaybe<Scalars['JSON']['input']>;
  lte: InputMaybe<Scalars['JSON']['input']>;
  ne: InputMaybe<Scalars['JSON']['input']>;
  nei: InputMaybe<Scalars['JSON']['input']>;
  not: InputMaybe<JsonFilterInput>;
  notContains: InputMaybe<Scalars['JSON']['input']>;
  notContainsi: InputMaybe<Scalars['JSON']['input']>;
  notIn: InputMaybe<Array<InputMaybe<Scalars['JSON']['input']>>>;
  notNull: InputMaybe<Scalars['Boolean']['input']>;
  null: InputMaybe<Scalars['Boolean']['input']>;
  or: InputMaybe<Array<InputMaybe<Scalars['JSON']['input']>>>;
  startsWith: InputMaybe<Scalars['JSON']['input']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Change user password. Confirm with the current password. */
  changePassword: Maybe<UsersPermissionsLoginPayload>;
  createCancelInterstitialOffer: Maybe<CancelInterstitialOffer>;
  createCapability: Maybe<Capability>;
  createChurnIntervention: Maybe<ChurnIntervention>;
  createCommonContent: Maybe<CommonContent>;
  createCouponConfig: Maybe<CouponConfig>;
  createIap: Maybe<Iap>;
  createOffering: Maybe<Offering>;
  createPurchase: Maybe<Purchase>;
  createPurchaseDetail: Maybe<PurchaseDetail>;
  createRelyingParty: Maybe<RelyingParty>;
  createReviewWorkflowsWorkflow: Maybe<ReviewWorkflowsWorkflow>;
  createReviewWorkflowsWorkflowStage: Maybe<ReviewWorkflowsWorkflowStage>;
  createService: Maybe<Service>;
  createSubgroup: Maybe<Subgroup>;
  /** Create a new role */
  createUsersPermissionsRole: Maybe<UsersPermissionsCreateRolePayload>;
  /** Create a new user */
  createUsersPermissionsUser: UsersPermissionsUserEntityResponse;
  deleteCancelInterstitialOffer: Maybe<DeleteMutationResponse>;
  deleteCapability: Maybe<DeleteMutationResponse>;
  deleteChurnIntervention: Maybe<DeleteMutationResponse>;
  deleteCommonContent: Maybe<DeleteMutationResponse>;
  deleteCouponConfig: Maybe<DeleteMutationResponse>;
  deleteIap: Maybe<DeleteMutationResponse>;
  deleteOffering: Maybe<DeleteMutationResponse>;
  deletePurchase: Maybe<DeleteMutationResponse>;
  deletePurchaseDetail: Maybe<DeleteMutationResponse>;
  deleteRelyingParty: Maybe<DeleteMutationResponse>;
  deleteReviewWorkflowsWorkflow: Maybe<DeleteMutationResponse>;
  deleteReviewWorkflowsWorkflowStage: Maybe<DeleteMutationResponse>;
  deleteService: Maybe<DeleteMutationResponse>;
  deleteSubgroup: Maybe<DeleteMutationResponse>;
  deleteUploadFile: Maybe<UploadFile>;
  /** Delete an existing role */
  deleteUsersPermissionsRole: Maybe<UsersPermissionsDeleteRolePayload>;
  /** Delete an existing user */
  deleteUsersPermissionsUser: UsersPermissionsUserEntityResponse;
  /** Confirm an email users email address */
  emailConfirmation: Maybe<UsersPermissionsLoginPayload>;
  /** Request a reset password token */
  forgotPassword: Maybe<UsersPermissionsPasswordPayload>;
  login: UsersPermissionsLoginPayload;
  /** Register a user */
  register: UsersPermissionsLoginPayload;
  /** Reset user password. Confirm with a code (resetToken from forgotPassword) */
  resetPassword: Maybe<UsersPermissionsLoginPayload>;
  updateCancelInterstitialOffer: Maybe<CancelInterstitialOffer>;
  updateCapability: Maybe<Capability>;
  updateChurnIntervention: Maybe<ChurnIntervention>;
  updateCommonContent: Maybe<CommonContent>;
  updateCouponConfig: Maybe<CouponConfig>;
  updateIap: Maybe<Iap>;
  updateOffering: Maybe<Offering>;
  updatePurchase: Maybe<Purchase>;
  updatePurchaseDetail: Maybe<PurchaseDetail>;
  updateRelyingParty: Maybe<RelyingParty>;
  updateReviewWorkflowsWorkflow: Maybe<ReviewWorkflowsWorkflow>;
  updateReviewWorkflowsWorkflowStage: Maybe<ReviewWorkflowsWorkflowStage>;
  updateService: Maybe<Service>;
  updateSubgroup: Maybe<Subgroup>;
  updateUploadFile: UploadFile;
  /** Update an existing role */
  updateUsersPermissionsRole: Maybe<UsersPermissionsUpdateRolePayload>;
  /** Update an existing user */
  updateUsersPermissionsUser: UsersPermissionsUserEntityResponse;
};


export type MutationChangePasswordArgs = {
  currentPassword: Scalars['String']['input'];
  password: Scalars['String']['input'];
  passwordConfirmation: Scalars['String']['input'];
};


export type MutationCreateCancelInterstitialOfferArgs = {
  data: CancelInterstitialOfferInput;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateCapabilityArgs = {
  data: CapabilityInput;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateChurnInterventionArgs = {
  data: ChurnInterventionInput;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateCommonContentArgs = {
  data: CommonContentInput;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateCouponConfigArgs = {
  data: CouponConfigInput;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateIapArgs = {
  data: IapInput;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateOfferingArgs = {
  data: OfferingInput;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreatePurchaseArgs = {
  data: PurchaseInput;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreatePurchaseDetailArgs = {
  data: PurchaseDetailInput;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateRelyingPartyArgs = {
  data: RelyingPartyInput;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateReviewWorkflowsWorkflowArgs = {
  data: ReviewWorkflowsWorkflowInput;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateReviewWorkflowsWorkflowStageArgs = {
  data: ReviewWorkflowsWorkflowStageInput;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateServiceArgs = {
  data: ServiceInput;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateSubgroupArgs = {
  data: SubgroupInput;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationCreateUsersPermissionsRoleArgs = {
  data: UsersPermissionsRoleInput;
};


export type MutationCreateUsersPermissionsUserArgs = {
  data: UsersPermissionsUserInput;
};


export type MutationDeleteCancelInterstitialOfferArgs = {
  documentId: Scalars['ID']['input'];
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};


export type MutationDeleteCapabilityArgs = {
  documentId: Scalars['ID']['input'];
};


export type MutationDeleteChurnInterventionArgs = {
  documentId: Scalars['ID']['input'];
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};


export type MutationDeleteCommonContentArgs = {
  documentId: Scalars['ID']['input'];
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};


export type MutationDeleteCouponConfigArgs = {
  documentId: Scalars['ID']['input'];
};


export type MutationDeleteIapArgs = {
  documentId: Scalars['ID']['input'];
};


export type MutationDeleteOfferingArgs = {
  documentId: Scalars['ID']['input'];
};


export type MutationDeletePurchaseArgs = {
  documentId: Scalars['ID']['input'];
};


export type MutationDeletePurchaseDetailArgs = {
  documentId: Scalars['ID']['input'];
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};


export type MutationDeleteRelyingPartyArgs = {
  documentId: Scalars['ID']['input'];
};


export type MutationDeleteReviewWorkflowsWorkflowArgs = {
  documentId: Scalars['ID']['input'];
};


export type MutationDeleteReviewWorkflowsWorkflowStageArgs = {
  documentId: Scalars['ID']['input'];
};


export type MutationDeleteServiceArgs = {
  documentId: Scalars['ID']['input'];
};


export type MutationDeleteSubgroupArgs = {
  documentId: Scalars['ID']['input'];
};


export type MutationDeleteUploadFileArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteUsersPermissionsRoleArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteUsersPermissionsUserArgs = {
  id: Scalars['ID']['input'];
};


export type MutationEmailConfirmationArgs = {
  confirmation: Scalars['String']['input'];
};


export type MutationForgotPasswordArgs = {
  email: Scalars['String']['input'];
};


export type MutationLoginArgs = {
  input: UsersPermissionsLoginInput;
};


export type MutationRegisterArgs = {
  input: UsersPermissionsRegisterInput;
};


export type MutationResetPasswordArgs = {
  code: Scalars['String']['input'];
  password: Scalars['String']['input'];
  passwordConfirmation: Scalars['String']['input'];
};


export type MutationUpdateCancelInterstitialOfferArgs = {
  data: CancelInterstitialOfferInput;
  documentId: Scalars['ID']['input'];
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateCapabilityArgs = {
  data: CapabilityInput;
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateChurnInterventionArgs = {
  data: ChurnInterventionInput;
  documentId: Scalars['ID']['input'];
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateCommonContentArgs = {
  data: CommonContentInput;
  documentId: Scalars['ID']['input'];
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateCouponConfigArgs = {
  data: CouponConfigInput;
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateIapArgs = {
  data: IapInput;
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateOfferingArgs = {
  data: OfferingInput;
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdatePurchaseArgs = {
  data: PurchaseInput;
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdatePurchaseDetailArgs = {
  data: PurchaseDetailInput;
  documentId: Scalars['ID']['input'];
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateRelyingPartyArgs = {
  data: RelyingPartyInput;
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateReviewWorkflowsWorkflowArgs = {
  data: ReviewWorkflowsWorkflowInput;
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateReviewWorkflowsWorkflowStageArgs = {
  data: ReviewWorkflowsWorkflowStageInput;
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateServiceArgs = {
  data: ServiceInput;
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateSubgroupArgs = {
  data: SubgroupInput;
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type MutationUpdateUploadFileArgs = {
  id: Scalars['ID']['input'];
  info: InputMaybe<FileInfoInput>;
};


export type MutationUpdateUsersPermissionsRoleArgs = {
  data: UsersPermissionsRoleInput;
  id: Scalars['ID']['input'];
};


export type MutationUpdateUsersPermissionsUserArgs = {
  data: UsersPermissionsUserInput;
  id: Scalars['ID']['input'];
};

export type Offering = {
  __typename?: 'Offering';
  apiIdentifier: Scalars['String']['output'];
  cancel_interstitial_offers: Array<Maybe<CancelInterstitialOffer>>;
  cancel_interstitial_offers_connection: Maybe<CancelInterstitialOfferRelationResponseCollection>;
  capabilities: Array<Maybe<Capability>>;
  capabilities_connection: Maybe<CapabilityRelationResponseCollection>;
  churnInterventions: Array<Maybe<ChurnIntervention>>;
  churnInterventions_connection: Maybe<ChurnInterventionRelationResponseCollection>;
  commonContent: Maybe<CommonContent>;
  countries: Scalars['JSON']['output'];
  couponConfig: Maybe<CouponConfig>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  defaultPurchase: Maybe<Purchase>;
  description: Maybe<Scalars['String']['output']>;
  documentId: Scalars['ID']['output'];
  experimentPurchase: Maybe<Purchase>;
  iaps: Array<Maybe<Iap>>;
  iaps_connection: Maybe<IapRelationResponseCollection>;
  internalName: Scalars['String']['output'];
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  stripeLegacyPlans: Maybe<Array<Maybe<ComponentStripeStripeLegacyPlans>>>;
  stripeProductId: Scalars['String']['output'];
  subGroups: Array<Maybe<Subgroup>>;
  subGroups_connection: Maybe<SubgroupRelationResponseCollection>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};


export type OfferingCancel_Interstitial_OffersArgs = {
  filters: InputMaybe<CancelInterstitialOfferFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type OfferingCancel_Interstitial_Offers_ConnectionArgs = {
  filters: InputMaybe<CancelInterstitialOfferFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type OfferingCapabilitiesArgs = {
  filters: InputMaybe<CapabilityFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type OfferingCapabilities_ConnectionArgs = {
  filters: InputMaybe<CapabilityFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type OfferingChurnInterventionsArgs = {
  filters: InputMaybe<ChurnInterventionFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type OfferingChurnInterventions_ConnectionArgs = {
  filters: InputMaybe<ChurnInterventionFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type OfferingIapsArgs = {
  filters: InputMaybe<IapFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type OfferingIaps_ConnectionArgs = {
  filters: InputMaybe<IapFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type OfferingStripeLegacyPlansArgs = {
  filters: InputMaybe<ComponentStripeStripeLegacyPlansFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type OfferingSubGroupsArgs = {
  filters: InputMaybe<SubgroupFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type OfferingSubGroups_ConnectionArgs = {
  filters: InputMaybe<SubgroupFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type OfferingEntityResponseCollection = {
  __typename?: 'OfferingEntityResponseCollection';
  nodes: Array<Offering>;
  pageInfo: Pagination;
};

export type OfferingFiltersInput = {
  and: InputMaybe<Array<InputMaybe<OfferingFiltersInput>>>;
  apiIdentifier: InputMaybe<StringFilterInput>;
  cancel_interstitial_offers: InputMaybe<CancelInterstitialOfferFiltersInput>;
  capabilities: InputMaybe<CapabilityFiltersInput>;
  churnInterventions: InputMaybe<ChurnInterventionFiltersInput>;
  commonContent: InputMaybe<CommonContentFiltersInput>;
  countries: InputMaybe<JsonFilterInput>;
  couponConfig: InputMaybe<CouponConfigFiltersInput>;
  createdAt: InputMaybe<DateTimeFilterInput>;
  defaultPurchase: InputMaybe<PurchaseFiltersInput>;
  description: InputMaybe<StringFilterInput>;
  documentId: InputMaybe<IdFilterInput>;
  experimentPurchase: InputMaybe<PurchaseFiltersInput>;
  iaps: InputMaybe<IapFiltersInput>;
  internalName: InputMaybe<StringFilterInput>;
  not: InputMaybe<OfferingFiltersInput>;
  or: InputMaybe<Array<InputMaybe<OfferingFiltersInput>>>;
  publishedAt: InputMaybe<DateTimeFilterInput>;
  stripeLegacyPlans: InputMaybe<ComponentStripeStripeLegacyPlansFiltersInput>;
  stripeProductId: InputMaybe<StringFilterInput>;
  subGroups: InputMaybe<SubgroupFiltersInput>;
  updatedAt: InputMaybe<DateTimeFilterInput>;
};

export type OfferingInput = {
  apiIdentifier: InputMaybe<Scalars['String']['input']>;
  cancel_interstitial_offers: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  capabilities: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  churnInterventions: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  commonContent: InputMaybe<Scalars['ID']['input']>;
  countries: InputMaybe<Scalars['JSON']['input']>;
  couponConfig: InputMaybe<Scalars['ID']['input']>;
  defaultPurchase: InputMaybe<Scalars['ID']['input']>;
  description: InputMaybe<Scalars['String']['input']>;
  experimentPurchase: InputMaybe<Scalars['ID']['input']>;
  iaps: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  internalName: InputMaybe<Scalars['String']['input']>;
  publishedAt: InputMaybe<Scalars['DateTime']['input']>;
  stripeLegacyPlans: InputMaybe<Array<InputMaybe<ComponentStripeStripeLegacyPlansInput>>>;
  stripeProductId: InputMaybe<Scalars['String']['input']>;
  subGroups: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};

export type OfferingRelationResponseCollection = {
  __typename?: 'OfferingRelationResponseCollection';
  nodes: Array<Offering>;
};

export type Pagination = {
  __typename?: 'Pagination';
  page: Scalars['Int']['output'];
  pageCount: Scalars['Int']['output'];
  pageSize: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type PaginationArg = {
  limit: InputMaybe<Scalars['Int']['input']>;
  page: InputMaybe<Scalars['Int']['input']>;
  pageSize: InputMaybe<Scalars['Int']['input']>;
  start: InputMaybe<Scalars['Int']['input']>;
};

export enum PublicationStatus {
  Draft = 'DRAFT',
  Published = 'PUBLISHED'
}

export type Purchase = {
  __typename?: 'Purchase';
  createdAt: Maybe<Scalars['DateTime']['output']>;
  description: Maybe<Scalars['String']['output']>;
  documentId: Scalars['ID']['output'];
  internalName: Scalars['String']['output'];
  offering: Maybe<Offering>;
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  purchaseDetails: Maybe<PurchaseDetail>;
  stripePlanChoices: Maybe<Array<Maybe<ComponentStripeStripePlanChoices>>>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};


export type PurchaseStripePlanChoicesArgs = {
  filters: InputMaybe<ComponentStripeStripePlanChoicesFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type PurchaseDetail = {
  __typename?: 'PurchaseDetail';
  createdAt: Maybe<Scalars['DateTime']['output']>;
  details: Scalars['String']['output'];
  documentId: Scalars['ID']['output'];
  internalName: Scalars['String']['output'];
  locale: Maybe<Scalars['String']['output']>;
  localizations: Array<Maybe<PurchaseDetail>>;
  localizations_connection: Maybe<PurchaseDetailRelationResponseCollection>;
  productName: Scalars['String']['output'];
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  subtitle: Maybe<Scalars['String']['output']>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
  webIcon: Scalars['String']['output'];
};


export type PurchaseDetailLocalizationsArgs = {
  filters: InputMaybe<PurchaseDetailFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type PurchaseDetailLocalizations_ConnectionArgs = {
  filters: InputMaybe<PurchaseDetailFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type PurchaseDetailEntityResponseCollection = {
  __typename?: 'PurchaseDetailEntityResponseCollection';
  nodes: Array<PurchaseDetail>;
  pageInfo: Pagination;
};

export type PurchaseDetailFiltersInput = {
  and: InputMaybe<Array<InputMaybe<PurchaseDetailFiltersInput>>>;
  createdAt: InputMaybe<DateTimeFilterInput>;
  details: InputMaybe<StringFilterInput>;
  documentId: InputMaybe<IdFilterInput>;
  internalName: InputMaybe<StringFilterInput>;
  locale: InputMaybe<StringFilterInput>;
  localizations: InputMaybe<PurchaseDetailFiltersInput>;
  not: InputMaybe<PurchaseDetailFiltersInput>;
  or: InputMaybe<Array<InputMaybe<PurchaseDetailFiltersInput>>>;
  productName: InputMaybe<StringFilterInput>;
  publishedAt: InputMaybe<DateTimeFilterInput>;
  subtitle: InputMaybe<StringFilterInput>;
  updatedAt: InputMaybe<DateTimeFilterInput>;
  webIcon: InputMaybe<StringFilterInput>;
};

export type PurchaseDetailInput = {
  details: InputMaybe<Scalars['String']['input']>;
  internalName: InputMaybe<Scalars['String']['input']>;
  productName: InputMaybe<Scalars['String']['input']>;
  publishedAt: InputMaybe<Scalars['DateTime']['input']>;
  subtitle: InputMaybe<Scalars['String']['input']>;
  webIcon: InputMaybe<Scalars['String']['input']>;
};

export type PurchaseDetailRelationResponseCollection = {
  __typename?: 'PurchaseDetailRelationResponseCollection';
  nodes: Array<PurchaseDetail>;
};

export type PurchaseEntityResponseCollection = {
  __typename?: 'PurchaseEntityResponseCollection';
  nodes: Array<Purchase>;
  pageInfo: Pagination;
};

export type PurchaseFiltersInput = {
  and: InputMaybe<Array<InputMaybe<PurchaseFiltersInput>>>;
  createdAt: InputMaybe<DateTimeFilterInput>;
  description: InputMaybe<StringFilterInput>;
  documentId: InputMaybe<IdFilterInput>;
  internalName: InputMaybe<StringFilterInput>;
  not: InputMaybe<PurchaseFiltersInput>;
  offering: InputMaybe<OfferingFiltersInput>;
  or: InputMaybe<Array<InputMaybe<PurchaseFiltersInput>>>;
  publishedAt: InputMaybe<DateTimeFilterInput>;
  purchaseDetails: InputMaybe<PurchaseDetailFiltersInput>;
  stripePlanChoices: InputMaybe<ComponentStripeStripePlanChoicesFiltersInput>;
  updatedAt: InputMaybe<DateTimeFilterInput>;
};

export type PurchaseInput = {
  description: InputMaybe<Scalars['String']['input']>;
  internalName: InputMaybe<Scalars['String']['input']>;
  offering: InputMaybe<Scalars['ID']['input']>;
  publishedAt: InputMaybe<Scalars['DateTime']['input']>;
  purchaseDetails: InputMaybe<Scalars['ID']['input']>;
  stripePlanChoices: InputMaybe<Array<InputMaybe<ComponentStripeStripePlanChoicesInput>>>;
};

export type Query = {
  __typename?: 'Query';
  cancelInterstitialOffer: Maybe<CancelInterstitialOffer>;
  cancelInterstitialOffers: Array<Maybe<CancelInterstitialOffer>>;
  cancelInterstitialOffers_connection: Maybe<CancelInterstitialOfferEntityResponseCollection>;
  capabilities: Array<Maybe<Capability>>;
  capabilities_connection: Maybe<CapabilityEntityResponseCollection>;
  capability: Maybe<Capability>;
  churnIntervention: Maybe<ChurnIntervention>;
  churnInterventions: Array<Maybe<ChurnIntervention>>;
  churnInterventions_connection: Maybe<ChurnInterventionEntityResponseCollection>;
  commonContent: Maybe<CommonContent>;
  commonContents: Array<Maybe<CommonContent>>;
  commonContents_connection: Maybe<CommonContentEntityResponseCollection>;
  couponConfig: Maybe<CouponConfig>;
  couponConfigs: Array<Maybe<CouponConfig>>;
  couponConfigs_connection: Maybe<CouponConfigEntityResponseCollection>;
  i18NLocale: Maybe<I18NLocale>;
  i18NLocales: Array<Maybe<I18NLocale>>;
  i18NLocales_connection: Maybe<I18NLocaleEntityResponseCollection>;
  iap: Maybe<Iap>;
  iaps: Array<Maybe<Iap>>;
  iaps_connection: Maybe<IapEntityResponseCollection>;
  me: Maybe<UsersPermissionsMe>;
  offering: Maybe<Offering>;
  offerings: Array<Maybe<Offering>>;
  offerings_connection: Maybe<OfferingEntityResponseCollection>;
  purchase: Maybe<Purchase>;
  purchaseDetail: Maybe<PurchaseDetail>;
  purchaseDetails: Array<Maybe<PurchaseDetail>>;
  purchaseDetails_connection: Maybe<PurchaseDetailEntityResponseCollection>;
  purchases: Array<Maybe<Purchase>>;
  purchases_connection: Maybe<PurchaseEntityResponseCollection>;
  relyingParties: Array<Maybe<RelyingParty>>;
  relyingParties_connection: Maybe<RelyingPartyEntityResponseCollection>;
  relyingParty: Maybe<RelyingParty>;
  reviewWorkflowsWorkflow: Maybe<ReviewWorkflowsWorkflow>;
  reviewWorkflowsWorkflowStage: Maybe<ReviewWorkflowsWorkflowStage>;
  reviewWorkflowsWorkflowStages: Array<Maybe<ReviewWorkflowsWorkflowStage>>;
  reviewWorkflowsWorkflowStages_connection: Maybe<ReviewWorkflowsWorkflowStageEntityResponseCollection>;
  reviewWorkflowsWorkflows: Array<Maybe<ReviewWorkflowsWorkflow>>;
  reviewWorkflowsWorkflows_connection: Maybe<ReviewWorkflowsWorkflowEntityResponseCollection>;
  service: Maybe<Service>;
  services: Array<Maybe<Service>>;
  services_connection: Maybe<ServiceEntityResponseCollection>;
  subgroup: Maybe<Subgroup>;
  subgroups: Array<Maybe<Subgroup>>;
  subgroups_connection: Maybe<SubgroupEntityResponseCollection>;
  uploadFile: Maybe<UploadFile>;
  uploadFiles: Array<Maybe<UploadFile>>;
  uploadFiles_connection: Maybe<UploadFileEntityResponseCollection>;
  usersPermissionsRole: Maybe<UsersPermissionsRole>;
  usersPermissionsRoles: Array<Maybe<UsersPermissionsRole>>;
  usersPermissionsRoles_connection: Maybe<UsersPermissionsRoleEntityResponseCollection>;
  usersPermissionsUser: Maybe<UsersPermissionsUser>;
  usersPermissionsUsers: Array<Maybe<UsersPermissionsUser>>;
  usersPermissionsUsers_connection: Maybe<UsersPermissionsUserEntityResponseCollection>;
};


export type QueryCancelInterstitialOfferArgs = {
  documentId: Scalars['ID']['input'];
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryCancelInterstitialOffersArgs = {
  filters: InputMaybe<CancelInterstitialOfferFiltersInput>;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryCancelInterstitialOffers_ConnectionArgs = {
  filters: InputMaybe<CancelInterstitialOfferFiltersInput>;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryCapabilitiesArgs = {
  filters: InputMaybe<CapabilityFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryCapabilities_ConnectionArgs = {
  filters: InputMaybe<CapabilityFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryCapabilityArgs = {
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type QueryChurnInterventionArgs = {
  documentId: Scalars['ID']['input'];
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryChurnInterventionsArgs = {
  filters: InputMaybe<ChurnInterventionFiltersInput>;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryChurnInterventions_ConnectionArgs = {
  filters: InputMaybe<ChurnInterventionFiltersInput>;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryCommonContentArgs = {
  documentId: Scalars['ID']['input'];
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryCommonContentsArgs = {
  filters: InputMaybe<CommonContentFiltersInput>;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryCommonContents_ConnectionArgs = {
  filters: InputMaybe<CommonContentFiltersInput>;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryCouponConfigArgs = {
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type QueryCouponConfigsArgs = {
  filters: InputMaybe<CouponConfigFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryCouponConfigs_ConnectionArgs = {
  filters: InputMaybe<CouponConfigFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryI18NLocaleArgs = {
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type QueryI18NLocalesArgs = {
  filters: InputMaybe<I18NLocaleFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryI18NLocales_ConnectionArgs = {
  filters: InputMaybe<I18NLocaleFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryIapArgs = {
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type QueryIapsArgs = {
  filters: InputMaybe<IapFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryIaps_ConnectionArgs = {
  filters: InputMaybe<IapFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryOfferingArgs = {
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type QueryOfferingsArgs = {
  filters: InputMaybe<OfferingFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryOfferings_ConnectionArgs = {
  filters: InputMaybe<OfferingFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryPurchaseArgs = {
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type QueryPurchaseDetailArgs = {
  documentId: Scalars['ID']['input'];
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryPurchaseDetailsArgs = {
  filters: InputMaybe<PurchaseDetailFiltersInput>;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryPurchaseDetails_ConnectionArgs = {
  filters: InputMaybe<PurchaseDetailFiltersInput>;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryPurchasesArgs = {
  filters: InputMaybe<PurchaseFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryPurchases_ConnectionArgs = {
  filters: InputMaybe<PurchaseFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryRelyingPartiesArgs = {
  filters: InputMaybe<RelyingPartyFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryRelyingParties_ConnectionArgs = {
  filters: InputMaybe<RelyingPartyFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryRelyingPartyArgs = {
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type QueryReviewWorkflowsWorkflowArgs = {
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type QueryReviewWorkflowsWorkflowStageArgs = {
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type QueryReviewWorkflowsWorkflowStagesArgs = {
  filters: InputMaybe<ReviewWorkflowsWorkflowStageFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryReviewWorkflowsWorkflowStages_ConnectionArgs = {
  filters: InputMaybe<ReviewWorkflowsWorkflowStageFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryReviewWorkflowsWorkflowsArgs = {
  filters: InputMaybe<ReviewWorkflowsWorkflowFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryReviewWorkflowsWorkflows_ConnectionArgs = {
  filters: InputMaybe<ReviewWorkflowsWorkflowFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryServiceArgs = {
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type QueryServicesArgs = {
  filters: InputMaybe<ServiceFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryServices_ConnectionArgs = {
  filters: InputMaybe<ServiceFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QuerySubgroupArgs = {
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type QuerySubgroupsArgs = {
  filters: InputMaybe<SubgroupFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QuerySubgroups_ConnectionArgs = {
  filters: InputMaybe<SubgroupFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryUploadFileArgs = {
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type QueryUploadFilesArgs = {
  filters: InputMaybe<UploadFileFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryUploadFiles_ConnectionArgs = {
  filters: InputMaybe<UploadFileFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryUsersPermissionsRoleArgs = {
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type QueryUsersPermissionsRolesArgs = {
  filters: InputMaybe<UsersPermissionsRoleFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryUsersPermissionsRoles_ConnectionArgs = {
  filters: InputMaybe<UsersPermissionsRoleFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryUsersPermissionsUserArgs = {
  documentId: Scalars['ID']['input'];
  status?: InputMaybe<PublicationStatus>;
};


export type QueryUsersPermissionsUsersArgs = {
  filters: InputMaybe<UsersPermissionsUserFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};


export type QueryUsersPermissionsUsers_ConnectionArgs = {
  filters: InputMaybe<UsersPermissionsUserFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PublicationStatus>;
};

export type RelyingParty = {
  __typename?: 'RelyingParty';
  EmailFirstPage: ComponentAccountsPageConfig;
  NewDeviceLoginEmail: Maybe<ComponentAccountsEmailConfig>;
  SigninPage: ComponentAccountsPageConfig;
  SigninTokenCodePage: Maybe<ComponentAccountsPageConfig>;
  SigninUnblockCodePage: Maybe<ComponentAccountsPageConfig>;
  SignupConfirmCodePage: ComponentAccountsPageConfig;
  SignupConfirmedSyncPage: Maybe<ComponentAccountsPageConfig>;
  SignupSetPasswordPage: ComponentAccountsPageConfig;
  VerifyLoginCodeEmail: Maybe<ComponentAccountsEmailConfig>;
  VerifyShortCodeEmail: Maybe<ComponentAccountsEmailConfig>;
  clientId: Maybe<Scalars['String']['output']>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  entrypoint: Maybe<Scalars['String']['output']>;
  l10nId: Maybe<Scalars['String']['output']>;
  name: Maybe<Scalars['String']['output']>;
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  shared: ComponentAccountsShared;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};

export type RelyingPartyEntityResponseCollection = {
  __typename?: 'RelyingPartyEntityResponseCollection';
  nodes: Array<RelyingParty>;
  pageInfo: Pagination;
};

export type RelyingPartyFiltersInput = {
  EmailFirstPage: InputMaybe<ComponentAccountsPageConfigFiltersInput>;
  NewDeviceLoginEmail: InputMaybe<ComponentAccountsEmailConfigFiltersInput>;
  SigninPage: InputMaybe<ComponentAccountsPageConfigFiltersInput>;
  SigninTokenCodePage: InputMaybe<ComponentAccountsPageConfigFiltersInput>;
  SigninUnblockCodePage: InputMaybe<ComponentAccountsPageConfigFiltersInput>;
  SignupConfirmCodePage: InputMaybe<ComponentAccountsPageConfigFiltersInput>;
  SignupConfirmedSyncPage: InputMaybe<ComponentAccountsPageConfigFiltersInput>;
  SignupSetPasswordPage: InputMaybe<ComponentAccountsPageConfigFiltersInput>;
  VerifyLoginCodeEmail: InputMaybe<ComponentAccountsEmailConfigFiltersInput>;
  VerifyShortCodeEmail: InputMaybe<ComponentAccountsEmailConfigFiltersInput>;
  and: InputMaybe<Array<InputMaybe<RelyingPartyFiltersInput>>>;
  clientId: InputMaybe<StringFilterInput>;
  createdAt: InputMaybe<DateTimeFilterInput>;
  documentId: InputMaybe<IdFilterInput>;
  entrypoint: InputMaybe<StringFilterInput>;
  l10nId: InputMaybe<StringFilterInput>;
  name: InputMaybe<StringFilterInput>;
  not: InputMaybe<RelyingPartyFiltersInput>;
  or: InputMaybe<Array<InputMaybe<RelyingPartyFiltersInput>>>;
  publishedAt: InputMaybe<DateTimeFilterInput>;
  shared: InputMaybe<ComponentAccountsSharedFiltersInput>;
  updatedAt: InputMaybe<DateTimeFilterInput>;
};

export type RelyingPartyInput = {
  EmailFirstPage: InputMaybe<ComponentAccountsPageConfigInput>;
  NewDeviceLoginEmail: InputMaybe<ComponentAccountsEmailConfigInput>;
  SigninPage: InputMaybe<ComponentAccountsPageConfigInput>;
  SigninTokenCodePage: InputMaybe<ComponentAccountsPageConfigInput>;
  SigninUnblockCodePage: InputMaybe<ComponentAccountsPageConfigInput>;
  SignupConfirmCodePage: InputMaybe<ComponentAccountsPageConfigInput>;
  SignupConfirmedSyncPage: InputMaybe<ComponentAccountsPageConfigInput>;
  SignupSetPasswordPage: InputMaybe<ComponentAccountsPageConfigInput>;
  VerifyLoginCodeEmail: InputMaybe<ComponentAccountsEmailConfigInput>;
  VerifyShortCodeEmail: InputMaybe<ComponentAccountsEmailConfigInput>;
  clientId: InputMaybe<Scalars['String']['input']>;
  entrypoint: InputMaybe<Scalars['String']['input']>;
  l10nId: InputMaybe<Scalars['String']['input']>;
  name: InputMaybe<Scalars['String']['input']>;
  publishedAt: InputMaybe<Scalars['DateTime']['input']>;
  shared: InputMaybe<ComponentAccountsSharedInput>;
};

export type ReviewWorkflowsWorkflow = {
  __typename?: 'ReviewWorkflowsWorkflow';
  contentTypes: Scalars['JSON']['output'];
  createdAt: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  stageRequiredToPublish: Maybe<ReviewWorkflowsWorkflowStage>;
  stages: Array<Maybe<ReviewWorkflowsWorkflowStage>>;
  stages_connection: Maybe<ReviewWorkflowsWorkflowStageRelationResponseCollection>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};


export type ReviewWorkflowsWorkflowStagesArgs = {
  filters: InputMaybe<ReviewWorkflowsWorkflowStageFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type ReviewWorkflowsWorkflowStages_ConnectionArgs = {
  filters: InputMaybe<ReviewWorkflowsWorkflowStageFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ReviewWorkflowsWorkflowEntityResponseCollection = {
  __typename?: 'ReviewWorkflowsWorkflowEntityResponseCollection';
  nodes: Array<ReviewWorkflowsWorkflow>;
  pageInfo: Pagination;
};

export type ReviewWorkflowsWorkflowFiltersInput = {
  and: InputMaybe<Array<InputMaybe<ReviewWorkflowsWorkflowFiltersInput>>>;
  contentTypes: InputMaybe<JsonFilterInput>;
  createdAt: InputMaybe<DateTimeFilterInput>;
  documentId: InputMaybe<IdFilterInput>;
  name: InputMaybe<StringFilterInput>;
  not: InputMaybe<ReviewWorkflowsWorkflowFiltersInput>;
  or: InputMaybe<Array<InputMaybe<ReviewWorkflowsWorkflowFiltersInput>>>;
  publishedAt: InputMaybe<DateTimeFilterInput>;
  stageRequiredToPublish: InputMaybe<ReviewWorkflowsWorkflowStageFiltersInput>;
  stages: InputMaybe<ReviewWorkflowsWorkflowStageFiltersInput>;
  updatedAt: InputMaybe<DateTimeFilterInput>;
};

export type ReviewWorkflowsWorkflowInput = {
  contentTypes: InputMaybe<Scalars['JSON']['input']>;
  name: InputMaybe<Scalars['String']['input']>;
  publishedAt: InputMaybe<Scalars['DateTime']['input']>;
  stageRequiredToPublish: InputMaybe<Scalars['ID']['input']>;
  stages: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};

export type ReviewWorkflowsWorkflowStage = {
  __typename?: 'ReviewWorkflowsWorkflowStage';
  color: Maybe<Scalars['String']['output']>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  name: Maybe<Scalars['String']['output']>;
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
  workflow: Maybe<ReviewWorkflowsWorkflow>;
};

export type ReviewWorkflowsWorkflowStageEntityResponseCollection = {
  __typename?: 'ReviewWorkflowsWorkflowStageEntityResponseCollection';
  nodes: Array<ReviewWorkflowsWorkflowStage>;
  pageInfo: Pagination;
};

export type ReviewWorkflowsWorkflowStageFiltersInput = {
  and: InputMaybe<Array<InputMaybe<ReviewWorkflowsWorkflowStageFiltersInput>>>;
  color: InputMaybe<StringFilterInput>;
  createdAt: InputMaybe<DateTimeFilterInput>;
  documentId: InputMaybe<IdFilterInput>;
  name: InputMaybe<StringFilterInput>;
  not: InputMaybe<ReviewWorkflowsWorkflowStageFiltersInput>;
  or: InputMaybe<Array<InputMaybe<ReviewWorkflowsWorkflowStageFiltersInput>>>;
  publishedAt: InputMaybe<DateTimeFilterInput>;
  updatedAt: InputMaybe<DateTimeFilterInput>;
  workflow: InputMaybe<ReviewWorkflowsWorkflowFiltersInput>;
};

export type ReviewWorkflowsWorkflowStageInput = {
  color: InputMaybe<Scalars['String']['input']>;
  name: InputMaybe<Scalars['String']['input']>;
  publishedAt: InputMaybe<Scalars['DateTime']['input']>;
  workflow: InputMaybe<Scalars['ID']['input']>;
};

export type ReviewWorkflowsWorkflowStageRelationResponseCollection = {
  __typename?: 'ReviewWorkflowsWorkflowStageRelationResponseCollection';
  nodes: Array<ReviewWorkflowsWorkflowStage>;
};

export type Service = {
  __typename?: 'Service';
  capabilities: Array<Maybe<Capability>>;
  capabilities_connection: Maybe<CapabilityRelationResponseCollection>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  description: Maybe<Scalars['String']['output']>;
  documentId: Scalars['ID']['output'];
  internalName: Scalars['String']['output'];
  oauthClientId: Scalars['String']['output'];
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};


export type ServiceCapabilitiesArgs = {
  filters: InputMaybe<CapabilityFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type ServiceCapabilities_ConnectionArgs = {
  filters: InputMaybe<CapabilityFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ServiceEntityResponseCollection = {
  __typename?: 'ServiceEntityResponseCollection';
  nodes: Array<Service>;
  pageInfo: Pagination;
};

export type ServiceFiltersInput = {
  and: InputMaybe<Array<InputMaybe<ServiceFiltersInput>>>;
  capabilities: InputMaybe<CapabilityFiltersInput>;
  createdAt: InputMaybe<DateTimeFilterInput>;
  description: InputMaybe<StringFilterInput>;
  documentId: InputMaybe<IdFilterInput>;
  internalName: InputMaybe<StringFilterInput>;
  not: InputMaybe<ServiceFiltersInput>;
  oauthClientId: InputMaybe<StringFilterInput>;
  or: InputMaybe<Array<InputMaybe<ServiceFiltersInput>>>;
  publishedAt: InputMaybe<DateTimeFilterInput>;
  updatedAt: InputMaybe<DateTimeFilterInput>;
};

export type ServiceInput = {
  capabilities: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  description: InputMaybe<Scalars['String']['input']>;
  internalName: InputMaybe<Scalars['String']['input']>;
  oauthClientId: InputMaybe<Scalars['String']['input']>;
  publishedAt: InputMaybe<Scalars['DateTime']['input']>;
};

export type ServiceRelationResponseCollection = {
  __typename?: 'ServiceRelationResponseCollection';
  nodes: Array<Service>;
};

export type StringFilterInput = {
  and: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  between: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  contains: InputMaybe<Scalars['String']['input']>;
  containsi: InputMaybe<Scalars['String']['input']>;
  endsWith: InputMaybe<Scalars['String']['input']>;
  eq: InputMaybe<Scalars['String']['input']>;
  eqi: InputMaybe<Scalars['String']['input']>;
  gt: InputMaybe<Scalars['String']['input']>;
  gte: InputMaybe<Scalars['String']['input']>;
  in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  lt: InputMaybe<Scalars['String']['input']>;
  lte: InputMaybe<Scalars['String']['input']>;
  ne: InputMaybe<Scalars['String']['input']>;
  nei: InputMaybe<Scalars['String']['input']>;
  not: InputMaybe<StringFilterInput>;
  notContains: InputMaybe<Scalars['String']['input']>;
  notContainsi: InputMaybe<Scalars['String']['input']>;
  notIn: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  notNull: InputMaybe<Scalars['Boolean']['input']>;
  null: InputMaybe<Scalars['Boolean']['input']>;
  or: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  startsWith: InputMaybe<Scalars['String']['input']>;
};

export type Subgroup = {
  __typename?: 'Subgroup';
  createdAt: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  groupName: Maybe<Scalars['String']['output']>;
  internalName: Scalars['String']['output'];
  offerings: Array<Maybe<Offering>>;
  offerings_connection: Maybe<OfferingRelationResponseCollection>;
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};


export type SubgroupOfferingsArgs = {
  filters: InputMaybe<OfferingFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type SubgroupOfferings_ConnectionArgs = {
  filters: InputMaybe<OfferingFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type SubgroupEntityResponseCollection = {
  __typename?: 'SubgroupEntityResponseCollection';
  nodes: Array<Subgroup>;
  pageInfo: Pagination;
};

export type SubgroupFiltersInput = {
  and: InputMaybe<Array<InputMaybe<SubgroupFiltersInput>>>;
  createdAt: InputMaybe<DateTimeFilterInput>;
  documentId: InputMaybe<IdFilterInput>;
  groupName: InputMaybe<StringFilterInput>;
  internalName: InputMaybe<StringFilterInput>;
  not: InputMaybe<SubgroupFiltersInput>;
  offerings: InputMaybe<OfferingFiltersInput>;
  or: InputMaybe<Array<InputMaybe<SubgroupFiltersInput>>>;
  publishedAt: InputMaybe<DateTimeFilterInput>;
  updatedAt: InputMaybe<DateTimeFilterInput>;
};

export type SubgroupInput = {
  groupName: InputMaybe<Scalars['String']['input']>;
  internalName: InputMaybe<Scalars['String']['input']>;
  offerings: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  publishedAt: InputMaybe<Scalars['DateTime']['input']>;
};

export type SubgroupRelationResponseCollection = {
  __typename?: 'SubgroupRelationResponseCollection';
  nodes: Array<Subgroup>;
};

export type UploadFile = {
  __typename?: 'UploadFile';
  alternativeText: Maybe<Scalars['String']['output']>;
  caption: Maybe<Scalars['String']['output']>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  ext: Maybe<Scalars['String']['output']>;
  formats: Maybe<Scalars['JSON']['output']>;
  hash: Scalars['String']['output'];
  height: Maybe<Scalars['Int']['output']>;
  mime: Scalars['String']['output'];
  name: Scalars['String']['output'];
  previewUrl: Maybe<Scalars['String']['output']>;
  provider: Scalars['String']['output'];
  provider_metadata: Maybe<Scalars['JSON']['output']>;
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  related: Maybe<Array<Maybe<GenericMorph>>>;
  size: Scalars['Float']['output'];
  updatedAt: Maybe<Scalars['DateTime']['output']>;
  url: Scalars['String']['output'];
  width: Maybe<Scalars['Int']['output']>;
};

export type UploadFileEntityResponseCollection = {
  __typename?: 'UploadFileEntityResponseCollection';
  nodes: Array<UploadFile>;
  pageInfo: Pagination;
};

export type UploadFileFiltersInput = {
  alternativeText: InputMaybe<StringFilterInput>;
  and: InputMaybe<Array<InputMaybe<UploadFileFiltersInput>>>;
  caption: InputMaybe<StringFilterInput>;
  createdAt: InputMaybe<DateTimeFilterInput>;
  documentId: InputMaybe<IdFilterInput>;
  ext: InputMaybe<StringFilterInput>;
  formats: InputMaybe<JsonFilterInput>;
  hash: InputMaybe<StringFilterInput>;
  height: InputMaybe<IntFilterInput>;
  mime: InputMaybe<StringFilterInput>;
  name: InputMaybe<StringFilterInput>;
  not: InputMaybe<UploadFileFiltersInput>;
  or: InputMaybe<Array<InputMaybe<UploadFileFiltersInput>>>;
  previewUrl: InputMaybe<StringFilterInput>;
  provider: InputMaybe<StringFilterInput>;
  provider_metadata: InputMaybe<JsonFilterInput>;
  publishedAt: InputMaybe<DateTimeFilterInput>;
  size: InputMaybe<FloatFilterInput>;
  updatedAt: InputMaybe<DateTimeFilterInput>;
  url: InputMaybe<StringFilterInput>;
  width: InputMaybe<IntFilterInput>;
};

export type UsersPermissionsCreateRolePayload = {
  __typename?: 'UsersPermissionsCreateRolePayload';
  ok: Scalars['Boolean']['output'];
};

export type UsersPermissionsDeleteRolePayload = {
  __typename?: 'UsersPermissionsDeleteRolePayload';
  ok: Scalars['Boolean']['output'];
};

export type UsersPermissionsLoginInput = {
  identifier: Scalars['String']['input'];
  password: Scalars['String']['input'];
  provider: Scalars['String']['input'];
};

export type UsersPermissionsLoginPayload = {
  __typename?: 'UsersPermissionsLoginPayload';
  jwt: Maybe<Scalars['String']['output']>;
  user: UsersPermissionsMe;
};

export type UsersPermissionsMe = {
  __typename?: 'UsersPermissionsMe';
  blocked: Maybe<Scalars['Boolean']['output']>;
  confirmed: Maybe<Scalars['Boolean']['output']>;
  documentId: Scalars['ID']['output'];
  email: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  role: Maybe<UsersPermissionsMeRole>;
  username: Scalars['String']['output'];
};

export type UsersPermissionsMeRole = {
  __typename?: 'UsersPermissionsMeRole';
  description: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  type: Maybe<Scalars['String']['output']>;
};

export type UsersPermissionsPasswordPayload = {
  __typename?: 'UsersPermissionsPasswordPayload';
  ok: Scalars['Boolean']['output'];
};

export type UsersPermissionsPermission = {
  __typename?: 'UsersPermissionsPermission';
  action: Scalars['String']['output'];
  createdAt: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  role: Maybe<UsersPermissionsRole>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};

export type UsersPermissionsPermissionFiltersInput = {
  action: InputMaybe<StringFilterInput>;
  and: InputMaybe<Array<InputMaybe<UsersPermissionsPermissionFiltersInput>>>;
  createdAt: InputMaybe<DateTimeFilterInput>;
  documentId: InputMaybe<IdFilterInput>;
  not: InputMaybe<UsersPermissionsPermissionFiltersInput>;
  or: InputMaybe<Array<InputMaybe<UsersPermissionsPermissionFiltersInput>>>;
  publishedAt: InputMaybe<DateTimeFilterInput>;
  role: InputMaybe<UsersPermissionsRoleFiltersInput>;
  updatedAt: InputMaybe<DateTimeFilterInput>;
};

export type UsersPermissionsPermissionRelationResponseCollection = {
  __typename?: 'UsersPermissionsPermissionRelationResponseCollection';
  nodes: Array<UsersPermissionsPermission>;
};

export type UsersPermissionsRegisterInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type UsersPermissionsRole = {
  __typename?: 'UsersPermissionsRole';
  createdAt: Maybe<Scalars['DateTime']['output']>;
  description: Maybe<Scalars['String']['output']>;
  documentId: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  permissions: Array<Maybe<UsersPermissionsPermission>>;
  permissions_connection: Maybe<UsersPermissionsPermissionRelationResponseCollection>;
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  type: Maybe<Scalars['String']['output']>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
  users: Array<Maybe<UsersPermissionsUser>>;
  users_connection: Maybe<UsersPermissionsUserRelationResponseCollection>;
};


export type UsersPermissionsRolePermissionsArgs = {
  filters: InputMaybe<UsersPermissionsPermissionFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type UsersPermissionsRolePermissions_ConnectionArgs = {
  filters: InputMaybe<UsersPermissionsPermissionFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type UsersPermissionsRoleUsersArgs = {
  filters: InputMaybe<UsersPermissionsUserFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type UsersPermissionsRoleUsers_ConnectionArgs = {
  filters: InputMaybe<UsersPermissionsUserFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type UsersPermissionsRoleEntityResponseCollection = {
  __typename?: 'UsersPermissionsRoleEntityResponseCollection';
  nodes: Array<UsersPermissionsRole>;
  pageInfo: Pagination;
};

export type UsersPermissionsRoleFiltersInput = {
  and: InputMaybe<Array<InputMaybe<UsersPermissionsRoleFiltersInput>>>;
  createdAt: InputMaybe<DateTimeFilterInput>;
  description: InputMaybe<StringFilterInput>;
  documentId: InputMaybe<IdFilterInput>;
  name: InputMaybe<StringFilterInput>;
  not: InputMaybe<UsersPermissionsRoleFiltersInput>;
  or: InputMaybe<Array<InputMaybe<UsersPermissionsRoleFiltersInput>>>;
  permissions: InputMaybe<UsersPermissionsPermissionFiltersInput>;
  publishedAt: InputMaybe<DateTimeFilterInput>;
  type: InputMaybe<StringFilterInput>;
  updatedAt: InputMaybe<DateTimeFilterInput>;
  users: InputMaybe<UsersPermissionsUserFiltersInput>;
};

export type UsersPermissionsRoleInput = {
  description: InputMaybe<Scalars['String']['input']>;
  name: InputMaybe<Scalars['String']['input']>;
  permissions: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  publishedAt: InputMaybe<Scalars['DateTime']['input']>;
  type: InputMaybe<Scalars['String']['input']>;
  users: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};

export type UsersPermissionsUpdateRolePayload = {
  __typename?: 'UsersPermissionsUpdateRolePayload';
  ok: Scalars['Boolean']['output'];
};

export type UsersPermissionsUser = {
  __typename?: 'UsersPermissionsUser';
  blocked: Maybe<Scalars['Boolean']['output']>;
  confirmed: Maybe<Scalars['Boolean']['output']>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  documentId: Scalars['ID']['output'];
  email: Scalars['String']['output'];
  provider: Maybe<Scalars['String']['output']>;
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  role: Maybe<UsersPermissionsRole>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
  username: Scalars['String']['output'];
};

export type UsersPermissionsUserEntityResponse = {
  __typename?: 'UsersPermissionsUserEntityResponse';
  data: Maybe<UsersPermissionsUser>;
};

export type UsersPermissionsUserEntityResponseCollection = {
  __typename?: 'UsersPermissionsUserEntityResponseCollection';
  nodes: Array<UsersPermissionsUser>;
  pageInfo: Pagination;
};

export type UsersPermissionsUserFiltersInput = {
  and: InputMaybe<Array<InputMaybe<UsersPermissionsUserFiltersInput>>>;
  blocked: InputMaybe<BooleanFilterInput>;
  confirmed: InputMaybe<BooleanFilterInput>;
  createdAt: InputMaybe<DateTimeFilterInput>;
  documentId: InputMaybe<IdFilterInput>;
  email: InputMaybe<StringFilterInput>;
  not: InputMaybe<UsersPermissionsUserFiltersInput>;
  or: InputMaybe<Array<InputMaybe<UsersPermissionsUserFiltersInput>>>;
  provider: InputMaybe<StringFilterInput>;
  publishedAt: InputMaybe<DateTimeFilterInput>;
  role: InputMaybe<UsersPermissionsRoleFiltersInput>;
  updatedAt: InputMaybe<DateTimeFilterInput>;
  username: InputMaybe<StringFilterInput>;
};

export type UsersPermissionsUserInput = {
  blocked: InputMaybe<Scalars['Boolean']['input']>;
  confirmed: InputMaybe<Scalars['Boolean']['input']>;
  email: InputMaybe<Scalars['String']['input']>;
  password: InputMaybe<Scalars['String']['input']>;
  provider: InputMaybe<Scalars['String']['input']>;
  publishedAt: InputMaybe<Scalars['DateTime']['input']>;
  role: InputMaybe<Scalars['ID']['input']>;
  username: InputMaybe<Scalars['String']['input']>;
};

export type UsersPermissionsUserRelationResponseCollection = {
  __typename?: 'UsersPermissionsUserRelationResponseCollection';
  nodes: Array<UsersPermissionsUser>;
};

export type CapabilityServiceByPlanIdsQueryVariables = Exact<{
  stripePlanIds: Array<InputMaybe<Scalars['String']['input']>> | InputMaybe<Scalars['String']['input']>;
}>;


export type CapabilityServiceByPlanIdsQuery = { __typename?: 'Query', purchases: Array<{ __typename?: 'Purchase', stripePlanChoices: Array<{ __typename?: 'ComponentStripeStripePlanChoices', stripePlanChoice: string } | null> | null, offering: { __typename?: 'Offering', stripeLegacyPlans: Array<{ __typename?: 'ComponentStripeStripeLegacyPlans', stripeLegacyPlan: string } | null> | null, capabilities: Array<{ __typename?: 'Capability', slug: string, services: Array<{ __typename?: 'Service', oauthClientId: string } | null> } | null> } | null } | null> };

export type ChurnInterventionByOfferingQueryVariables = Exact<{
  apiIdentifier: Scalars['String']['input'];
  interval: Scalars['String']['input'];
  locale: Scalars['String']['input'];
}>;


export type ChurnInterventionByOfferingQuery = { __typename?: 'Query', offerings: Array<{ __typename?: 'Offering', defaultPurchase: { __typename?: 'Purchase', purchaseDetails: { __typename?: 'PurchaseDetail', webIcon: string, localizations: Array<{ __typename?: 'PurchaseDetail', webIcon: string } | null> } | null } | null, commonContent: { __typename?: 'CommonContent', supportUrl: string } | null, churnInterventions: Array<{ __typename?: 'ChurnIntervention', churnInterventionId: string, churnType: Enum_Churnintervention_Churntype, redemptionLimit: number | null, stripeCouponId: string, interval: Enum_Churnintervention_Interval, discountAmount: number, ctaMessage: string, modalHeading: string, modalMessage: string, productPageUrl: string, termsHeading: string, termsDetails: string } | null> } | null> };

export type EligibilityContentByOfferingQueryVariables = Exact<{
  apiIdentifier: Scalars['String']['input'];
}>;


export type EligibilityContentByOfferingQuery = { __typename?: 'Query', offerings: Array<{ __typename?: 'Offering', apiIdentifier: string, stripeProductId: string, defaultPurchase: { __typename?: 'Purchase', stripePlanChoices: Array<{ __typename?: 'ComponentStripeStripePlanChoices', stripePlanChoice: string } | null> | null } | null, subGroups: Array<{ __typename?: 'Subgroup', groupName: string | null, offerings: Array<{ __typename?: 'Offering', apiIdentifier: string, stripeProductId: string, defaultPurchase: { __typename?: 'Purchase', stripePlanChoices: Array<{ __typename?: 'ComponentStripeStripePlanChoices', stripePlanChoice: string } | null> | null } | null } | null> } | null> } | null> };

export type EligibilityContentByPlanIdsQueryVariables = Exact<{
  stripePlanIds: Array<InputMaybe<Scalars['String']['input']>> | InputMaybe<Scalars['String']['input']>;
}>;


export type EligibilityContentByPlanIdsQuery = { __typename?: 'Query', purchases: Array<{ __typename?: 'Purchase', stripePlanChoices: Array<{ __typename?: 'ComponentStripeStripePlanChoices', stripePlanChoice: string } | null> | null, offering: { __typename?: 'Offering', apiIdentifier: string, stripeProductId: string, countries: any, stripeLegacyPlans: Array<{ __typename?: 'ComponentStripeStripeLegacyPlans', stripeLegacyPlan: string } | null> | null, subGroups: Array<{ __typename?: 'Subgroup', groupName: string | null, offerings: Array<{ __typename?: 'Offering', apiIdentifier: string, stripeProductId: string, countries: any, stripeLegacyPlans: Array<{ __typename?: 'ComponentStripeStripeLegacyPlans', stripeLegacyPlan: string } | null> | null } | null> } | null> } | null } | null> };

export type IapOfferingsByStoreIDsQueryVariables = Exact<{
  locale: Scalars['String']['input'];
  storeIDs: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type IapOfferingsByStoreIDsQuery = { __typename?: 'Query', iaps: Array<{ __typename?: 'Iap', storeID: string, interval: Enum_Iap_Interval, offering: { __typename?: 'Offering', apiIdentifier: string, commonContent: { __typename?: 'CommonContent', supportUrl: string, localizations: Array<{ __typename?: 'CommonContent', supportUrl: string } | null> } | null, defaultPurchase: { __typename?: 'Purchase', stripePlanChoices: Array<{ __typename?: 'ComponentStripeStripePlanChoices', stripePlanChoice: string } | null> | null, purchaseDetails: { __typename?: 'PurchaseDetail', productName: string, webIcon: string, localizations: Array<{ __typename?: 'PurchaseDetail', productName: string, webIcon: string } | null> } | null } | null, subGroups: Array<{ __typename?: 'Subgroup', groupName: string | null, offerings: Array<{ __typename?: 'Offering', apiIdentifier: string } | null> } | null> } | null } | null> };

export type LocalesQueryVariables = Exact<{ [key: string]: never; }>;


export type LocalesQuery = { __typename?: 'Query', i18NLocales: Array<{ __typename?: 'I18NLocale', code: string | null } | null> };

export type OfferingQueryVariables = Exact<{
  id: Scalars['ID']['input'];
  locale: Scalars['String']['input'];
}>;


export type OfferingQuery = { __typename?: 'Query', offering: { __typename?: 'Offering', stripeProductId: string, countries: any, defaultPurchase: { __typename?: 'Purchase', purchaseDetails: { __typename?: 'PurchaseDetail', productName: string, details: string, subtitle: string | null, webIcon: string, localizations: Array<{ __typename?: 'PurchaseDetail', productName: string, details: string, subtitle: string | null, webIcon: string } | null> } | null } | null } | null };

export type PageContentByPriceIdsQueryVariables = Exact<{
  locale: Scalars['String']['input'];
  stripePlanIds: Array<InputMaybe<Scalars['String']['input']>> | InputMaybe<Scalars['String']['input']>;
}>;


export type PageContentByPriceIdsQuery = { __typename?: 'Query', purchases: Array<{ __typename?: 'Purchase', offering: { __typename?: 'Offering', stripeLegacyPlans: Array<{ __typename?: 'ComponentStripeStripeLegacyPlans', stripeLegacyPlan: string } | null> | null, commonContent: { __typename?: 'CommonContent', supportUrl: string, localizations: Array<{ __typename?: 'CommonContent', supportUrl: string } | null> } | null } | null, purchaseDetails: { __typename?: 'PurchaseDetail', productName: string, webIcon: string, localizations: Array<{ __typename?: 'PurchaseDetail', productName: string, webIcon: string } | null> } | null, stripePlanChoices: Array<{ __typename?: 'ComponentStripeStripePlanChoices', stripePlanChoice: string } | null> | null } | null> };

export type PageContentForOfferingQueryVariables = Exact<{
  locale: Scalars['String']['input'];
  apiIdentifier: Scalars['String']['input'];
}>;


export type PageContentForOfferingQuery = { __typename?: 'Query', offerings: Array<{ __typename?: 'Offering', apiIdentifier: string, countries: any, stripeProductId: string, defaultPurchase: { __typename?: 'Purchase', purchaseDetails: { __typename?: 'PurchaseDetail', details: string, productName: string, subtitle: string | null, webIcon: string, localizations: Array<{ __typename?: 'PurchaseDetail', details: string, productName: string, subtitle: string | null, webIcon: string } | null> } | null } | null, commonContent: { __typename?: 'CommonContent', privacyNoticeUrl: string, privacyNoticeDownloadUrl: string, termsOfServiceUrl: string, termsOfServiceDownloadUrl: string, cancellationUrl: string | null, emailIcon: string | null, successActionButtonUrl: string, successActionButtonLabel: string | null, newsletterLabelTextCode: string | null, newsletterSlug: any | null, localizations: Array<{ __typename?: 'CommonContent', privacyNoticeUrl: string, privacyNoticeDownloadUrl: string, termsOfServiceUrl: string, termsOfServiceDownloadUrl: string, cancellationUrl: string | null, emailIcon: string | null, successActionButtonUrl: string, successActionButtonLabel: string | null, newsletterLabelTextCode: string | null, newsletterSlug: any | null } | null> } | null } | null> };

export type PurchaseWithDetailsOfferingContentQueryVariables = Exact<{
  locale: Scalars['String']['input'];
  stripePlanIds: Array<InputMaybe<Scalars['String']['input']>> | InputMaybe<Scalars['String']['input']>;
}>;


export type PurchaseWithDetailsOfferingContentQuery = { __typename?: 'Query', purchases: Array<{ __typename?: 'Purchase', stripePlanChoices: Array<{ __typename?: 'ComponentStripeStripePlanChoices', stripePlanChoice: string } | null> | null, purchaseDetails: { __typename?: 'PurchaseDetail', details: string, productName: string, subtitle: string | null, webIcon: string, localizations: Array<{ __typename?: 'PurchaseDetail', details: string, productName: string, subtitle: string | null, webIcon: string } | null> } | null, offering: { __typename?: 'Offering', stripeProductId: string, stripeLegacyPlans: Array<{ __typename?: 'ComponentStripeStripeLegacyPlans', stripeLegacyPlan: string } | null> | null, commonContent: { __typename?: 'CommonContent', privacyNoticeUrl: string, privacyNoticeDownloadUrl: string, termsOfServiceUrl: string, termsOfServiceDownloadUrl: string, cancellationUrl: string | null, emailIcon: string | null, successActionButtonUrl: string, successActionButtonLabel: string | null, newsletterLabelTextCode: string | null, newsletterSlug: any | null, localizations: Array<{ __typename?: 'CommonContent', privacyNoticeUrl: string, privacyNoticeDownloadUrl: string, termsOfServiceUrl: string, termsOfServiceDownloadUrl: string, cancellationUrl: string | null, emailIcon: string | null, successActionButtonUrl: string, successActionButtonLabel: string | null, newsletterLabelTextCode: string | null, newsletterSlug: any | null } | null> } | null } | null } | null> };

export type RelyingPartiesQueryVariables = Exact<{
  clientId: Scalars['String']['input'];
  entrypoint: Scalars['String']['input'];
}>;


export type RelyingPartiesQuery = { __typename?: 'Query', relyingParties: Array<{ __typename?: 'RelyingParty', clientId: string | null, entrypoint: string | null, name: string | null, l10nId: string | null, shared: { __typename?: 'ComponentAccountsShared', buttonColor: string | null, logoUrl: string | null, logoAltText: string | null, emailFromName: string | null, emailLogoUrl: string | null, emailLogoAltText: string | null, emailLogoWidth: string | null, pageTitle: string | null, headerLogoUrl: string | null, headerLogoAltText: string | null, favicon: string | null, featureFlags: { __typename?: 'ComponentAccountsFeatureFlags', syncConfirmedPageHideCTA: boolean | null, syncHidePromoAfterLogin: boolean | null } | null, backgrounds: { __typename?: 'ComponentAccountsSharedBackgrounds', defaultLayout: string | null, header: string | null, splitLayout: string | null, splitLayoutAltText: string | null } | null }, EmailFirstPage: { __typename?: 'ComponentAccountsPageConfig', logoUrl: string | null, logoAltText: string | null, headline: string, description: string | null, primaryButtonText: string, pageTitle: string | null, splitLayout: boolean | null }, SignupSetPasswordPage: { __typename?: 'ComponentAccountsPageConfig', logoUrl: string | null, logoAltText: string | null, headline: string, description: string | null, primaryButtonText: string, pageTitle: string | null, splitLayout: boolean | null }, SignupConfirmCodePage: { __typename?: 'ComponentAccountsPageConfig', headline: string, description: string | null, primaryButtonText: string, pageTitle: string | null, splitLayout: boolean | null }, SignupConfirmedSyncPage: { __typename?: 'ComponentAccountsPageConfig', headline: string, description: string | null, primaryButtonText: string, pageTitle: string | null, splitLayout: boolean | null, primaryImage: { __typename?: 'ComponentAccountsImage', url: string, altText: string } | null } | null, SigninPage: { __typename?: 'ComponentAccountsPageConfig', headline: string, description: string | null, primaryButtonText: string, pageTitle: string | null, splitLayout: boolean | null }, SigninTokenCodePage: { __typename?: 'ComponentAccountsPageConfig', headline: string, description: string | null, primaryButtonText: string, pageTitle: string | null, splitLayout: boolean | null } | null, SigninUnblockCodePage: { __typename?: 'ComponentAccountsPageConfig', headline: string, description: string | null, primaryButtonText: string, pageTitle: string | null, splitLayout: boolean | null } | null, NewDeviceLoginEmail: { __typename?: 'ComponentAccountsEmailConfig', subject: string, headline: string, description: string } | null, VerifyLoginCodeEmail: { __typename?: 'ComponentAccountsEmailConfig', subject: string, headline: string, description: string } | null, VerifyShortCodeEmail: { __typename?: 'ComponentAccountsEmailConfig', subject: string, headline: string, description: string } | null } | null> };

export type ServicesWithCapabilitiesQueryVariables = Exact<{ [key: string]: never; }>;


export type ServicesWithCapabilitiesQuery = { __typename?: 'Query', services: Array<{ __typename?: 'Service', oauthClientId: string, capabilities: Array<{ __typename?: 'Capability', slug: string } | null> } | null> };


export const CapabilityServiceByPlanIdsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CapabilityServiceByPlanIds"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"stripePlanIds"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"purchases"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"or"},"value":{"kind":"ListValue","values":[{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"stripePlanChoices"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"stripePlanChoice"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"in"},"value":{"kind":"Variable","name":{"kind":"Name","value":"stripePlanIds"}}}]}}]}}]},{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"offering"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"stripeLegacyPlans"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"stripeLegacyPlan"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"in"},"value":{"kind":"Variable","name":{"kind":"Name","value":"stripePlanIds"}}}]}}]}}]}}]}]}}]}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"200"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stripePlanChoices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stripePlanChoice"}}]}},{"kind":"Field","name":{"kind":"Name","value":"offering"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stripeLegacyPlans"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"200"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stripeLegacyPlan"}}]}},{"kind":"Field","name":{"kind":"Name","value":"capabilities"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"services"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"oauthClientId"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<CapabilityServiceByPlanIdsQuery, CapabilityServiceByPlanIdsQueryVariables>;
export const ChurnInterventionByOfferingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ChurnInterventionByOffering"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"apiIdentifier"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"interval"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"locale"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"offerings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"apiIdentifier"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"eq"},"value":{"kind":"Variable","name":{"kind":"Name","value":"apiIdentifier"}}}]}}]}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"200"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"defaultPurchase"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"purchaseDetails"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"webIcon"}},{"kind":"Field","name":{"kind":"Name","value":"localizations"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"locale"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"eq"},"value":{"kind":"Variable","name":{"kind":"Name","value":"locale"}}}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"webIcon"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"commonContent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"supportUrl"}}]}},{"kind":"Field","name":{"kind":"Name","value":"churnInterventions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"interval"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"eq"},"value":{"kind":"Variable","name":{"kind":"Name","value":"interval"}}}]}}]}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"200"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"churnInterventionId"}},{"kind":"Field","name":{"kind":"Name","value":"churnType"}},{"kind":"Field","name":{"kind":"Name","value":"redemptionLimit"}},{"kind":"Field","name":{"kind":"Name","value":"stripeCouponId"}},{"kind":"Field","name":{"kind":"Name","value":"interval"}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"}},{"kind":"Field","name":{"kind":"Name","value":"ctaMessage"}},{"kind":"Field","name":{"kind":"Name","value":"modalHeading"}},{"kind":"Field","name":{"kind":"Name","value":"modalMessage"}},{"kind":"Field","name":{"kind":"Name","value":"productPageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"termsHeading"}},{"kind":"Field","name":{"kind":"Name","value":"termsDetails"}}]}}]}}]}}]} as unknown as DocumentNode<ChurnInterventionByOfferingQuery, ChurnInterventionByOfferingQueryVariables>;
export const EligibilityContentByOfferingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"EligibilityContentByOffering"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"apiIdentifier"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"offerings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"apiIdentifier"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"eq"},"value":{"kind":"Variable","name":{"kind":"Name","value":"apiIdentifier"}}}]}}]}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"200"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"apiIdentifier"}},{"kind":"Field","name":{"kind":"Name","value":"stripeProductId"}},{"kind":"Field","name":{"kind":"Name","value":"defaultPurchase"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stripePlanChoices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stripePlanChoice"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"subGroups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"groupName"}},{"kind":"Field","name":{"kind":"Name","value":"offerings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"apiIdentifier"}},{"kind":"Field","name":{"kind":"Name","value":"stripeProductId"}},{"kind":"Field","name":{"kind":"Name","value":"defaultPurchase"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stripePlanChoices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stripePlanChoice"}}]}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<EligibilityContentByOfferingQuery, EligibilityContentByOfferingQueryVariables>;
export const EligibilityContentByPlanIdsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"EligibilityContentByPlanIds"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"stripePlanIds"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"purchases"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"or"},"value":{"kind":"ListValue","values":[{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"stripePlanChoices"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"stripePlanChoice"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"in"},"value":{"kind":"Variable","name":{"kind":"Name","value":"stripePlanIds"}}}]}}]}}]},{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"offering"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"stripeLegacyPlans"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"stripeLegacyPlan"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"in"},"value":{"kind":"Variable","name":{"kind":"Name","value":"stripePlanIds"}}}]}}]}}]}}]}]}}]}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"200"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stripePlanChoices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stripePlanChoice"}}]}},{"kind":"Field","name":{"kind":"Name","value":"offering"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"apiIdentifier"}},{"kind":"Field","name":{"kind":"Name","value":"stripeProductId"}},{"kind":"Field","name":{"kind":"Name","value":"stripeLegacyPlans"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"200"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stripeLegacyPlan"}}]}},{"kind":"Field","name":{"kind":"Name","value":"countries"}},{"kind":"Field","name":{"kind":"Name","value":"subGroups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"groupName"}},{"kind":"Field","name":{"kind":"Name","value":"offerings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"apiIdentifier"}},{"kind":"Field","name":{"kind":"Name","value":"stripeProductId"}},{"kind":"Field","name":{"kind":"Name","value":"stripeLegacyPlans"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"200"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stripeLegacyPlan"}}]}},{"kind":"Field","name":{"kind":"Name","value":"countries"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<EligibilityContentByPlanIdsQuery, EligibilityContentByPlanIdsQueryVariables>;
export const IapOfferingsByStoreIDsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"IapOfferingsByStoreIDs"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"locale"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeIDs"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"iaps"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"storeID"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"in"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeIDs"}}}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"storeID"}},{"kind":"Field","name":{"kind":"Name","value":"interval"}},{"kind":"Field","name":{"kind":"Name","value":"offering"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"apiIdentifier"}},{"kind":"Field","name":{"kind":"Name","value":"commonContent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"supportUrl"}},{"kind":"Field","name":{"kind":"Name","value":"localizations"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"locale"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"eq"},"value":{"kind":"Variable","name":{"kind":"Name","value":"locale"}}}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"supportUrl"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"defaultPurchase"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stripePlanChoices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stripePlanChoice"}}]}},{"kind":"Field","name":{"kind":"Name","value":"purchaseDetails"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"webIcon"}},{"kind":"Field","name":{"kind":"Name","value":"localizations"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"locale"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"eq"},"value":{"kind":"Variable","name":{"kind":"Name","value":"locale"}}}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"webIcon"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"subGroups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"groupName"}},{"kind":"Field","name":{"kind":"Name","value":"offerings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"apiIdentifier"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<IapOfferingsByStoreIDsQuery, IapOfferingsByStoreIDsQueryVariables>;
export const LocalesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Locales"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"i18NLocales"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"100"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}}]} as unknown as DocumentNode<LocalesQuery, LocalesQueryVariables>;
export const OfferingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Offering"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"locale"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"offering"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"documentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stripeProductId"}},{"kind":"Field","name":{"kind":"Name","value":"countries"}},{"kind":"Field","name":{"kind":"Name","value":"defaultPurchase"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"purchaseDetails"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"details"}},{"kind":"Field","name":{"kind":"Name","value":"subtitle"}},{"kind":"Field","name":{"kind":"Name","value":"webIcon"}},{"kind":"Field","name":{"kind":"Name","value":"localizations"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"locale"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"eq"},"value":{"kind":"Variable","name":{"kind":"Name","value":"locale"}}}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"details"}},{"kind":"Field","name":{"kind":"Name","value":"subtitle"}},{"kind":"Field","name":{"kind":"Name","value":"webIcon"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<OfferingQuery, OfferingQueryVariables>;
export const PageContentByPriceIdsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"pageContentByPriceIds"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"locale"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"stripePlanIds"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"purchases"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"or"},"value":{"kind":"ListValue","values":[{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"stripePlanChoices"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"stripePlanChoice"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"in"},"value":{"kind":"Variable","name":{"kind":"Name","value":"stripePlanIds"}}}]}}]}}]},{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"offering"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"stripeLegacyPlans"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"stripeLegacyPlan"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"in"},"value":{"kind":"Variable","name":{"kind":"Name","value":"stripePlanIds"}}}]}}]}}]}}]}]}}]}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"50"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"offering"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stripeLegacyPlans"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"100"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stripeLegacyPlan"}}]}},{"kind":"Field","name":{"kind":"Name","value":"commonContent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"supportUrl"}},{"kind":"Field","name":{"kind":"Name","value":"localizations"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"locale"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"eq"},"value":{"kind":"Variable","name":{"kind":"Name","value":"locale"}}}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"supportUrl"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"purchaseDetails"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"webIcon"}},{"kind":"Field","name":{"kind":"Name","value":"localizations"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"locale"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"eq"},"value":{"kind":"Variable","name":{"kind":"Name","value":"locale"}}}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"webIcon"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"stripePlanChoices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stripePlanChoice"}}]}}]}}]}}]} as unknown as DocumentNode<PageContentByPriceIdsQuery, PageContentByPriceIdsQueryVariables>;
export const PageContentForOfferingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PageContentForOffering"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"locale"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"apiIdentifier"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"offerings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"apiIdentifier"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"eq"},"value":{"kind":"Variable","name":{"kind":"Name","value":"apiIdentifier"}}}]}}]}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"200"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"apiIdentifier"}},{"kind":"Field","name":{"kind":"Name","value":"countries"}},{"kind":"Field","name":{"kind":"Name","value":"stripeProductId"}},{"kind":"Field","name":{"kind":"Name","value":"defaultPurchase"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"purchaseDetails"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"details"}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"subtitle"}},{"kind":"Field","name":{"kind":"Name","value":"webIcon"}},{"kind":"Field","name":{"kind":"Name","value":"localizations"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"locale"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"eq"},"value":{"kind":"Variable","name":{"kind":"Name","value":"locale"}}}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"details"}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"subtitle"}},{"kind":"Field","name":{"kind":"Name","value":"webIcon"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"commonContent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"privacyNoticeUrl"}},{"kind":"Field","name":{"kind":"Name","value":"privacyNoticeDownloadUrl"}},{"kind":"Field","name":{"kind":"Name","value":"termsOfServiceUrl"}},{"kind":"Field","name":{"kind":"Name","value":"termsOfServiceDownloadUrl"}},{"kind":"Field","name":{"kind":"Name","value":"cancellationUrl"}},{"kind":"Field","name":{"kind":"Name","value":"emailIcon"}},{"kind":"Field","name":{"kind":"Name","value":"successActionButtonUrl"}},{"kind":"Field","name":{"kind":"Name","value":"successActionButtonLabel"}},{"kind":"Field","name":{"kind":"Name","value":"newsletterLabelTextCode"}},{"kind":"Field","name":{"kind":"Name","value":"newsletterSlug"}},{"kind":"Field","name":{"kind":"Name","value":"localizations"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"locale"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"eq"},"value":{"kind":"Variable","name":{"kind":"Name","value":"locale"}}}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"privacyNoticeUrl"}},{"kind":"Field","name":{"kind":"Name","value":"privacyNoticeDownloadUrl"}},{"kind":"Field","name":{"kind":"Name","value":"termsOfServiceUrl"}},{"kind":"Field","name":{"kind":"Name","value":"termsOfServiceDownloadUrl"}},{"kind":"Field","name":{"kind":"Name","value":"cancellationUrl"}},{"kind":"Field","name":{"kind":"Name","value":"emailIcon"}},{"kind":"Field","name":{"kind":"Name","value":"successActionButtonUrl"}},{"kind":"Field","name":{"kind":"Name","value":"successActionButtonLabel"}},{"kind":"Field","name":{"kind":"Name","value":"newsletterLabelTextCode"}},{"kind":"Field","name":{"kind":"Name","value":"newsletterSlug"}}]}}]}}]}}]}}]} as unknown as DocumentNode<PageContentForOfferingQuery, PageContentForOfferingQueryVariables>;
export const PurchaseWithDetailsOfferingContentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PurchaseWithDetailsOfferingContent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"locale"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"stripePlanIds"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"purchases"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"or"},"value":{"kind":"ListValue","values":[{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"stripePlanChoices"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"stripePlanChoice"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"in"},"value":{"kind":"Variable","name":{"kind":"Name","value":"stripePlanIds"}}}]}}]}}]},{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"offering"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"stripeLegacyPlans"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"stripeLegacyPlan"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"in"},"value":{"kind":"Variable","name":{"kind":"Name","value":"stripePlanIds"}}}]}}]}}]}}]}]}}]}},{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"500"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stripePlanChoices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stripePlanChoice"}}]}},{"kind":"Field","name":{"kind":"Name","value":"purchaseDetails"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"details"}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"subtitle"}},{"kind":"Field","name":{"kind":"Name","value":"webIcon"}},{"kind":"Field","name":{"kind":"Name","value":"localizations"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"locale"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"eq"},"value":{"kind":"Variable","name":{"kind":"Name","value":"locale"}}}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"details"}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"subtitle"}},{"kind":"Field","name":{"kind":"Name","value":"webIcon"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"offering"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stripeProductId"}},{"kind":"Field","name":{"kind":"Name","value":"stripeLegacyPlans"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"200"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stripeLegacyPlan"}}]}},{"kind":"Field","name":{"kind":"Name","value":"commonContent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"privacyNoticeUrl"}},{"kind":"Field","name":{"kind":"Name","value":"privacyNoticeDownloadUrl"}},{"kind":"Field","name":{"kind":"Name","value":"termsOfServiceUrl"}},{"kind":"Field","name":{"kind":"Name","value":"termsOfServiceDownloadUrl"}},{"kind":"Field","name":{"kind":"Name","value":"cancellationUrl"}},{"kind":"Field","name":{"kind":"Name","value":"emailIcon"}},{"kind":"Field","name":{"kind":"Name","value":"successActionButtonUrl"}},{"kind":"Field","name":{"kind":"Name","value":"successActionButtonLabel"}},{"kind":"Field","name":{"kind":"Name","value":"newsletterLabelTextCode"}},{"kind":"Field","name":{"kind":"Name","value":"newsletterSlug"}},{"kind":"Field","name":{"kind":"Name","value":"localizations"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"locale"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"eq"},"value":{"kind":"Variable","name":{"kind":"Name","value":"locale"}}}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"privacyNoticeUrl"}},{"kind":"Field","name":{"kind":"Name","value":"privacyNoticeDownloadUrl"}},{"kind":"Field","name":{"kind":"Name","value":"termsOfServiceUrl"}},{"kind":"Field","name":{"kind":"Name","value":"termsOfServiceDownloadUrl"}},{"kind":"Field","name":{"kind":"Name","value":"cancellationUrl"}},{"kind":"Field","name":{"kind":"Name","value":"emailIcon"}},{"kind":"Field","name":{"kind":"Name","value":"successActionButtonUrl"}},{"kind":"Field","name":{"kind":"Name","value":"successActionButtonLabel"}},{"kind":"Field","name":{"kind":"Name","value":"newsletterLabelTextCode"}},{"kind":"Field","name":{"kind":"Name","value":"newsletterSlug"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<PurchaseWithDetailsOfferingContentQuery, PurchaseWithDetailsOfferingContentQueryVariables>;
export const RelyingPartiesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RelyingParties"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"clientId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"entrypoint"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"relyingParties"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"clientId"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"eq"},"value":{"kind":"Variable","name":{"kind":"Name","value":"clientId"}}}]}},{"kind":"ObjectField","name":{"kind":"Name","value":"entrypoint"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"eq"},"value":{"kind":"Variable","name":{"kind":"Name","value":"entrypoint"}}}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"clientId"}},{"kind":"Field","name":{"kind":"Name","value":"entrypoint"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"l10nId"}},{"kind":"Field","name":{"kind":"Name","value":"shared"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"buttonColor"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"logoAltText"}},{"kind":"Field","name":{"kind":"Name","value":"emailFromName"}},{"kind":"Field","name":{"kind":"Name","value":"emailLogoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"emailLogoAltText"}},{"kind":"Field","name":{"kind":"Name","value":"emailLogoWidth"}},{"kind":"Field","name":{"kind":"Name","value":"pageTitle"}},{"kind":"Field","name":{"kind":"Name","value":"headerLogoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"headerLogoAltText"}},{"kind":"Field","name":{"kind":"Name","value":"featureFlags"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"syncConfirmedPageHideCTA"}},{"kind":"Field","name":{"kind":"Name","value":"syncHidePromoAfterLogin"}}]}},{"kind":"Field","name":{"kind":"Name","value":"backgrounds"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"defaultLayout"}},{"kind":"Field","name":{"kind":"Name","value":"header"}},{"kind":"Field","name":{"kind":"Name","value":"splitLayout"}},{"kind":"Field","name":{"kind":"Name","value":"splitLayoutAltText"}}]}},{"kind":"Field","name":{"kind":"Name","value":"favicon"}}]}},{"kind":"Field","name":{"kind":"Name","value":"EmailFirstPage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"logoAltText"}},{"kind":"Field","name":{"kind":"Name","value":"headline"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"primaryButtonText"}},{"kind":"Field","name":{"kind":"Name","value":"pageTitle"}},{"kind":"Field","name":{"kind":"Name","value":"splitLayout"}}]}},{"kind":"Field","name":{"kind":"Name","value":"SignupSetPasswordPage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"logoAltText"}},{"kind":"Field","name":{"kind":"Name","value":"headline"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"primaryButtonText"}},{"kind":"Field","name":{"kind":"Name","value":"pageTitle"}},{"kind":"Field","name":{"kind":"Name","value":"splitLayout"}}]}},{"kind":"Field","name":{"kind":"Name","value":"SignupConfirmCodePage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"headline"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"primaryButtonText"}},{"kind":"Field","name":{"kind":"Name","value":"pageTitle"}},{"kind":"Field","name":{"kind":"Name","value":"splitLayout"}}]}},{"kind":"Field","name":{"kind":"Name","value":"SignupConfirmedSyncPage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"headline"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"primaryButtonText"}},{"kind":"Field","name":{"kind":"Name","value":"pageTitle"}},{"kind":"Field","name":{"kind":"Name","value":"primaryImage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"altText"}}]}},{"kind":"Field","name":{"kind":"Name","value":"splitLayout"}}]}},{"kind":"Field","name":{"kind":"Name","value":"SigninPage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"headline"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"primaryButtonText"}},{"kind":"Field","name":{"kind":"Name","value":"pageTitle"}},{"kind":"Field","name":{"kind":"Name","value":"splitLayout"}}]}},{"kind":"Field","name":{"kind":"Name","value":"SigninTokenCodePage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"headline"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"primaryButtonText"}},{"kind":"Field","name":{"kind":"Name","value":"pageTitle"}},{"kind":"Field","name":{"kind":"Name","value":"splitLayout"}}]}},{"kind":"Field","name":{"kind":"Name","value":"SigninUnblockCodePage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"headline"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"primaryButtonText"}},{"kind":"Field","name":{"kind":"Name","value":"pageTitle"}},{"kind":"Field","name":{"kind":"Name","value":"splitLayout"}}]}},{"kind":"Field","name":{"kind":"Name","value":"NewDeviceLoginEmail"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"headline"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}},{"kind":"Field","name":{"kind":"Name","value":"VerifyLoginCodeEmail"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"headline"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}},{"kind":"Field","name":{"kind":"Name","value":"VerifyShortCodeEmail"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"headline"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]}}]} as unknown as DocumentNode<RelyingPartiesQuery, RelyingPartiesQueryVariables>;
export const ServicesWithCapabilitiesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ServicesWithCapabilities"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"services"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"pagination"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"500"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"oauthClientId"}},{"kind":"Field","name":{"kind":"Name","value":"capabilities"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}}]}}]} as unknown as DocumentNode<ServicesWithCapabilitiesQuery, ServicesWithCapabilitiesQueryVariables>;
/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  DateTime: { input: any; output: any };
  /** A string used to identify an i18n locale */
  I18NLocaleCode: { input: any; output: any };
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: { input: any; output: any };
  /** The `Upload` scalar type represents a file upload. */
  Upload: { input: any; output: any };
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

export type Capability = {
  __typename?: 'Capability';
  createdAt: Maybe<Scalars['DateTime']['output']>;
  description: Maybe<Scalars['String']['output']>;
  internalName: Scalars['String']['output'];
  offerings: Maybe<OfferingRelationResponseCollection>;
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  services: Maybe<ServiceRelationResponseCollection>;
  slug: Scalars['String']['output'];
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};

export type CapabilityOfferingsArgs = {
  filters: InputMaybe<OfferingFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  publicationState?: InputMaybe<PublicationState>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type CapabilityServicesArgs = {
  filters: InputMaybe<ServiceFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  publicationState?: InputMaybe<PublicationState>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type CapabilityEntity = {
  __typename?: 'CapabilityEntity';
  attributes: Maybe<Capability>;
  id: Maybe<Scalars['ID']['output']>;
};

export type CapabilityEntityResponse = {
  __typename?: 'CapabilityEntityResponse';
  data: Maybe<CapabilityEntity>;
};

export type CapabilityEntityResponseCollection = {
  __typename?: 'CapabilityEntityResponseCollection';
  data: Array<CapabilityEntity>;
  meta: ResponseCollectionMeta;
};

export type CapabilityFiltersInput = {
  and: InputMaybe<Array<InputMaybe<CapabilityFiltersInput>>>;
  createdAt: InputMaybe<DateTimeFilterInput>;
  description: InputMaybe<StringFilterInput>;
  id: InputMaybe<IdFilterInput>;
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
  data: Array<CapabilityEntity>;
};

export type CommonContent = {
  __typename?: 'CommonContent';
  cancellationUrl: Maybe<Scalars['String']['output']>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  emailIcon: Maybe<Scalars['String']['output']>;
  internalName: Scalars['String']['output'];
  locale: Maybe<Scalars['String']['output']>;
  localizations: Maybe<CommonContentRelationResponseCollection>;
  newsletterLabelTextCode: Maybe<Scalars['String']['output']>;
  newsletterSlug: Maybe<Scalars['JSON']['output']>;
  privacyNoticeDownloadUrl: Scalars['String']['output'];
  privacyNoticeUrl: Scalars['String']['output'];
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  successActionButtonLabel: Maybe<Scalars['String']['output']>;
  successActionButtonUrl: Scalars['String']['output'];
  termsOfServiceDownloadUrl: Scalars['String']['output'];
  termsOfServiceUrl: Scalars['String']['output'];
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};

export type CommonContentLocalizationsArgs = {
  filters: InputMaybe<CommonContentFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  publicationState?: InputMaybe<PublicationState>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type CommonContentEntity = {
  __typename?: 'CommonContentEntity';
  attributes: Maybe<CommonContent>;
  id: Maybe<Scalars['ID']['output']>;
};

export type CommonContentEntityResponse = {
  __typename?: 'CommonContentEntityResponse';
  data: Maybe<CommonContentEntity>;
};

export type CommonContentEntityResponseCollection = {
  __typename?: 'CommonContentEntityResponseCollection';
  data: Array<CommonContentEntity>;
  meta: ResponseCollectionMeta;
};

export type CommonContentFiltersInput = {
  and: InputMaybe<Array<InputMaybe<CommonContentFiltersInput>>>;
  cancellationUrl: InputMaybe<StringFilterInput>;
  createdAt: InputMaybe<DateTimeFilterInput>;
  emailIcon: InputMaybe<StringFilterInput>;
  id: InputMaybe<IdFilterInput>;
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
  termsOfServiceDownloadUrl: InputMaybe<Scalars['String']['input']>;
  termsOfServiceUrl: InputMaybe<Scalars['String']['input']>;
};

export type CommonContentRelationResponseCollection = {
  __typename?: 'CommonContentRelationResponseCollection';
  data: Array<CommonContentEntity>;
};

export type ComponentIapAppleProductIDs = {
  __typename?: 'ComponentIapAppleProductIDs';
  appleProductID: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
};

export type ComponentIapAppleProductIDsFiltersInput = {
  and: InputMaybe<Array<InputMaybe<ComponentIapAppleProductIDsFiltersInput>>>;
  appleProductID: InputMaybe<StringFilterInput>;
  not: InputMaybe<ComponentIapAppleProductIDsFiltersInput>;
  or: InputMaybe<Array<InputMaybe<ComponentIapAppleProductIDsFiltersInput>>>;
};

export type ComponentIapAppleProductIDsInput = {
  appleProductID: InputMaybe<Scalars['String']['input']>;
  id: InputMaybe<Scalars['ID']['input']>;
};

export type ComponentIapGoogleSkUs = {
  __typename?: 'ComponentIapGoogleSkUs';
  googleSKU: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
};

export type ComponentIapGoogleSkUsFiltersInput = {
  and: InputMaybe<Array<InputMaybe<ComponentIapGoogleSkUsFiltersInput>>>;
  googleSKU: InputMaybe<StringFilterInput>;
  not: InputMaybe<ComponentIapGoogleSkUsFiltersInput>;
  or: InputMaybe<Array<InputMaybe<ComponentIapGoogleSkUsFiltersInput>>>;
};

export type ComponentIapGoogleSkUsInput = {
  googleSKU: InputMaybe<Scalars['String']['input']>;
  id: InputMaybe<Scalars['ID']['input']>;
};

export type ComponentStripeStripeLegacyPlans = {
  __typename?: 'ComponentStripeStripeLegacyPlans';
  id: Scalars['ID']['output'];
  stripeLegacyPlan: Maybe<Scalars['String']['output']>;
};

export type ComponentStripeStripeLegacyPlansFiltersInput = {
  and: InputMaybe<
    Array<InputMaybe<ComponentStripeStripeLegacyPlansFiltersInput>>
  >;
  not: InputMaybe<ComponentStripeStripeLegacyPlansFiltersInput>;
  or: InputMaybe<
    Array<InputMaybe<ComponentStripeStripeLegacyPlansFiltersInput>>
  >;
  stripeLegacyPlan: InputMaybe<StringFilterInput>;
};

export type ComponentStripeStripeLegacyPlansInput = {
  id: InputMaybe<Scalars['ID']['input']>;
  stripeLegacyPlan: InputMaybe<Scalars['String']['input']>;
};

export type ComponentStripeStripePlanChoices = {
  __typename?: 'ComponentStripeStripePlanChoices';
  id: Scalars['ID']['output'];
  stripePlanChoice: Maybe<Scalars['String']['output']>;
};

export type ComponentStripeStripePlanChoicesFiltersInput = {
  and: InputMaybe<
    Array<InputMaybe<ComponentStripeStripePlanChoicesFiltersInput>>
  >;
  not: InputMaybe<ComponentStripeStripePlanChoicesFiltersInput>;
  or: InputMaybe<
    Array<InputMaybe<ComponentStripeStripePlanChoicesFiltersInput>>
  >;
  stripePlanChoice: InputMaybe<StringFilterInput>;
};

export type ComponentStripeStripePlanChoicesInput = {
  id: InputMaybe<Scalars['ID']['input']>;
  stripePlanChoice: InputMaybe<Scalars['String']['input']>;
};

export type ComponentStripeStripePromoCodes = {
  __typename?: 'ComponentStripeStripePromoCodes';
  PromoCode: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
};

export type ComponentStripeStripePromoCodesFiltersInput = {
  PromoCode: InputMaybe<StringFilterInput>;
  and: InputMaybe<
    Array<InputMaybe<ComponentStripeStripePromoCodesFiltersInput>>
  >;
  not: InputMaybe<ComponentStripeStripePromoCodesFiltersInput>;
  or: InputMaybe<
    Array<InputMaybe<ComponentStripeStripePromoCodesFiltersInput>>
  >;
};

export type ComponentStripeStripePromoCodesInput = {
  PromoCode: InputMaybe<Scalars['String']['input']>;
  id: InputMaybe<Scalars['ID']['input']>;
};

export type ContentReleasesRelease = {
  __typename?: 'ContentReleasesRelease';
  actions: Maybe<ContentReleasesReleaseActionRelationResponseCollection>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  name: Scalars['String']['output'];
  releasedAt: Maybe<Scalars['DateTime']['output']>;
  scheduledAt: Maybe<Scalars['DateTime']['output']>;
  timezone: Maybe<Scalars['String']['output']>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};

export type ContentReleasesReleaseActionsArgs = {
  filters: InputMaybe<ContentReleasesReleaseActionFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ContentReleasesReleaseAction = {
  __typename?: 'ContentReleasesReleaseAction';
  contentType: Scalars['String']['output'];
  createdAt: Maybe<Scalars['DateTime']['output']>;
  entry: Maybe<GenericMorph>;
  locale: Maybe<Scalars['String']['output']>;
  release: Maybe<ContentReleasesReleaseEntityResponse>;
  type: Enum_Contentreleasesreleaseaction_Type;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};

export type ContentReleasesReleaseActionEntity = {
  __typename?: 'ContentReleasesReleaseActionEntity';
  attributes: Maybe<ContentReleasesReleaseAction>;
  id: Maybe<Scalars['ID']['output']>;
};

export type ContentReleasesReleaseActionEntityResponse = {
  __typename?: 'ContentReleasesReleaseActionEntityResponse';
  data: Maybe<ContentReleasesReleaseActionEntity>;
};

export type ContentReleasesReleaseActionEntityResponseCollection = {
  __typename?: 'ContentReleasesReleaseActionEntityResponseCollection';
  data: Array<ContentReleasesReleaseActionEntity>;
  meta: ResponseCollectionMeta;
};

export type ContentReleasesReleaseActionFiltersInput = {
  and: InputMaybe<Array<InputMaybe<ContentReleasesReleaseActionFiltersInput>>>;
  contentType: InputMaybe<StringFilterInput>;
  createdAt: InputMaybe<DateTimeFilterInput>;
  id: InputMaybe<IdFilterInput>;
  locale: InputMaybe<StringFilterInput>;
  not: InputMaybe<ContentReleasesReleaseActionFiltersInput>;
  or: InputMaybe<Array<InputMaybe<ContentReleasesReleaseActionFiltersInput>>>;
  release: InputMaybe<ContentReleasesReleaseFiltersInput>;
  type: InputMaybe<StringFilterInput>;
  updatedAt: InputMaybe<DateTimeFilterInput>;
};

export type ContentReleasesReleaseActionInput = {
  contentType: InputMaybe<Scalars['String']['input']>;
  locale: InputMaybe<Scalars['String']['input']>;
  release: InputMaybe<Scalars['ID']['input']>;
  type: InputMaybe<Enum_Contentreleasesreleaseaction_Type>;
};

export type ContentReleasesReleaseActionRelationResponseCollection = {
  __typename?: 'ContentReleasesReleaseActionRelationResponseCollection';
  data: Array<ContentReleasesReleaseActionEntity>;
};

export type ContentReleasesReleaseEntity = {
  __typename?: 'ContentReleasesReleaseEntity';
  attributes: Maybe<ContentReleasesRelease>;
  id: Maybe<Scalars['ID']['output']>;
};

export type ContentReleasesReleaseEntityResponse = {
  __typename?: 'ContentReleasesReleaseEntityResponse';
  data: Maybe<ContentReleasesReleaseEntity>;
};

export type ContentReleasesReleaseEntityResponseCollection = {
  __typename?: 'ContentReleasesReleaseEntityResponseCollection';
  data: Array<ContentReleasesReleaseEntity>;
  meta: ResponseCollectionMeta;
};

export type ContentReleasesReleaseFiltersInput = {
  actions: InputMaybe<ContentReleasesReleaseActionFiltersInput>;
  and: InputMaybe<Array<InputMaybe<ContentReleasesReleaseFiltersInput>>>;
  createdAt: InputMaybe<DateTimeFilterInput>;
  id: InputMaybe<IdFilterInput>;
  name: InputMaybe<StringFilterInput>;
  not: InputMaybe<ContentReleasesReleaseFiltersInput>;
  or: InputMaybe<Array<InputMaybe<ContentReleasesReleaseFiltersInput>>>;
  releasedAt: InputMaybe<DateTimeFilterInput>;
  scheduledAt: InputMaybe<DateTimeFilterInput>;
  timezone: InputMaybe<StringFilterInput>;
  updatedAt: InputMaybe<DateTimeFilterInput>;
};

export type ContentReleasesReleaseInput = {
  actions: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  name: InputMaybe<Scalars['String']['input']>;
  releasedAt: InputMaybe<Scalars['DateTime']['input']>;
  scheduledAt: InputMaybe<Scalars['DateTime']['input']>;
  timezone: InputMaybe<Scalars['String']['input']>;
};

export type CouponConfig = {
  __typename?: 'CouponConfig';
  countries: Maybe<Scalars['JSON']['output']>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
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

export type CouponConfigEntity = {
  __typename?: 'CouponConfigEntity';
  attributes: Maybe<CouponConfig>;
  id: Maybe<Scalars['ID']['output']>;
};

export type CouponConfigEntityResponse = {
  __typename?: 'CouponConfigEntityResponse';
  data: Maybe<CouponConfigEntity>;
};

export type CouponConfigEntityResponseCollection = {
  __typename?: 'CouponConfigEntityResponseCollection';
  data: Array<CouponConfigEntity>;
  meta: ResponseCollectionMeta;
};

export type CouponConfigFiltersInput = {
  and: InputMaybe<Array<InputMaybe<CouponConfigFiltersInput>>>;
  countries: InputMaybe<JsonFilterInput>;
  createdAt: InputMaybe<DateTimeFilterInput>;
  id: InputMaybe<IdFilterInput>;
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
  stripePromotionCodes: InputMaybe<
    Array<InputMaybe<ComponentStripeStripePromoCodesInput>>
  >;
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

export enum Enum_Contentreleasesreleaseaction_Type {
  Publish = 'publish',
  Unpublish = 'unpublish',
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

export type GenericMorph =
  | Capability
  | CommonContent
  | ComponentIapAppleProductIDs
  | ComponentIapGoogleSkUs
  | ComponentStripeStripeLegacyPlans
  | ComponentStripeStripePlanChoices
  | ComponentStripeStripePromoCodes
  | ContentReleasesRelease
  | ContentReleasesReleaseAction
  | CouponConfig
  | I18NLocale
  | Iap
  | Offering
  | Purchase
  | PurchaseDetail
  | Service
  | Subgroup
  | UploadFile
  | UploadFolder
  | UsersPermissionsPermission
  | UsersPermissionsRole
  | UsersPermissionsUser;

export type I18NLocale = {
  __typename?: 'I18NLocale';
  code: Maybe<Scalars['String']['output']>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  name: Maybe<Scalars['String']['output']>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};

export type I18NLocaleEntity = {
  __typename?: 'I18NLocaleEntity';
  attributes: Maybe<I18NLocale>;
  id: Maybe<Scalars['ID']['output']>;
};

export type I18NLocaleEntityResponse = {
  __typename?: 'I18NLocaleEntityResponse';
  data: Maybe<I18NLocaleEntity>;
};

export type I18NLocaleEntityResponseCollection = {
  __typename?: 'I18NLocaleEntityResponseCollection';
  data: Array<I18NLocaleEntity>;
  meta: ResponseCollectionMeta;
};

export type I18NLocaleFiltersInput = {
  and: InputMaybe<Array<InputMaybe<I18NLocaleFiltersInput>>>;
  code: InputMaybe<StringFilterInput>;
  createdAt: InputMaybe<DateTimeFilterInput>;
  id: InputMaybe<IdFilterInput>;
  name: InputMaybe<StringFilterInput>;
  not: InputMaybe<I18NLocaleFiltersInput>;
  or: InputMaybe<Array<InputMaybe<I18NLocaleFiltersInput>>>;
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
  appleProductIDs: Maybe<Array<Maybe<ComponentIapAppleProductIDs>>>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  googleSKUs: Maybe<Array<Maybe<ComponentIapGoogleSkUs>>>;
  internalName: Maybe<Scalars['String']['output']>;
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};

export type IapAppleProductIDsArgs = {
  filters: InputMaybe<ComponentIapAppleProductIDsFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type IapGoogleSkUsArgs = {
  filters: InputMaybe<ComponentIapGoogleSkUsFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type IapEntity = {
  __typename?: 'IapEntity';
  attributes: Maybe<Iap>;
  id: Maybe<Scalars['ID']['output']>;
};

export type IapEntityResponse = {
  __typename?: 'IapEntityResponse';
  data: Maybe<IapEntity>;
};

export type IapEntityResponseCollection = {
  __typename?: 'IapEntityResponseCollection';
  data: Array<IapEntity>;
  meta: ResponseCollectionMeta;
};

export type IapFiltersInput = {
  and: InputMaybe<Array<InputMaybe<IapFiltersInput>>>;
  appleProductIDs: InputMaybe<ComponentIapAppleProductIDsFiltersInput>;
  createdAt: InputMaybe<DateTimeFilterInput>;
  googleSKUs: InputMaybe<ComponentIapGoogleSkUsFiltersInput>;
  id: InputMaybe<IdFilterInput>;
  internalName: InputMaybe<StringFilterInput>;
  not: InputMaybe<IapFiltersInput>;
  or: InputMaybe<Array<InputMaybe<IapFiltersInput>>>;
  publishedAt: InputMaybe<DateTimeFilterInput>;
  updatedAt: InputMaybe<DateTimeFilterInput>;
};

export type IapInput = {
  appleProductIDs: InputMaybe<
    Array<InputMaybe<ComponentIapAppleProductIDsInput>>
  >;
  googleSKUs: InputMaybe<Array<InputMaybe<ComponentIapGoogleSkUsInput>>>;
  internalName: InputMaybe<Scalars['String']['input']>;
  publishedAt: InputMaybe<Scalars['DateTime']['input']>;
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
  createCapability: Maybe<CapabilityEntityResponse>;
  createCommonContent: Maybe<CommonContentEntityResponse>;
  createCommonContentLocalization: Maybe<CommonContentEntityResponse>;
  createContentReleasesRelease: Maybe<ContentReleasesReleaseEntityResponse>;
  createContentReleasesReleaseAction: Maybe<ContentReleasesReleaseActionEntityResponse>;
  createCouponConfig: Maybe<CouponConfigEntityResponse>;
  createIap: Maybe<IapEntityResponse>;
  createOffering: Maybe<OfferingEntityResponse>;
  createPurchase: Maybe<PurchaseEntityResponse>;
  createPurchaseDetail: Maybe<PurchaseDetailEntityResponse>;
  createPurchaseDetailLocalization: Maybe<PurchaseDetailEntityResponse>;
  createService: Maybe<ServiceEntityResponse>;
  createSubgroup: Maybe<SubgroupEntityResponse>;
  createUploadFile: Maybe<UploadFileEntityResponse>;
  createUploadFolder: Maybe<UploadFolderEntityResponse>;
  /** Create a new role */
  createUsersPermissionsRole: Maybe<UsersPermissionsCreateRolePayload>;
  /** Create a new user */
  createUsersPermissionsUser: UsersPermissionsUserEntityResponse;
  deleteCapability: Maybe<CapabilityEntityResponse>;
  deleteCommonContent: Maybe<CommonContentEntityResponse>;
  deleteContentReleasesRelease: Maybe<ContentReleasesReleaseEntityResponse>;
  deleteContentReleasesReleaseAction: Maybe<ContentReleasesReleaseActionEntityResponse>;
  deleteCouponConfig: Maybe<CouponConfigEntityResponse>;
  deleteIap: Maybe<IapEntityResponse>;
  deleteOffering: Maybe<OfferingEntityResponse>;
  deletePurchase: Maybe<PurchaseEntityResponse>;
  deletePurchaseDetail: Maybe<PurchaseDetailEntityResponse>;
  deleteService: Maybe<ServiceEntityResponse>;
  deleteSubgroup: Maybe<SubgroupEntityResponse>;
  deleteUploadFile: Maybe<UploadFileEntityResponse>;
  deleteUploadFolder: Maybe<UploadFolderEntityResponse>;
  /** Delete an existing role */
  deleteUsersPermissionsRole: Maybe<UsersPermissionsDeleteRolePayload>;
  /** Delete an existing user */
  deleteUsersPermissionsUser: UsersPermissionsUserEntityResponse;
  /** Confirm an email users email address */
  emailConfirmation: Maybe<UsersPermissionsLoginPayload>;
  /** Request a reset password token */
  forgotPassword: Maybe<UsersPermissionsPasswordPayload>;
  login: UsersPermissionsLoginPayload;
  multipleUpload: Array<Maybe<UploadFileEntityResponse>>;
  /** Register a user */
  register: UsersPermissionsLoginPayload;
  removeFile: Maybe<UploadFileEntityResponse>;
  /** Reset user password. Confirm with a code (resetToken from forgotPassword) */
  resetPassword: Maybe<UsersPermissionsLoginPayload>;
  updateCapability: Maybe<CapabilityEntityResponse>;
  updateCommonContent: Maybe<CommonContentEntityResponse>;
  updateContentReleasesRelease: Maybe<ContentReleasesReleaseEntityResponse>;
  updateContentReleasesReleaseAction: Maybe<ContentReleasesReleaseActionEntityResponse>;
  updateCouponConfig: Maybe<CouponConfigEntityResponse>;
  updateFileInfo: UploadFileEntityResponse;
  updateIap: Maybe<IapEntityResponse>;
  updateOffering: Maybe<OfferingEntityResponse>;
  updatePurchase: Maybe<PurchaseEntityResponse>;
  updatePurchaseDetail: Maybe<PurchaseDetailEntityResponse>;
  updateService: Maybe<ServiceEntityResponse>;
  updateSubgroup: Maybe<SubgroupEntityResponse>;
  updateUploadFile: Maybe<UploadFileEntityResponse>;
  updateUploadFolder: Maybe<UploadFolderEntityResponse>;
  /** Update an existing role */
  updateUsersPermissionsRole: Maybe<UsersPermissionsUpdateRolePayload>;
  /** Update an existing user */
  updateUsersPermissionsUser: UsersPermissionsUserEntityResponse;
  upload: UploadFileEntityResponse;
};

export type MutationChangePasswordArgs = {
  currentPassword: Scalars['String']['input'];
  password: Scalars['String']['input'];
  passwordConfirmation: Scalars['String']['input'];
};

export type MutationCreateCapabilityArgs = {
  data: CapabilityInput;
};

export type MutationCreateCommonContentArgs = {
  data: CommonContentInput;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};

export type MutationCreateCommonContentLocalizationArgs = {
  data: InputMaybe<CommonContentInput>;
  id: InputMaybe<Scalars['ID']['input']>;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};

export type MutationCreateContentReleasesReleaseArgs = {
  data: ContentReleasesReleaseInput;
};

export type MutationCreateContentReleasesReleaseActionArgs = {
  data: ContentReleasesReleaseActionInput;
};

export type MutationCreateCouponConfigArgs = {
  data: CouponConfigInput;
};

export type MutationCreateIapArgs = {
  data: IapInput;
};

export type MutationCreateOfferingArgs = {
  data: OfferingInput;
};

export type MutationCreatePurchaseArgs = {
  data: PurchaseInput;
};

export type MutationCreatePurchaseDetailArgs = {
  data: PurchaseDetailInput;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};

export type MutationCreatePurchaseDetailLocalizationArgs = {
  data: InputMaybe<PurchaseDetailInput>;
  id: InputMaybe<Scalars['ID']['input']>;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};

export type MutationCreateServiceArgs = {
  data: ServiceInput;
};

export type MutationCreateSubgroupArgs = {
  data: SubgroupInput;
};

export type MutationCreateUploadFileArgs = {
  data: UploadFileInput;
};

export type MutationCreateUploadFolderArgs = {
  data: UploadFolderInput;
};

export type MutationCreateUsersPermissionsRoleArgs = {
  data: UsersPermissionsRoleInput;
};

export type MutationCreateUsersPermissionsUserArgs = {
  data: UsersPermissionsUserInput;
};

export type MutationDeleteCapabilityArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteCommonContentArgs = {
  id: Scalars['ID']['input'];
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};

export type MutationDeleteContentReleasesReleaseArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteContentReleasesReleaseActionArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteCouponConfigArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteIapArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteOfferingArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeletePurchaseArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeletePurchaseDetailArgs = {
  id: Scalars['ID']['input'];
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};

export type MutationDeleteServiceArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteSubgroupArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteUploadFileArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteUploadFolderArgs = {
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

export type MutationMultipleUploadArgs = {
  field: InputMaybe<Scalars['String']['input']>;
  files: Array<InputMaybe<Scalars['Upload']['input']>>;
  ref: InputMaybe<Scalars['String']['input']>;
  refId: InputMaybe<Scalars['ID']['input']>;
};

export type MutationRegisterArgs = {
  input: UsersPermissionsRegisterInput;
};

export type MutationRemoveFileArgs = {
  id: Scalars['ID']['input'];
};

export type MutationResetPasswordArgs = {
  code: Scalars['String']['input'];
  password: Scalars['String']['input'];
  passwordConfirmation: Scalars['String']['input'];
};

export type MutationUpdateCapabilityArgs = {
  data: CapabilityInput;
  id: Scalars['ID']['input'];
};

export type MutationUpdateCommonContentArgs = {
  data: CommonContentInput;
  id: Scalars['ID']['input'];
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};

export type MutationUpdateContentReleasesReleaseArgs = {
  data: ContentReleasesReleaseInput;
  id: Scalars['ID']['input'];
};

export type MutationUpdateContentReleasesReleaseActionArgs = {
  data: ContentReleasesReleaseActionInput;
  id: Scalars['ID']['input'];
};

export type MutationUpdateCouponConfigArgs = {
  data: CouponConfigInput;
  id: Scalars['ID']['input'];
};

export type MutationUpdateFileInfoArgs = {
  id: Scalars['ID']['input'];
  info: InputMaybe<FileInfoInput>;
};

export type MutationUpdateIapArgs = {
  data: IapInput;
  id: Scalars['ID']['input'];
};

export type MutationUpdateOfferingArgs = {
  data: OfferingInput;
  id: Scalars['ID']['input'];
};

export type MutationUpdatePurchaseArgs = {
  data: PurchaseInput;
  id: Scalars['ID']['input'];
};

export type MutationUpdatePurchaseDetailArgs = {
  data: PurchaseDetailInput;
  id: Scalars['ID']['input'];
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};

export type MutationUpdateServiceArgs = {
  data: ServiceInput;
  id: Scalars['ID']['input'];
};

export type MutationUpdateSubgroupArgs = {
  data: SubgroupInput;
  id: Scalars['ID']['input'];
};

export type MutationUpdateUploadFileArgs = {
  data: UploadFileInput;
  id: Scalars['ID']['input'];
};

export type MutationUpdateUploadFolderArgs = {
  data: UploadFolderInput;
  id: Scalars['ID']['input'];
};

export type MutationUpdateUsersPermissionsRoleArgs = {
  data: UsersPermissionsRoleInput;
  id: Scalars['ID']['input'];
};

export type MutationUpdateUsersPermissionsUserArgs = {
  data: UsersPermissionsUserInput;
  id: Scalars['ID']['input'];
};

export type MutationUploadArgs = {
  field: InputMaybe<Scalars['String']['input']>;
  file: Scalars['Upload']['input'];
  info: InputMaybe<FileInfoInput>;
  ref: InputMaybe<Scalars['String']['input']>;
  refId: InputMaybe<Scalars['ID']['input']>;
};

export type Offering = {
  __typename?: 'Offering';
  apiIdentifier: Scalars['String']['output'];
  capabilities: Maybe<CapabilityRelationResponseCollection>;
  commonContent: Maybe<CommonContentEntityResponse>;
  countries: Maybe<Scalars['JSON']['output']>;
  couponConfig: Maybe<CouponConfigEntityResponse>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  defaultPurchase: Maybe<PurchaseEntityResponse>;
  description: Maybe<Scalars['String']['output']>;
  experimentPurchase: Maybe<PurchaseEntityResponse>;
  iap: Maybe<IapEntityResponse>;
  internalName: Scalars['String']['output'];
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  stripeLegacyPlans: Maybe<Array<Maybe<ComponentStripeStripeLegacyPlans>>>;
  stripeProductId: Scalars['String']['output'];
  subGroups: Maybe<SubgroupRelationResponseCollection>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};

export type OfferingCapabilitiesArgs = {
  filters: InputMaybe<CapabilityFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  publicationState?: InputMaybe<PublicationState>;
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
  publicationState?: InputMaybe<PublicationState>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type OfferingEntity = {
  __typename?: 'OfferingEntity';
  attributes: Maybe<Offering>;
  id: Maybe<Scalars['ID']['output']>;
};

export type OfferingEntityResponse = {
  __typename?: 'OfferingEntityResponse';
  data: Maybe<OfferingEntity>;
};

export type OfferingEntityResponseCollection = {
  __typename?: 'OfferingEntityResponseCollection';
  data: Array<OfferingEntity>;
  meta: ResponseCollectionMeta;
};

export type OfferingFiltersInput = {
  and: InputMaybe<Array<InputMaybe<OfferingFiltersInput>>>;
  apiIdentifier: InputMaybe<StringFilterInput>;
  capabilities: InputMaybe<CapabilityFiltersInput>;
  commonContent: InputMaybe<CommonContentFiltersInput>;
  countries: InputMaybe<JsonFilterInput>;
  couponConfig: InputMaybe<CouponConfigFiltersInput>;
  createdAt: InputMaybe<DateTimeFilterInput>;
  defaultPurchase: InputMaybe<PurchaseFiltersInput>;
  description: InputMaybe<StringFilterInput>;
  experimentPurchase: InputMaybe<PurchaseFiltersInput>;
  iap: InputMaybe<IapFiltersInput>;
  id: InputMaybe<IdFilterInput>;
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
  capabilities: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  commonContent: InputMaybe<Scalars['ID']['input']>;
  countries: InputMaybe<Scalars['JSON']['input']>;
  couponConfig: InputMaybe<Scalars['ID']['input']>;
  defaultPurchase: InputMaybe<Scalars['ID']['input']>;
  description: InputMaybe<Scalars['String']['input']>;
  experimentPurchase: InputMaybe<Scalars['ID']['input']>;
  iap: InputMaybe<Scalars['ID']['input']>;
  internalName: InputMaybe<Scalars['String']['input']>;
  publishedAt: InputMaybe<Scalars['DateTime']['input']>;
  stripeLegacyPlans: InputMaybe<
    Array<InputMaybe<ComponentStripeStripeLegacyPlansInput>>
  >;
  stripeProductId: InputMaybe<Scalars['String']['input']>;
  subGroups: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};

export type OfferingRelationResponseCollection = {
  __typename?: 'OfferingRelationResponseCollection';
  data: Array<OfferingEntity>;
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

export enum PublicationState {
  Live = 'LIVE',
  Preview = 'PREVIEW',
}

export type Purchase = {
  __typename?: 'Purchase';
  createdAt: Maybe<Scalars['DateTime']['output']>;
  description: Maybe<Scalars['String']['output']>;
  internalName: Scalars['String']['output'];
  offering: Maybe<OfferingEntityResponse>;
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  purchaseDetails: Maybe<PurchaseDetailEntityResponse>;
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
  internalName: Scalars['String']['output'];
  locale: Maybe<Scalars['String']['output']>;
  localizations: Maybe<PurchaseDetailRelationResponseCollection>;
  productName: Scalars['String']['output'];
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  subtitle: Maybe<Scalars['String']['output']>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
  webIcon: Scalars['String']['output'];
};

export type PurchaseDetailLocalizationsArgs = {
  filters: InputMaybe<PurchaseDetailFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  publicationState?: InputMaybe<PublicationState>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type PurchaseDetailEntity = {
  __typename?: 'PurchaseDetailEntity';
  attributes: Maybe<PurchaseDetail>;
  id: Maybe<Scalars['ID']['output']>;
};

export type PurchaseDetailEntityResponse = {
  __typename?: 'PurchaseDetailEntityResponse';
  data: Maybe<PurchaseDetailEntity>;
};

export type PurchaseDetailEntityResponseCollection = {
  __typename?: 'PurchaseDetailEntityResponseCollection';
  data: Array<PurchaseDetailEntity>;
  meta: ResponseCollectionMeta;
};

export type PurchaseDetailFiltersInput = {
  and: InputMaybe<Array<InputMaybe<PurchaseDetailFiltersInput>>>;
  createdAt: InputMaybe<DateTimeFilterInput>;
  details: InputMaybe<StringFilterInput>;
  id: InputMaybe<IdFilterInput>;
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
  data: Array<PurchaseDetailEntity>;
};

export type PurchaseEntity = {
  __typename?: 'PurchaseEntity';
  attributes: Maybe<Purchase>;
  id: Maybe<Scalars['ID']['output']>;
};

export type PurchaseEntityResponse = {
  __typename?: 'PurchaseEntityResponse';
  data: Maybe<PurchaseEntity>;
};

export type PurchaseEntityResponseCollection = {
  __typename?: 'PurchaseEntityResponseCollection';
  data: Array<PurchaseEntity>;
  meta: ResponseCollectionMeta;
};

export type PurchaseFiltersInput = {
  and: InputMaybe<Array<InputMaybe<PurchaseFiltersInput>>>;
  createdAt: InputMaybe<DateTimeFilterInput>;
  description: InputMaybe<StringFilterInput>;
  id: InputMaybe<IdFilterInput>;
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
  stripePlanChoices: InputMaybe<
    Array<InputMaybe<ComponentStripeStripePlanChoicesInput>>
  >;
};

export type Query = {
  __typename?: 'Query';
  capabilities: Maybe<CapabilityEntityResponseCollection>;
  capability: Maybe<CapabilityEntityResponse>;
  commonContent: Maybe<CommonContentEntityResponse>;
  commonContents: Maybe<CommonContentEntityResponseCollection>;
  contentReleasesRelease: Maybe<ContentReleasesReleaseEntityResponse>;
  contentReleasesReleaseAction: Maybe<ContentReleasesReleaseActionEntityResponse>;
  contentReleasesReleaseActions: Maybe<ContentReleasesReleaseActionEntityResponseCollection>;
  contentReleasesReleases: Maybe<ContentReleasesReleaseEntityResponseCollection>;
  couponConfig: Maybe<CouponConfigEntityResponse>;
  couponConfigs: Maybe<CouponConfigEntityResponseCollection>;
  i18NLocale: Maybe<I18NLocaleEntityResponse>;
  i18NLocales: Maybe<I18NLocaleEntityResponseCollection>;
  iap: Maybe<IapEntityResponse>;
  iaps: Maybe<IapEntityResponseCollection>;
  me: Maybe<UsersPermissionsMe>;
  offering: Maybe<OfferingEntityResponse>;
  offerings: Maybe<OfferingEntityResponseCollection>;
  purchase: Maybe<PurchaseEntityResponse>;
  purchaseDetail: Maybe<PurchaseDetailEntityResponse>;
  purchaseDetails: Maybe<PurchaseDetailEntityResponseCollection>;
  purchases: Maybe<PurchaseEntityResponseCollection>;
  service: Maybe<ServiceEntityResponse>;
  services: Maybe<ServiceEntityResponseCollection>;
  subgroup: Maybe<SubgroupEntityResponse>;
  subgroups: Maybe<SubgroupEntityResponseCollection>;
  uploadFile: Maybe<UploadFileEntityResponse>;
  uploadFiles: Maybe<UploadFileEntityResponseCollection>;
  uploadFolder: Maybe<UploadFolderEntityResponse>;
  uploadFolders: Maybe<UploadFolderEntityResponseCollection>;
  usersPermissionsRole: Maybe<UsersPermissionsRoleEntityResponse>;
  usersPermissionsRoles: Maybe<UsersPermissionsRoleEntityResponseCollection>;
  usersPermissionsUser: Maybe<UsersPermissionsUserEntityResponse>;
  usersPermissionsUsers: Maybe<UsersPermissionsUserEntityResponseCollection>;
};

export type QueryCapabilitiesArgs = {
  filters: InputMaybe<CapabilityFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  publicationState?: InputMaybe<PublicationState>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type QueryCapabilityArgs = {
  id: InputMaybe<Scalars['ID']['input']>;
};

export type QueryCommonContentArgs = {
  id: InputMaybe<Scalars['ID']['input']>;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};

export type QueryCommonContentsArgs = {
  filters: InputMaybe<CommonContentFiltersInput>;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationState?: InputMaybe<PublicationState>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type QueryContentReleasesReleaseArgs = {
  id: InputMaybe<Scalars['ID']['input']>;
};

export type QueryContentReleasesReleaseActionArgs = {
  id: InputMaybe<Scalars['ID']['input']>;
};

export type QueryContentReleasesReleaseActionsArgs = {
  filters: InputMaybe<ContentReleasesReleaseActionFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type QueryContentReleasesReleasesArgs = {
  filters: InputMaybe<ContentReleasesReleaseFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type QueryCouponConfigArgs = {
  id: InputMaybe<Scalars['ID']['input']>;
};

export type QueryCouponConfigsArgs = {
  filters: InputMaybe<CouponConfigFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  publicationState?: InputMaybe<PublicationState>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type QueryI18NLocaleArgs = {
  id: InputMaybe<Scalars['ID']['input']>;
};

export type QueryI18NLocalesArgs = {
  filters: InputMaybe<I18NLocaleFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type QueryIapArgs = {
  id: InputMaybe<Scalars['ID']['input']>;
};

export type QueryIapsArgs = {
  filters: InputMaybe<IapFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  publicationState?: InputMaybe<PublicationState>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type QueryOfferingArgs = {
  id: InputMaybe<Scalars['ID']['input']>;
};

export type QueryOfferingsArgs = {
  filters: InputMaybe<OfferingFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  publicationState?: InputMaybe<PublicationState>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type QueryPurchaseArgs = {
  id: InputMaybe<Scalars['ID']['input']>;
};

export type QueryPurchaseDetailArgs = {
  id: InputMaybe<Scalars['ID']['input']>;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
};

export type QueryPurchaseDetailsArgs = {
  filters: InputMaybe<PurchaseDetailFiltersInput>;
  locale: InputMaybe<Scalars['I18NLocaleCode']['input']>;
  pagination?: InputMaybe<PaginationArg>;
  publicationState?: InputMaybe<PublicationState>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type QueryPurchasesArgs = {
  filters: InputMaybe<PurchaseFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  publicationState?: InputMaybe<PublicationState>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type QueryServiceArgs = {
  id: InputMaybe<Scalars['ID']['input']>;
};

export type QueryServicesArgs = {
  filters: InputMaybe<ServiceFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  publicationState?: InputMaybe<PublicationState>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type QuerySubgroupArgs = {
  id: InputMaybe<Scalars['ID']['input']>;
};

export type QuerySubgroupsArgs = {
  filters: InputMaybe<SubgroupFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  publicationState?: InputMaybe<PublicationState>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type QueryUploadFileArgs = {
  id: InputMaybe<Scalars['ID']['input']>;
};

export type QueryUploadFilesArgs = {
  filters: InputMaybe<UploadFileFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type QueryUploadFolderArgs = {
  id: InputMaybe<Scalars['ID']['input']>;
};

export type QueryUploadFoldersArgs = {
  filters: InputMaybe<UploadFolderFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type QueryUsersPermissionsRoleArgs = {
  id: InputMaybe<Scalars['ID']['input']>;
};

export type QueryUsersPermissionsRolesArgs = {
  filters: InputMaybe<UsersPermissionsRoleFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type QueryUsersPermissionsUserArgs = {
  id: InputMaybe<Scalars['ID']['input']>;
};

export type QueryUsersPermissionsUsersArgs = {
  filters: InputMaybe<UsersPermissionsUserFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ResponseCollectionMeta = {
  __typename?: 'ResponseCollectionMeta';
  pagination: Pagination;
};

export type Service = {
  __typename?: 'Service';
  capabilities: Maybe<CapabilityRelationResponseCollection>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  description: Maybe<Scalars['String']['output']>;
  internalName: Scalars['String']['output'];
  oauthClientId: Scalars['String']['output'];
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};

export type ServiceCapabilitiesArgs = {
  filters: InputMaybe<CapabilityFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  publicationState?: InputMaybe<PublicationState>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ServiceEntity = {
  __typename?: 'ServiceEntity';
  attributes: Maybe<Service>;
  id: Maybe<Scalars['ID']['output']>;
};

export type ServiceEntityResponse = {
  __typename?: 'ServiceEntityResponse';
  data: Maybe<ServiceEntity>;
};

export type ServiceEntityResponseCollection = {
  __typename?: 'ServiceEntityResponseCollection';
  data: Array<ServiceEntity>;
  meta: ResponseCollectionMeta;
};

export type ServiceFiltersInput = {
  and: InputMaybe<Array<InputMaybe<ServiceFiltersInput>>>;
  capabilities: InputMaybe<CapabilityFiltersInput>;
  createdAt: InputMaybe<DateTimeFilterInput>;
  description: InputMaybe<StringFilterInput>;
  id: InputMaybe<IdFilterInput>;
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
  data: Array<ServiceEntity>;
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
  groupName: Maybe<Scalars['String']['output']>;
  internalName: Scalars['String']['output'];
  offerings: Maybe<OfferingRelationResponseCollection>;
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};

export type SubgroupOfferingsArgs = {
  filters: InputMaybe<OfferingFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  publicationState?: InputMaybe<PublicationState>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type SubgroupEntity = {
  __typename?: 'SubgroupEntity';
  attributes: Maybe<Subgroup>;
  id: Maybe<Scalars['ID']['output']>;
};

export type SubgroupEntityResponse = {
  __typename?: 'SubgroupEntityResponse';
  data: Maybe<SubgroupEntity>;
};

export type SubgroupEntityResponseCollection = {
  __typename?: 'SubgroupEntityResponseCollection';
  data: Array<SubgroupEntity>;
  meta: ResponseCollectionMeta;
};

export type SubgroupFiltersInput = {
  and: InputMaybe<Array<InputMaybe<SubgroupFiltersInput>>>;
  createdAt: InputMaybe<DateTimeFilterInput>;
  groupName: InputMaybe<StringFilterInput>;
  id: InputMaybe<IdFilterInput>;
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
  data: Array<SubgroupEntity>;
};

export type UploadFile = {
  __typename?: 'UploadFile';
  alternativeText: Maybe<Scalars['String']['output']>;
  caption: Maybe<Scalars['String']['output']>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  ext: Maybe<Scalars['String']['output']>;
  formats: Maybe<Scalars['JSON']['output']>;
  hash: Scalars['String']['output'];
  height: Maybe<Scalars['Int']['output']>;
  mime: Scalars['String']['output'];
  name: Scalars['String']['output'];
  previewUrl: Maybe<Scalars['String']['output']>;
  provider: Scalars['String']['output'];
  provider_metadata: Maybe<Scalars['JSON']['output']>;
  related: Maybe<Array<Maybe<GenericMorph>>>;
  size: Scalars['Float']['output'];
  updatedAt: Maybe<Scalars['DateTime']['output']>;
  url: Scalars['String']['output'];
  width: Maybe<Scalars['Int']['output']>;
};

export type UploadFileEntity = {
  __typename?: 'UploadFileEntity';
  attributes: Maybe<UploadFile>;
  id: Maybe<Scalars['ID']['output']>;
};

export type UploadFileEntityResponse = {
  __typename?: 'UploadFileEntityResponse';
  data: Maybe<UploadFileEntity>;
};

export type UploadFileEntityResponseCollection = {
  __typename?: 'UploadFileEntityResponseCollection';
  data: Array<UploadFileEntity>;
  meta: ResponseCollectionMeta;
};

export type UploadFileFiltersInput = {
  alternativeText: InputMaybe<StringFilterInput>;
  and: InputMaybe<Array<InputMaybe<UploadFileFiltersInput>>>;
  caption: InputMaybe<StringFilterInput>;
  createdAt: InputMaybe<DateTimeFilterInput>;
  ext: InputMaybe<StringFilterInput>;
  folder: InputMaybe<UploadFolderFiltersInput>;
  folderPath: InputMaybe<StringFilterInput>;
  formats: InputMaybe<JsonFilterInput>;
  hash: InputMaybe<StringFilterInput>;
  height: InputMaybe<IntFilterInput>;
  id: InputMaybe<IdFilterInput>;
  mime: InputMaybe<StringFilterInput>;
  name: InputMaybe<StringFilterInput>;
  not: InputMaybe<UploadFileFiltersInput>;
  or: InputMaybe<Array<InputMaybe<UploadFileFiltersInput>>>;
  previewUrl: InputMaybe<StringFilterInput>;
  provider: InputMaybe<StringFilterInput>;
  provider_metadata: InputMaybe<JsonFilterInput>;
  size: InputMaybe<FloatFilterInput>;
  updatedAt: InputMaybe<DateTimeFilterInput>;
  url: InputMaybe<StringFilterInput>;
  width: InputMaybe<IntFilterInput>;
};

export type UploadFileInput = {
  alternativeText: InputMaybe<Scalars['String']['input']>;
  caption: InputMaybe<Scalars['String']['input']>;
  ext: InputMaybe<Scalars['String']['input']>;
  folder: InputMaybe<Scalars['ID']['input']>;
  folderPath: InputMaybe<Scalars['String']['input']>;
  formats: InputMaybe<Scalars['JSON']['input']>;
  hash: InputMaybe<Scalars['String']['input']>;
  height: InputMaybe<Scalars['Int']['input']>;
  mime: InputMaybe<Scalars['String']['input']>;
  name: InputMaybe<Scalars['String']['input']>;
  previewUrl: InputMaybe<Scalars['String']['input']>;
  provider: InputMaybe<Scalars['String']['input']>;
  provider_metadata: InputMaybe<Scalars['JSON']['input']>;
  size: InputMaybe<Scalars['Float']['input']>;
  url: InputMaybe<Scalars['String']['input']>;
  width: InputMaybe<Scalars['Int']['input']>;
};

export type UploadFileRelationResponseCollection = {
  __typename?: 'UploadFileRelationResponseCollection';
  data: Array<UploadFileEntity>;
};

export type UploadFolder = {
  __typename?: 'UploadFolder';
  children: Maybe<UploadFolderRelationResponseCollection>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  files: Maybe<UploadFileRelationResponseCollection>;
  name: Scalars['String']['output'];
  parent: Maybe<UploadFolderEntityResponse>;
  path: Scalars['String']['output'];
  pathId: Scalars['Int']['output'];
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};

export type UploadFolderChildrenArgs = {
  filters: InputMaybe<UploadFolderFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type UploadFolderFilesArgs = {
  filters: InputMaybe<UploadFileFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type UploadFolderEntity = {
  __typename?: 'UploadFolderEntity';
  attributes: Maybe<UploadFolder>;
  id: Maybe<Scalars['ID']['output']>;
};

export type UploadFolderEntityResponse = {
  __typename?: 'UploadFolderEntityResponse';
  data: Maybe<UploadFolderEntity>;
};

export type UploadFolderEntityResponseCollection = {
  __typename?: 'UploadFolderEntityResponseCollection';
  data: Array<UploadFolderEntity>;
  meta: ResponseCollectionMeta;
};

export type UploadFolderFiltersInput = {
  and: InputMaybe<Array<InputMaybe<UploadFolderFiltersInput>>>;
  children: InputMaybe<UploadFolderFiltersInput>;
  createdAt: InputMaybe<DateTimeFilterInput>;
  files: InputMaybe<UploadFileFiltersInput>;
  id: InputMaybe<IdFilterInput>;
  name: InputMaybe<StringFilterInput>;
  not: InputMaybe<UploadFolderFiltersInput>;
  or: InputMaybe<Array<InputMaybe<UploadFolderFiltersInput>>>;
  parent: InputMaybe<UploadFolderFiltersInput>;
  path: InputMaybe<StringFilterInput>;
  pathId: InputMaybe<IntFilterInput>;
  updatedAt: InputMaybe<DateTimeFilterInput>;
};

export type UploadFolderInput = {
  children: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  files: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
  name: InputMaybe<Scalars['String']['input']>;
  parent: InputMaybe<Scalars['ID']['input']>;
  path: InputMaybe<Scalars['String']['input']>;
  pathId: InputMaybe<Scalars['Int']['input']>;
};

export type UploadFolderRelationResponseCollection = {
  __typename?: 'UploadFolderRelationResponseCollection';
  data: Array<UploadFolderEntity>;
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
  role: Maybe<UsersPermissionsRoleEntityResponse>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};

export type UsersPermissionsPermissionEntity = {
  __typename?: 'UsersPermissionsPermissionEntity';
  attributes: Maybe<UsersPermissionsPermission>;
  id: Maybe<Scalars['ID']['output']>;
};

export type UsersPermissionsPermissionFiltersInput = {
  action: InputMaybe<StringFilterInput>;
  and: InputMaybe<Array<InputMaybe<UsersPermissionsPermissionFiltersInput>>>;
  createdAt: InputMaybe<DateTimeFilterInput>;
  id: InputMaybe<IdFilterInput>;
  not: InputMaybe<UsersPermissionsPermissionFiltersInput>;
  or: InputMaybe<Array<InputMaybe<UsersPermissionsPermissionFiltersInput>>>;
  role: InputMaybe<UsersPermissionsRoleFiltersInput>;
  updatedAt: InputMaybe<DateTimeFilterInput>;
};

export type UsersPermissionsPermissionRelationResponseCollection = {
  __typename?: 'UsersPermissionsPermissionRelationResponseCollection';
  data: Array<UsersPermissionsPermissionEntity>;
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
  name: Scalars['String']['output'];
  permissions: Maybe<UsersPermissionsPermissionRelationResponseCollection>;
  type: Maybe<Scalars['String']['output']>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
  users: Maybe<UsersPermissionsUserRelationResponseCollection>;
};

export type UsersPermissionsRolePermissionsArgs = {
  filters: InputMaybe<UsersPermissionsPermissionFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type UsersPermissionsRoleUsersArgs = {
  filters: InputMaybe<UsersPermissionsUserFiltersInput>;
  pagination?: InputMaybe<PaginationArg>;
  sort?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type UsersPermissionsRoleEntity = {
  __typename?: 'UsersPermissionsRoleEntity';
  attributes: Maybe<UsersPermissionsRole>;
  id: Maybe<Scalars['ID']['output']>;
};

export type UsersPermissionsRoleEntityResponse = {
  __typename?: 'UsersPermissionsRoleEntityResponse';
  data: Maybe<UsersPermissionsRoleEntity>;
};

export type UsersPermissionsRoleEntityResponseCollection = {
  __typename?: 'UsersPermissionsRoleEntityResponseCollection';
  data: Array<UsersPermissionsRoleEntity>;
  meta: ResponseCollectionMeta;
};

export type UsersPermissionsRoleFiltersInput = {
  and: InputMaybe<Array<InputMaybe<UsersPermissionsRoleFiltersInput>>>;
  createdAt: InputMaybe<DateTimeFilterInput>;
  description: InputMaybe<StringFilterInput>;
  id: InputMaybe<IdFilterInput>;
  name: InputMaybe<StringFilterInput>;
  not: InputMaybe<UsersPermissionsRoleFiltersInput>;
  or: InputMaybe<Array<InputMaybe<UsersPermissionsRoleFiltersInput>>>;
  permissions: InputMaybe<UsersPermissionsPermissionFiltersInput>;
  type: InputMaybe<StringFilterInput>;
  updatedAt: InputMaybe<DateTimeFilterInput>;
  users: InputMaybe<UsersPermissionsUserFiltersInput>;
};

export type UsersPermissionsRoleInput = {
  description: InputMaybe<Scalars['String']['input']>;
  name: InputMaybe<Scalars['String']['input']>;
  permissions: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
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
  email: Scalars['String']['output'];
  provider: Maybe<Scalars['String']['output']>;
  role: Maybe<UsersPermissionsRoleEntityResponse>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
  username: Scalars['String']['output'];
};

export type UsersPermissionsUserEntity = {
  __typename?: 'UsersPermissionsUserEntity';
  attributes: Maybe<UsersPermissionsUser>;
  id: Maybe<Scalars['ID']['output']>;
};

export type UsersPermissionsUserEntityResponse = {
  __typename?: 'UsersPermissionsUserEntityResponse';
  data: Maybe<UsersPermissionsUserEntity>;
};

export type UsersPermissionsUserEntityResponseCollection = {
  __typename?: 'UsersPermissionsUserEntityResponseCollection';
  data: Array<UsersPermissionsUserEntity>;
  meta: ResponseCollectionMeta;
};

export type UsersPermissionsUserFiltersInput = {
  and: InputMaybe<Array<InputMaybe<UsersPermissionsUserFiltersInput>>>;
  blocked: InputMaybe<BooleanFilterInput>;
  confirmationToken: InputMaybe<StringFilterInput>;
  confirmed: InputMaybe<BooleanFilterInput>;
  createdAt: InputMaybe<DateTimeFilterInput>;
  email: InputMaybe<StringFilterInput>;
  id: InputMaybe<IdFilterInput>;
  not: InputMaybe<UsersPermissionsUserFiltersInput>;
  or: InputMaybe<Array<InputMaybe<UsersPermissionsUserFiltersInput>>>;
  password: InputMaybe<StringFilterInput>;
  provider: InputMaybe<StringFilterInput>;
  resetPasswordToken: InputMaybe<StringFilterInput>;
  role: InputMaybe<UsersPermissionsRoleFiltersInput>;
  updatedAt: InputMaybe<DateTimeFilterInput>;
  username: InputMaybe<StringFilterInput>;
};

export type UsersPermissionsUserInput = {
  blocked: InputMaybe<Scalars['Boolean']['input']>;
  confirmationToken: InputMaybe<Scalars['String']['input']>;
  confirmed: InputMaybe<Scalars['Boolean']['input']>;
  email: InputMaybe<Scalars['String']['input']>;
  password: InputMaybe<Scalars['String']['input']>;
  provider: InputMaybe<Scalars['String']['input']>;
  resetPasswordToken: InputMaybe<Scalars['String']['input']>;
  role: InputMaybe<Scalars['ID']['input']>;
  username: InputMaybe<Scalars['String']['input']>;
};

export type UsersPermissionsUserRelationResponseCollection = {
  __typename?: 'UsersPermissionsUserRelationResponseCollection';
  data: Array<UsersPermissionsUserEntity>;
};

export type CapabilityServiceByPlanIdsQueryVariables = Exact<{
  skip: Scalars['Int']['input'];
  limit: Scalars['Int']['input'];
  stripePlanIds:
    | Array<InputMaybe<Scalars['String']['input']>>
    | InputMaybe<Scalars['String']['input']>;
}>;

export type CapabilityServiceByPlanIdsQuery = {
  __typename?: 'Query';
  purchases: {
    __typename?: 'PurchaseEntityResponseCollection';
    meta: {
      __typename?: 'ResponseCollectionMeta';
      pagination: { __typename?: 'Pagination'; total: number };
    };
    data: Array<{
      __typename?: 'PurchaseEntity';
      attributes: {
        __typename?: 'Purchase';
        stripePlanChoices: Array<{
          __typename?: 'ComponentStripeStripePlanChoices';
          stripePlanChoice: string | null;
        } | null> | null;
        offering: {
          __typename?: 'OfferingEntityResponse';
          data: {
            __typename?: 'OfferingEntity';
            attributes: {
              __typename?: 'Offering';
              stripeLegacyPlans: Array<{
                __typename?: 'ComponentStripeStripeLegacyPlans';
                stripeLegacyPlan: string | null;
              } | null> | null;
              capabilities: {
                __typename?: 'CapabilityRelationResponseCollection';
                data: Array<{
                  __typename?: 'CapabilityEntity';
                  attributes: {
                    __typename?: 'Capability';
                    slug: string;
                    services: {
                      __typename?: 'ServiceRelationResponseCollection';
                      data: Array<{
                        __typename?: 'ServiceEntity';
                        attributes: {
                          __typename?: 'Service';
                          oauthClientId: string;
                        } | null;
                      }>;
                    } | null;
                  } | null;
                }>;
              } | null;
            } | null;
          } | null;
        } | null;
      } | null;
    }>;
  } | null;
};

export type EligibilityContentByOfferingQueryVariables = Exact<{
  apiIdentifier: Scalars['String']['input'];
}>;

export type EligibilityContentByOfferingQuery = {
  __typename?: 'Query';
  offerings: {
    __typename?: 'OfferingEntityResponseCollection';
    data: Array<{
      __typename?: 'OfferingEntity';
      attributes: {
        __typename?: 'Offering';
        apiIdentifier: string;
        stripeProductId: string;
        defaultPurchase: {
          __typename?: 'PurchaseEntityResponse';
          data: {
            __typename?: 'PurchaseEntity';
            attributes: {
              __typename?: 'Purchase';
              stripePlanChoices: Array<{
                __typename?: 'ComponentStripeStripePlanChoices';
                stripePlanChoice: string | null;
              } | null> | null;
            } | null;
          } | null;
        } | null;
        subGroups: {
          __typename?: 'SubgroupRelationResponseCollection';
          data: Array<{
            __typename?: 'SubgroupEntity';
            attributes: {
              __typename?: 'Subgroup';
              groupName: string | null;
              offerings: {
                __typename?: 'OfferingRelationResponseCollection';
                data: Array<{
                  __typename?: 'OfferingEntity';
                  attributes: {
                    __typename?: 'Offering';
                    apiIdentifier: string;
                    stripeProductId: string;
                    defaultPurchase: {
                      __typename?: 'PurchaseEntityResponse';
                      data: {
                        __typename?: 'PurchaseEntity';
                        attributes: {
                          __typename?: 'Purchase';
                          stripePlanChoices: Array<{
                            __typename?: 'ComponentStripeStripePlanChoices';
                            stripePlanChoice: string | null;
                          } | null> | null;
                        } | null;
                      } | null;
                    } | null;
                  } | null;
                }>;
              } | null;
            } | null;
          }>;
        } | null;
      } | null;
    }>;
  } | null;
};

export type EligibilityContentByPlanIdsQueryVariables = Exact<{
  skip: Scalars['Int']['input'];
  limit: Scalars['Int']['input'];
  stripePlanIds:
    | Array<InputMaybe<Scalars['String']['input']>>
    | InputMaybe<Scalars['String']['input']>;
}>;

export type EligibilityContentByPlanIdsQuery = {
  __typename?: 'Query';
  purchases: {
    __typename?: 'PurchaseEntityResponseCollection';
    meta: {
      __typename?: 'ResponseCollectionMeta';
      pagination: { __typename?: 'Pagination'; total: number };
    };
    data: Array<{
      __typename?: 'PurchaseEntity';
      attributes: {
        __typename?: 'Purchase';
        stripePlanChoices: Array<{
          __typename?: 'ComponentStripeStripePlanChoices';
          stripePlanChoice: string | null;
        } | null> | null;
        offering: {
          __typename?: 'OfferingEntityResponse';
          data: {
            __typename?: 'OfferingEntity';
            attributes: {
              __typename?: 'Offering';
              stripeProductId: string;
              countries: any | null;
              stripeLegacyPlans: Array<{
                __typename?: 'ComponentStripeStripeLegacyPlans';
                stripeLegacyPlan: string | null;
              } | null> | null;
              subGroups: {
                __typename?: 'SubgroupRelationResponseCollection';
                data: Array<{
                  __typename?: 'SubgroupEntity';
                  attributes: {
                    __typename?: 'Subgroup';
                    groupName: string | null;
                    offerings: {
                      __typename?: 'OfferingRelationResponseCollection';
                      data: Array<{
                        __typename?: 'OfferingEntity';
                        attributes: {
                          __typename?: 'Offering';
                          stripeProductId: string;
                          countries: any | null;
                          stripeLegacyPlans: Array<{
                            __typename?: 'ComponentStripeStripeLegacyPlans';
                            stripeLegacyPlan: string | null;
                          } | null> | null;
                        } | null;
                      }>;
                    } | null;
                  } | null;
                }>;
              } | null;
            } | null;
          } | null;
        } | null;
      } | null;
    }>;
  } | null;
};

export type LocalesQueryVariables = Exact<{ [key: string]: never }>;

export type LocalesQuery = {
  __typename?: 'Query';
  i18NLocales: {
    __typename?: 'I18NLocaleEntityResponseCollection';
    data: Array<{
      __typename?: 'I18NLocaleEntity';
      attributes: { __typename?: 'I18NLocale'; code: string | null } | null;
    }>;
  } | null;
};

export type OfferingQueryVariables = Exact<{
  id: Scalars['ID']['input'];
  locale: Scalars['String']['input'];
}>;

export type OfferingQuery = {
  __typename?: 'Query';
  offering: {
    __typename?: 'OfferingEntityResponse';
    data: {
      __typename?: 'OfferingEntity';
      attributes: {
        __typename?: 'Offering';
        stripeProductId: string;
        countries: any | null;
        defaultPurchase: {
          __typename?: 'PurchaseEntityResponse';
          data: {
            __typename?: 'PurchaseEntity';
            attributes: {
              __typename?: 'Purchase';
              purchaseDetails: {
                __typename?: 'PurchaseDetailEntityResponse';
                data: {
                  __typename?: 'PurchaseDetailEntity';
                  attributes: {
                    __typename?: 'PurchaseDetail';
                    productName: string;
                    details: string;
                    subtitle: string | null;
                    webIcon: string;
                    localizations: {
                      __typename?: 'PurchaseDetailRelationResponseCollection';
                      data: Array<{
                        __typename?: 'PurchaseDetailEntity';
                        attributes: {
                          __typename?: 'PurchaseDetail';
                          productName: string;
                          details: string;
                          subtitle: string | null;
                          webIcon: string;
                        } | null;
                      }>;
                    } | null;
                  } | null;
                } | null;
              } | null;
            } | null;
          } | null;
        } | null;
      } | null;
    } | null;
  } | null;
};

export type PageContentForOfferingQueryVariables = Exact<{
  locale: Scalars['String']['input'];
  apiIdentifier: Scalars['String']['input'];
}>;

export type PageContentForOfferingQuery = {
  __typename?: 'Query';
  offerings: {
    __typename?: 'OfferingEntityResponseCollection';
    meta: {
      __typename?: 'ResponseCollectionMeta';
      pagination: { __typename?: 'Pagination'; total: number };
    };
    data: Array<{
      __typename?: 'OfferingEntity';
      attributes: {
        __typename?: 'Offering';
        apiIdentifier: string;
        stripeProductId: string;
        defaultPurchase: {
          __typename?: 'PurchaseEntityResponse';
          data: {
            __typename?: 'PurchaseEntity';
            attributes: {
              __typename?: 'Purchase';
              purchaseDetails: {
                __typename?: 'PurchaseDetailEntityResponse';
                data: {
                  __typename?: 'PurchaseDetailEntity';
                  attributes: {
                    __typename?: 'PurchaseDetail';
                    details: string;
                    productName: string;
                    subtitle: string | null;
                    webIcon: string;
                    localizations: {
                      __typename?: 'PurchaseDetailRelationResponseCollection';
                      data: Array<{
                        __typename?: 'PurchaseDetailEntity';
                        attributes: {
                          __typename?: 'PurchaseDetail';
                          details: string;
                          productName: string;
                          subtitle: string | null;
                          webIcon: string;
                        } | null;
                      }>;
                    } | null;
                  } | null;
                } | null;
              } | null;
            } | null;
          } | null;
        } | null;
        commonContent: {
          __typename?: 'CommonContentEntityResponse';
          data: {
            __typename?: 'CommonContentEntity';
            attributes: {
              __typename?: 'CommonContent';
              privacyNoticeUrl: string;
              privacyNoticeDownloadUrl: string;
              termsOfServiceUrl: string;
              termsOfServiceDownloadUrl: string;
              cancellationUrl: string | null;
              emailIcon: string | null;
              successActionButtonUrl: string;
              successActionButtonLabel: string | null;
              newsletterLabelTextCode: string | null;
              newsletterSlug: any | null;
              localizations: {
                __typename?: 'CommonContentRelationResponseCollection';
                data: Array<{
                  __typename?: 'CommonContentEntity';
                  attributes: {
                    __typename?: 'CommonContent';
                    privacyNoticeUrl: string;
                    privacyNoticeDownloadUrl: string;
                    termsOfServiceUrl: string;
                    termsOfServiceDownloadUrl: string;
                    cancellationUrl: string | null;
                    emailIcon: string | null;
                    successActionButtonUrl: string;
                    successActionButtonLabel: string | null;
                    newsletterLabelTextCode: string | null;
                    newsletterSlug: any | null;
                  } | null;
                }>;
              } | null;
            } | null;
          } | null;
        } | null;
      } | null;
    }>;
  } | null;
};

export type PurchaseWithDetailsOfferingContentQueryVariables = Exact<{
  skip: Scalars['Int']['input'];
  limit: Scalars['Int']['input'];
  locale: Scalars['String']['input'];
  stripePlanIds:
    | Array<InputMaybe<Scalars['String']['input']>>
    | InputMaybe<Scalars['String']['input']>;
}>;

export type PurchaseWithDetailsOfferingContentQuery = {
  __typename?: 'Query';
  purchases: {
    __typename?: 'PurchaseEntityResponseCollection';
    data: Array<{
      __typename?: 'PurchaseEntity';
      attributes: {
        __typename?: 'Purchase';
        stripePlanChoices: Array<{
          __typename?: 'ComponentStripeStripePlanChoices';
          stripePlanChoice: string | null;
        } | null> | null;
        purchaseDetails: {
          __typename?: 'PurchaseDetailEntityResponse';
          data: {
            __typename?: 'PurchaseDetailEntity';
            attributes: {
              __typename?: 'PurchaseDetail';
              details: string;
              productName: string;
              subtitle: string | null;
              webIcon: string;
              localizations: {
                __typename?: 'PurchaseDetailRelationResponseCollection';
                data: Array<{
                  __typename?: 'PurchaseDetailEntity';
                  attributes: {
                    __typename?: 'PurchaseDetail';
                    details: string;
                    productName: string;
                    subtitle: string | null;
                    webIcon: string;
                  } | null;
                }>;
              } | null;
            } | null;
          } | null;
        } | null;
        offering: {
          __typename?: 'OfferingEntityResponse';
          data: {
            __typename?: 'OfferingEntity';
            attributes: {
              __typename?: 'Offering';
              stripeProductId: string;
              stripeLegacyPlans: Array<{
                __typename?: 'ComponentStripeStripeLegacyPlans';
                stripeLegacyPlan: string | null;
              } | null> | null;
              commonContent: {
                __typename?: 'CommonContentEntityResponse';
                data: {
                  __typename?: 'CommonContentEntity';
                  attributes: {
                    __typename?: 'CommonContent';
                    privacyNoticeUrl: string;
                    privacyNoticeDownloadUrl: string;
                    termsOfServiceUrl: string;
                    termsOfServiceDownloadUrl: string;
                    cancellationUrl: string | null;
                    emailIcon: string | null;
                    successActionButtonUrl: string;
                    successActionButtonLabel: string | null;
                    newsletterLabelTextCode: string | null;
                    newsletterSlug: any | null;
                    localizations: {
                      __typename?: 'CommonContentRelationResponseCollection';
                      data: Array<{
                        __typename?: 'CommonContentEntity';
                        attributes: {
                          __typename?: 'CommonContent';
                          privacyNoticeUrl: string;
                          privacyNoticeDownloadUrl: string;
                          termsOfServiceUrl: string;
                          termsOfServiceDownloadUrl: string;
                          cancellationUrl: string | null;
                          emailIcon: string | null;
                          successActionButtonUrl: string;
                          successActionButtonLabel: string | null;
                          newsletterLabelTextCode: string | null;
                          newsletterSlug: any | null;
                        } | null;
                      }>;
                    } | null;
                  } | null;
                } | null;
              } | null;
            } | null;
          } | null;
        } | null;
      } | null;
    }>;
  } | null;
};

export type ServicesWithCapabilitiesQueryVariables = Exact<{
  skip: Scalars['Int']['input'];
  limit: Scalars['Int']['input'];
}>;

export type ServicesWithCapabilitiesQuery = {
  __typename?: 'Query';
  services: {
    __typename?: 'ServiceEntityResponseCollection';
    data: Array<{
      __typename?: 'ServiceEntity';
      attributes: {
        __typename?: 'Service';
        oauthClientId: string;
        capabilities: {
          __typename?: 'CapabilityRelationResponseCollection';
          data: Array<{
            __typename?: 'CapabilityEntity';
            attributes: { __typename?: 'Capability'; slug: string } | null;
          }>;
        } | null;
      } | null;
    }>;
  } | null;
};

export const CapabilityServiceByPlanIdsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'CapabilityServiceByPlanIds' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'limit' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'stripePlanIds' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'ListType',
              type: {
                kind: 'NamedType',
                name: { kind: 'Name', value: 'String' },
              },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'purchases' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'filters' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'or' },
                      value: {
                        kind: 'ListValue',
                        values: [
                          {
                            kind: 'ObjectValue',
                            fields: [
                              {
                                kind: 'ObjectField',
                                name: {
                                  kind: 'Name',
                                  value: 'stripePlanChoices',
                                },
                                value: {
                                  kind: 'ObjectValue',
                                  fields: [
                                    {
                                      kind: 'ObjectField',
                                      name: {
                                        kind: 'Name',
                                        value: 'stripePlanChoice',
                                      },
                                      value: {
                                        kind: 'ObjectValue',
                                        fields: [
                                          {
                                            kind: 'ObjectField',
                                            name: { kind: 'Name', value: 'in' },
                                            value: {
                                              kind: 'Variable',
                                              name: {
                                                kind: 'Name',
                                                value: 'stripePlanIds',
                                              },
                                            },
                                          },
                                        ],
                                      },
                                    },
                                  ],
                                },
                              },
                            ],
                          },
                          {
                            kind: 'ObjectValue',
                            fields: [
                              {
                                kind: 'ObjectField',
                                name: { kind: 'Name', value: 'offering' },
                                value: {
                                  kind: 'ObjectValue',
                                  fields: [
                                    {
                                      kind: 'ObjectField',
                                      name: {
                                        kind: 'Name',
                                        value: 'stripeLegacyPlans',
                                      },
                                      value: {
                                        kind: 'ObjectValue',
                                        fields: [
                                          {
                                            kind: 'ObjectField',
                                            name: {
                                              kind: 'Name',
                                              value: 'stripeLegacyPlan',
                                            },
                                            value: {
                                              kind: 'ObjectValue',
                                              fields: [
                                                {
                                                  kind: 'ObjectField',
                                                  name: {
                                                    kind: 'Name',
                                                    value: 'in',
                                                  },
                                                  value: {
                                                    kind: 'Variable',
                                                    name: {
                                                      kind: 'Name',
                                                      value: 'stripePlanIds',
                                                    },
                                                  },
                                                },
                                              ],
                                            },
                                          },
                                        ],
                                      },
                                    },
                                  ],
                                },
                              },
                            ],
                          },
                        ],
                      },
                    },
                  ],
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'pagination' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'start' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'skip' },
                      },
                    },
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'limit' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'limit' },
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'meta' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'pagination' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'total' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'data' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'attributes' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: {
                                kind: 'Name',
                                value: 'stripePlanChoices',
                              },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: {
                                      kind: 'Name',
                                      value: 'stripePlanChoice',
                                    },
                                  },
                                ],
                              },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'offering' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'data' },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: {
                                            kind: 'Name',
                                            value: 'attributes',
                                          },
                                          selectionSet: {
                                            kind: 'SelectionSet',
                                            selections: [
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'stripeLegacyPlans',
                                                },
                                                arguments: [
                                                  {
                                                    kind: 'Argument',
                                                    name: {
                                                      kind: 'Name',
                                                      value: 'pagination',
                                                    },
                                                    value: {
                                                      kind: 'ObjectValue',
                                                      fields: [
                                                        {
                                                          kind: 'ObjectField',
                                                          name: {
                                                            kind: 'Name',
                                                            value: 'limit',
                                                          },
                                                          value: {
                                                            kind: 'IntValue',
                                                            value: '200',
                                                          },
                                                        },
                                                      ],
                                                    },
                                                  },
                                                ],
                                                selectionSet: {
                                                  kind: 'SelectionSet',
                                                  selections: [
                                                    {
                                                      kind: 'Field',
                                                      name: {
                                                        kind: 'Name',
                                                        value:
                                                          'stripeLegacyPlan',
                                                      },
                                                    },
                                                  ],
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'capabilities',
                                                },
                                                selectionSet: {
                                                  kind: 'SelectionSet',
                                                  selections: [
                                                    {
                                                      kind: 'Field',
                                                      name: {
                                                        kind: 'Name',
                                                        value: 'data',
                                                      },
                                                      selectionSet: {
                                                        kind: 'SelectionSet',
                                                        selections: [
                                                          {
                                                            kind: 'Field',
                                                            name: {
                                                              kind: 'Name',
                                                              value:
                                                                'attributes',
                                                            },
                                                            selectionSet: {
                                                              kind: 'SelectionSet',
                                                              selections: [
                                                                {
                                                                  kind: 'Field',
                                                                  name: {
                                                                    kind: 'Name',
                                                                    value:
                                                                      'slug',
                                                                  },
                                                                },
                                                                {
                                                                  kind: 'Field',
                                                                  name: {
                                                                    kind: 'Name',
                                                                    value:
                                                                      'services',
                                                                  },
                                                                  selectionSet:
                                                                    {
                                                                      kind: 'SelectionSet',
                                                                      selections:
                                                                        [
                                                                          {
                                                                            kind: 'Field',
                                                                            name: {
                                                                              kind: 'Name',
                                                                              value:
                                                                                'data',
                                                                            },
                                                                            selectionSet:
                                                                              {
                                                                                kind: 'SelectionSet',
                                                                                selections:
                                                                                  [
                                                                                    {
                                                                                      kind: 'Field',
                                                                                      name: {
                                                                                        kind: 'Name',
                                                                                        value:
                                                                                          'attributes',
                                                                                      },
                                                                                      selectionSet:
                                                                                        {
                                                                                          kind: 'SelectionSet',
                                                                                          selections:
                                                                                            [
                                                                                              {
                                                                                                kind: 'Field',
                                                                                                name: {
                                                                                                  kind: 'Name',
                                                                                                  value:
                                                                                                    'oauthClientId',
                                                                                                },
                                                                                              },
                                                                                            ],
                                                                                        },
                                                                                    },
                                                                                  ],
                                                                              },
                                                                          },
                                                                        ],
                                                                    },
                                                                },
                                                              ],
                                                            },
                                                          },
                                                        ],
                                                      },
                                                    },
                                                  ],
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CapabilityServiceByPlanIdsQuery,
  CapabilityServiceByPlanIdsQueryVariables
>;
export const EligibilityContentByOfferingDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'EligibilityContentByOffering' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'apiIdentifier' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'offerings' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'pagination' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'start' },
                      value: { kind: 'IntValue', value: '0' },
                    },
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'limit' },
                      value: { kind: 'IntValue', value: '2' },
                    },
                  ],
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'filters' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'apiIdentifier' },
                      value: {
                        kind: 'ObjectValue',
                        fields: [
                          {
                            kind: 'ObjectField',
                            name: { kind: 'Name', value: 'eq' },
                            value: {
                              kind: 'Variable',
                              name: { kind: 'Name', value: 'apiIdentifier' },
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'data' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'attributes' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'apiIdentifier' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'stripeProductId' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'defaultPurchase' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'data' },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: {
                                            kind: 'Name',
                                            value: 'attributes',
                                          },
                                          selectionSet: {
                                            kind: 'SelectionSet',
                                            selections: [
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'stripePlanChoices',
                                                },
                                                selectionSet: {
                                                  kind: 'SelectionSet',
                                                  selections: [
                                                    {
                                                      kind: 'Field',
                                                      name: {
                                                        kind: 'Name',
                                                        value:
                                                          'stripePlanChoice',
                                                      },
                                                    },
                                                  ],
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'subGroups' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'data' },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: {
                                            kind: 'Name',
                                            value: 'attributes',
                                          },
                                          selectionSet: {
                                            kind: 'SelectionSet',
                                            selections: [
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'groupName',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'offerings',
                                                },
                                                selectionSet: {
                                                  kind: 'SelectionSet',
                                                  selections: [
                                                    {
                                                      kind: 'Field',
                                                      name: {
                                                        kind: 'Name',
                                                        value: 'data',
                                                      },
                                                      selectionSet: {
                                                        kind: 'SelectionSet',
                                                        selections: [
                                                          {
                                                            kind: 'Field',
                                                            name: {
                                                              kind: 'Name',
                                                              value:
                                                                'attributes',
                                                            },
                                                            selectionSet: {
                                                              kind: 'SelectionSet',
                                                              selections: [
                                                                {
                                                                  kind: 'Field',
                                                                  name: {
                                                                    kind: 'Name',
                                                                    value:
                                                                      'apiIdentifier',
                                                                  },
                                                                },
                                                                {
                                                                  kind: 'Field',
                                                                  name: {
                                                                    kind: 'Name',
                                                                    value:
                                                                      'stripeProductId',
                                                                  },
                                                                },
                                                                {
                                                                  kind: 'Field',
                                                                  name: {
                                                                    kind: 'Name',
                                                                    value:
                                                                      'defaultPurchase',
                                                                  },
                                                                  selectionSet:
                                                                    {
                                                                      kind: 'SelectionSet',
                                                                      selections:
                                                                        [
                                                                          {
                                                                            kind: 'Field',
                                                                            name: {
                                                                              kind: 'Name',
                                                                              value:
                                                                                'data',
                                                                            },
                                                                            selectionSet:
                                                                              {
                                                                                kind: 'SelectionSet',
                                                                                selections:
                                                                                  [
                                                                                    {
                                                                                      kind: 'Field',
                                                                                      name: {
                                                                                        kind: 'Name',
                                                                                        value:
                                                                                          'attributes',
                                                                                      },
                                                                                      selectionSet:
                                                                                        {
                                                                                          kind: 'SelectionSet',
                                                                                          selections:
                                                                                            [
                                                                                              {
                                                                                                kind: 'Field',
                                                                                                name: {
                                                                                                  kind: 'Name',
                                                                                                  value:
                                                                                                    'stripePlanChoices',
                                                                                                },
                                                                                                selectionSet:
                                                                                                  {
                                                                                                    kind: 'SelectionSet',
                                                                                                    selections:
                                                                                                      [
                                                                                                        {
                                                                                                          kind: 'Field',
                                                                                                          name: {
                                                                                                            kind: 'Name',
                                                                                                            value:
                                                                                                              'stripePlanChoice',
                                                                                                          },
                                                                                                        },
                                                                                                      ],
                                                                                                  },
                                                                                              },
                                                                                            ],
                                                                                        },
                                                                                    },
                                                                                  ],
                                                                              },
                                                                          },
                                                                        ],
                                                                    },
                                                                },
                                                              ],
                                                            },
                                                          },
                                                        ],
                                                      },
                                                    },
                                                  ],
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  EligibilityContentByOfferingQuery,
  EligibilityContentByOfferingQueryVariables
>;
export const EligibilityContentByPlanIdsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'EligibilityContentByPlanIds' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'limit' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'stripePlanIds' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'ListType',
              type: {
                kind: 'NamedType',
                name: { kind: 'Name', value: 'String' },
              },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'purchases' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'pagination' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'start' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'skip' },
                      },
                    },
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'limit' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'limit' },
                      },
                    },
                  ],
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'filters' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'or' },
                      value: {
                        kind: 'ListValue',
                        values: [
                          {
                            kind: 'ObjectValue',
                            fields: [
                              {
                                kind: 'ObjectField',
                                name: {
                                  kind: 'Name',
                                  value: 'stripePlanChoices',
                                },
                                value: {
                                  kind: 'ObjectValue',
                                  fields: [
                                    {
                                      kind: 'ObjectField',
                                      name: {
                                        kind: 'Name',
                                        value: 'stripePlanChoice',
                                      },
                                      value: {
                                        kind: 'ObjectValue',
                                        fields: [
                                          {
                                            kind: 'ObjectField',
                                            name: { kind: 'Name', value: 'in' },
                                            value: {
                                              kind: 'Variable',
                                              name: {
                                                kind: 'Name',
                                                value: 'stripePlanIds',
                                              },
                                            },
                                          },
                                        ],
                                      },
                                    },
                                  ],
                                },
                              },
                            ],
                          },
                          {
                            kind: 'ObjectValue',
                            fields: [
                              {
                                kind: 'ObjectField',
                                name: { kind: 'Name', value: 'offering' },
                                value: {
                                  kind: 'ObjectValue',
                                  fields: [
                                    {
                                      kind: 'ObjectField',
                                      name: {
                                        kind: 'Name',
                                        value: 'stripeLegacyPlans',
                                      },
                                      value: {
                                        kind: 'ObjectValue',
                                        fields: [
                                          {
                                            kind: 'ObjectField',
                                            name: {
                                              kind: 'Name',
                                              value: 'stripeLegacyPlan',
                                            },
                                            value: {
                                              kind: 'ObjectValue',
                                              fields: [
                                                {
                                                  kind: 'ObjectField',
                                                  name: {
                                                    kind: 'Name',
                                                    value: 'in',
                                                  },
                                                  value: {
                                                    kind: 'Variable',
                                                    name: {
                                                      kind: 'Name',
                                                      value: 'stripePlanIds',
                                                    },
                                                  },
                                                },
                                              ],
                                            },
                                          },
                                        ],
                                      },
                                    },
                                  ],
                                },
                              },
                            ],
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'meta' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'pagination' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'total' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'data' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'attributes' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: {
                                kind: 'Name',
                                value: 'stripePlanChoices',
                              },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: {
                                      kind: 'Name',
                                      value: 'stripePlanChoice',
                                    },
                                  },
                                ],
                              },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'offering' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'data' },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: {
                                            kind: 'Name',
                                            value: 'attributes',
                                          },
                                          selectionSet: {
                                            kind: 'SelectionSet',
                                            selections: [
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'stripeProductId',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'stripeLegacyPlans',
                                                },
                                                arguments: [
                                                  {
                                                    kind: 'Argument',
                                                    name: {
                                                      kind: 'Name',
                                                      value: 'pagination',
                                                    },
                                                    value: {
                                                      kind: 'ObjectValue',
                                                      fields: [
                                                        {
                                                          kind: 'ObjectField',
                                                          name: {
                                                            kind: 'Name',
                                                            value: 'limit',
                                                          },
                                                          value: {
                                                            kind: 'IntValue',
                                                            value: '200',
                                                          },
                                                        },
                                                      ],
                                                    },
                                                  },
                                                ],
                                                selectionSet: {
                                                  kind: 'SelectionSet',
                                                  selections: [
                                                    {
                                                      kind: 'Field',
                                                      name: {
                                                        kind: 'Name',
                                                        value:
                                                          'stripeLegacyPlan',
                                                      },
                                                    },
                                                  ],
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'countries',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'subGroups',
                                                },
                                                selectionSet: {
                                                  kind: 'SelectionSet',
                                                  selections: [
                                                    {
                                                      kind: 'Field',
                                                      name: {
                                                        kind: 'Name',
                                                        value: 'data',
                                                      },
                                                      selectionSet: {
                                                        kind: 'SelectionSet',
                                                        selections: [
                                                          {
                                                            kind: 'Field',
                                                            name: {
                                                              kind: 'Name',
                                                              value:
                                                                'attributes',
                                                            },
                                                            selectionSet: {
                                                              kind: 'SelectionSet',
                                                              selections: [
                                                                {
                                                                  kind: 'Field',
                                                                  name: {
                                                                    kind: 'Name',
                                                                    value:
                                                                      'groupName',
                                                                  },
                                                                },
                                                                {
                                                                  kind: 'Field',
                                                                  name: {
                                                                    kind: 'Name',
                                                                    value:
                                                                      'offerings',
                                                                  },
                                                                  selectionSet:
                                                                    {
                                                                      kind: 'SelectionSet',
                                                                      selections:
                                                                        [
                                                                          {
                                                                            kind: 'Field',
                                                                            name: {
                                                                              kind: 'Name',
                                                                              value:
                                                                                'data',
                                                                            },
                                                                            selectionSet:
                                                                              {
                                                                                kind: 'SelectionSet',
                                                                                selections:
                                                                                  [
                                                                                    {
                                                                                      kind: 'Field',
                                                                                      name: {
                                                                                        kind: 'Name',
                                                                                        value:
                                                                                          'attributes',
                                                                                      },
                                                                                      selectionSet:
                                                                                        {
                                                                                          kind: 'SelectionSet',
                                                                                          selections:
                                                                                            [
                                                                                              {
                                                                                                kind: 'Field',
                                                                                                name: {
                                                                                                  kind: 'Name',
                                                                                                  value:
                                                                                                    'stripeProductId',
                                                                                                },
                                                                                              },
                                                                                              {
                                                                                                kind: 'Field',
                                                                                                name: {
                                                                                                  kind: 'Name',
                                                                                                  value:
                                                                                                    'stripeLegacyPlans',
                                                                                                },
                                                                                                arguments:
                                                                                                  [
                                                                                                    {
                                                                                                      kind: 'Argument',
                                                                                                      name: {
                                                                                                        kind: 'Name',
                                                                                                        value:
                                                                                                          'pagination',
                                                                                                      },
                                                                                                      value:
                                                                                                        {
                                                                                                          kind: 'ObjectValue',
                                                                                                          fields:
                                                                                                            [
                                                                                                              {
                                                                                                                kind: 'ObjectField',
                                                                                                                name: {
                                                                                                                  kind: 'Name',
                                                                                                                  value:
                                                                                                                    'limit',
                                                                                                                },
                                                                                                                value:
                                                                                                                  {
                                                                                                                    kind: 'IntValue',
                                                                                                                    value:
                                                                                                                      '200',
                                                                                                                  },
                                                                                                              },
                                                                                                            ],
                                                                                                        },
                                                                                                    },
                                                                                                  ],
                                                                                                selectionSet:
                                                                                                  {
                                                                                                    kind: 'SelectionSet',
                                                                                                    selections:
                                                                                                      [
                                                                                                        {
                                                                                                          kind: 'Field',
                                                                                                          name: {
                                                                                                            kind: 'Name',
                                                                                                            value:
                                                                                                              'stripeLegacyPlan',
                                                                                                          },
                                                                                                        },
                                                                                                      ],
                                                                                                  },
                                                                                              },
                                                                                              {
                                                                                                kind: 'Field',
                                                                                                name: {
                                                                                                  kind: 'Name',
                                                                                                  value:
                                                                                                    'countries',
                                                                                                },
                                                                                              },
                                                                                            ],
                                                                                        },
                                                                                    },
                                                                                  ],
                                                                              },
                                                                          },
                                                                        ],
                                                                    },
                                                                },
                                                              ],
                                                            },
                                                          },
                                                        ],
                                                      },
                                                    },
                                                  ],
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  EligibilityContentByPlanIdsQuery,
  EligibilityContentByPlanIdsQueryVariables
>;
export const LocalesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'Locales' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'i18NLocales' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'data' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'attributes' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'code' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<LocalesQuery, LocalesQueryVariables>;
export const OfferingDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'Offering' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'locale' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'offering' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'data' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'attributes' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'stripeProductId' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'countries' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'defaultPurchase' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'data' },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: {
                                            kind: 'Name',
                                            value: 'attributes',
                                          },
                                          selectionSet: {
                                            kind: 'SelectionSet',
                                            selections: [
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'purchaseDetails',
                                                },
                                                selectionSet: {
                                                  kind: 'SelectionSet',
                                                  selections: [
                                                    {
                                                      kind: 'Field',
                                                      name: {
                                                        kind: 'Name',
                                                        value: 'data',
                                                      },
                                                      selectionSet: {
                                                        kind: 'SelectionSet',
                                                        selections: [
                                                          {
                                                            kind: 'Field',
                                                            name: {
                                                              kind: 'Name',
                                                              value:
                                                                'attributes',
                                                            },
                                                            selectionSet: {
                                                              kind: 'SelectionSet',
                                                              selections: [
                                                                {
                                                                  kind: 'Field',
                                                                  name: {
                                                                    kind: 'Name',
                                                                    value:
                                                                      'productName',
                                                                  },
                                                                },
                                                                {
                                                                  kind: 'Field',
                                                                  name: {
                                                                    kind: 'Name',
                                                                    value:
                                                                      'details',
                                                                  },
                                                                },
                                                                {
                                                                  kind: 'Field',
                                                                  name: {
                                                                    kind: 'Name',
                                                                    value:
                                                                      'subtitle',
                                                                  },
                                                                },
                                                                {
                                                                  kind: 'Field',
                                                                  name: {
                                                                    kind: 'Name',
                                                                    value:
                                                                      'webIcon',
                                                                  },
                                                                },
                                                                {
                                                                  kind: 'Field',
                                                                  name: {
                                                                    kind: 'Name',
                                                                    value:
                                                                      'localizations',
                                                                  },
                                                                  arguments: [
                                                                    {
                                                                      kind: 'Argument',
                                                                      name: {
                                                                        kind: 'Name',
                                                                        value:
                                                                          'filters',
                                                                      },
                                                                      value: {
                                                                        kind: 'ObjectValue',
                                                                        fields:
                                                                          [
                                                                            {
                                                                              kind: 'ObjectField',
                                                                              name: {
                                                                                kind: 'Name',
                                                                                value:
                                                                                  'locale',
                                                                              },
                                                                              value:
                                                                                {
                                                                                  kind: 'ObjectValue',
                                                                                  fields:
                                                                                    [
                                                                                      {
                                                                                        kind: 'ObjectField',
                                                                                        name: {
                                                                                          kind: 'Name',
                                                                                          value:
                                                                                            'eq',
                                                                                        },
                                                                                        value:
                                                                                          {
                                                                                            kind: 'Variable',
                                                                                            name: {
                                                                                              kind: 'Name',
                                                                                              value:
                                                                                                'locale',
                                                                                            },
                                                                                          },
                                                                                      },
                                                                                    ],
                                                                                },
                                                                            },
                                                                          ],
                                                                      },
                                                                    },
                                                                  ],
                                                                  selectionSet:
                                                                    {
                                                                      kind: 'SelectionSet',
                                                                      selections:
                                                                        [
                                                                          {
                                                                            kind: 'Field',
                                                                            name: {
                                                                              kind: 'Name',
                                                                              value:
                                                                                'data',
                                                                            },
                                                                            selectionSet:
                                                                              {
                                                                                kind: 'SelectionSet',
                                                                                selections:
                                                                                  [
                                                                                    {
                                                                                      kind: 'Field',
                                                                                      name: {
                                                                                        kind: 'Name',
                                                                                        value:
                                                                                          'attributes',
                                                                                      },
                                                                                      selectionSet:
                                                                                        {
                                                                                          kind: 'SelectionSet',
                                                                                          selections:
                                                                                            [
                                                                                              {
                                                                                                kind: 'Field',
                                                                                                name: {
                                                                                                  kind: 'Name',
                                                                                                  value:
                                                                                                    'productName',
                                                                                                },
                                                                                              },
                                                                                              {
                                                                                                kind: 'Field',
                                                                                                name: {
                                                                                                  kind: 'Name',
                                                                                                  value:
                                                                                                    'details',
                                                                                                },
                                                                                              },
                                                                                              {
                                                                                                kind: 'Field',
                                                                                                name: {
                                                                                                  kind: 'Name',
                                                                                                  value:
                                                                                                    'subtitle',
                                                                                                },
                                                                                              },
                                                                                              {
                                                                                                kind: 'Field',
                                                                                                name: {
                                                                                                  kind: 'Name',
                                                                                                  value:
                                                                                                    'webIcon',
                                                                                                },
                                                                                              },
                                                                                            ],
                                                                                        },
                                                                                    },
                                                                                  ],
                                                                              },
                                                                          },
                                                                        ],
                                                                    },
                                                                },
                                                              ],
                                                            },
                                                          },
                                                        ],
                                                      },
                                                    },
                                                  ],
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<OfferingQuery, OfferingQueryVariables>;
export const PageContentForOfferingDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'PageContentForOffering' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'locale' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'apiIdentifier' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'offerings' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'pagination' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'start' },
                      value: { kind: 'IntValue', value: '0' },
                    },
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'limit' },
                      value: { kind: 'IntValue', value: '2' },
                    },
                  ],
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'filters' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'apiIdentifier' },
                      value: {
                        kind: 'ObjectValue',
                        fields: [
                          {
                            kind: 'ObjectField',
                            name: { kind: 'Name', value: 'eq' },
                            value: {
                              kind: 'Variable',
                              name: { kind: 'Name', value: 'apiIdentifier' },
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'meta' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'pagination' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'total' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'data' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'attributes' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'apiIdentifier' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'stripeProductId' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'defaultPurchase' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'data' },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: {
                                            kind: 'Name',
                                            value: 'attributes',
                                          },
                                          selectionSet: {
                                            kind: 'SelectionSet',
                                            selections: [
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'purchaseDetails',
                                                },
                                                selectionSet: {
                                                  kind: 'SelectionSet',
                                                  selections: [
                                                    {
                                                      kind: 'Field',
                                                      name: {
                                                        kind: 'Name',
                                                        value: 'data',
                                                      },
                                                      selectionSet: {
                                                        kind: 'SelectionSet',
                                                        selections: [
                                                          {
                                                            kind: 'Field',
                                                            name: {
                                                              kind: 'Name',
                                                              value:
                                                                'attributes',
                                                            },
                                                            selectionSet: {
                                                              kind: 'SelectionSet',
                                                              selections: [
                                                                {
                                                                  kind: 'Field',
                                                                  name: {
                                                                    kind: 'Name',
                                                                    value:
                                                                      'details',
                                                                  },
                                                                },
                                                                {
                                                                  kind: 'Field',
                                                                  name: {
                                                                    kind: 'Name',
                                                                    value:
                                                                      'productName',
                                                                  },
                                                                },
                                                                {
                                                                  kind: 'Field',
                                                                  name: {
                                                                    kind: 'Name',
                                                                    value:
                                                                      'subtitle',
                                                                  },
                                                                },
                                                                {
                                                                  kind: 'Field',
                                                                  name: {
                                                                    kind: 'Name',
                                                                    value:
                                                                      'webIcon',
                                                                  },
                                                                },
                                                                {
                                                                  kind: 'Field',
                                                                  name: {
                                                                    kind: 'Name',
                                                                    value:
                                                                      'localizations',
                                                                  },
                                                                  arguments: [
                                                                    {
                                                                      kind: 'Argument',
                                                                      name: {
                                                                        kind: 'Name',
                                                                        value:
                                                                          'filters',
                                                                      },
                                                                      value: {
                                                                        kind: 'ObjectValue',
                                                                        fields:
                                                                          [
                                                                            {
                                                                              kind: 'ObjectField',
                                                                              name: {
                                                                                kind: 'Name',
                                                                                value:
                                                                                  'locale',
                                                                              },
                                                                              value:
                                                                                {
                                                                                  kind: 'ObjectValue',
                                                                                  fields:
                                                                                    [
                                                                                      {
                                                                                        kind: 'ObjectField',
                                                                                        name: {
                                                                                          kind: 'Name',
                                                                                          value:
                                                                                            'eq',
                                                                                        },
                                                                                        value:
                                                                                          {
                                                                                            kind: 'Variable',
                                                                                            name: {
                                                                                              kind: 'Name',
                                                                                              value:
                                                                                                'locale',
                                                                                            },
                                                                                          },
                                                                                      },
                                                                                    ],
                                                                                },
                                                                            },
                                                                          ],
                                                                      },
                                                                    },
                                                                  ],
                                                                  selectionSet:
                                                                    {
                                                                      kind: 'SelectionSet',
                                                                      selections:
                                                                        [
                                                                          {
                                                                            kind: 'Field',
                                                                            name: {
                                                                              kind: 'Name',
                                                                              value:
                                                                                'data',
                                                                            },
                                                                            selectionSet:
                                                                              {
                                                                                kind: 'SelectionSet',
                                                                                selections:
                                                                                  [
                                                                                    {
                                                                                      kind: 'Field',
                                                                                      name: {
                                                                                        kind: 'Name',
                                                                                        value:
                                                                                          'attributes',
                                                                                      },
                                                                                      selectionSet:
                                                                                        {
                                                                                          kind: 'SelectionSet',
                                                                                          selections:
                                                                                            [
                                                                                              {
                                                                                                kind: 'Field',
                                                                                                name: {
                                                                                                  kind: 'Name',
                                                                                                  value:
                                                                                                    'details',
                                                                                                },
                                                                                              },
                                                                                              {
                                                                                                kind: 'Field',
                                                                                                name: {
                                                                                                  kind: 'Name',
                                                                                                  value:
                                                                                                    'productName',
                                                                                                },
                                                                                              },
                                                                                              {
                                                                                                kind: 'Field',
                                                                                                name: {
                                                                                                  kind: 'Name',
                                                                                                  value:
                                                                                                    'subtitle',
                                                                                                },
                                                                                              },
                                                                                              {
                                                                                                kind: 'Field',
                                                                                                name: {
                                                                                                  kind: 'Name',
                                                                                                  value:
                                                                                                    'webIcon',
                                                                                                },
                                                                                              },
                                                                                            ],
                                                                                        },
                                                                                    },
                                                                                  ],
                                                                              },
                                                                          },
                                                                        ],
                                                                    },
                                                                },
                                                              ],
                                                            },
                                                          },
                                                        ],
                                                      },
                                                    },
                                                  ],
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'commonContent' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'data' },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: {
                                            kind: 'Name',
                                            value: 'attributes',
                                          },
                                          selectionSet: {
                                            kind: 'SelectionSet',
                                            selections: [
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'privacyNoticeUrl',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value:
                                                    'privacyNoticeDownloadUrl',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'termsOfServiceUrl',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value:
                                                    'termsOfServiceDownloadUrl',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'cancellationUrl',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'emailIcon',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value:
                                                    'successActionButtonUrl',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value:
                                                    'successActionButtonLabel',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value:
                                                    'newsletterLabelTextCode',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'newsletterSlug',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'localizations',
                                                },
                                                arguments: [
                                                  {
                                                    kind: 'Argument',
                                                    name: {
                                                      kind: 'Name',
                                                      value: 'filters',
                                                    },
                                                    value: {
                                                      kind: 'ObjectValue',
                                                      fields: [
                                                        {
                                                          kind: 'ObjectField',
                                                          name: {
                                                            kind: 'Name',
                                                            value: 'locale',
                                                          },
                                                          value: {
                                                            kind: 'ObjectValue',
                                                            fields: [
                                                              {
                                                                kind: 'ObjectField',
                                                                name: {
                                                                  kind: 'Name',
                                                                  value: 'eq',
                                                                },
                                                                value: {
                                                                  kind: 'Variable',
                                                                  name: {
                                                                    kind: 'Name',
                                                                    value:
                                                                      'locale',
                                                                  },
                                                                },
                                                              },
                                                            ],
                                                          },
                                                        },
                                                      ],
                                                    },
                                                  },
                                                ],
                                                selectionSet: {
                                                  kind: 'SelectionSet',
                                                  selections: [
                                                    {
                                                      kind: 'Field',
                                                      name: {
                                                        kind: 'Name',
                                                        value: 'data',
                                                      },
                                                      selectionSet: {
                                                        kind: 'SelectionSet',
                                                        selections: [
                                                          {
                                                            kind: 'Field',
                                                            name: {
                                                              kind: 'Name',
                                                              value:
                                                                'attributes',
                                                            },
                                                            selectionSet: {
                                                              kind: 'SelectionSet',
                                                              selections: [
                                                                {
                                                                  kind: 'Field',
                                                                  name: {
                                                                    kind: 'Name',
                                                                    value:
                                                                      'privacyNoticeUrl',
                                                                  },
                                                                },
                                                                {
                                                                  kind: 'Field',
                                                                  name: {
                                                                    kind: 'Name',
                                                                    value:
                                                                      'privacyNoticeDownloadUrl',
                                                                  },
                                                                },
                                                                {
                                                                  kind: 'Field',
                                                                  name: {
                                                                    kind: 'Name',
                                                                    value:
                                                                      'termsOfServiceUrl',
                                                                  },
                                                                },
                                                                {
                                                                  kind: 'Field',
                                                                  name: {
                                                                    kind: 'Name',
                                                                    value:
                                                                      'termsOfServiceDownloadUrl',
                                                                  },
                                                                },
                                                                {
                                                                  kind: 'Field',
                                                                  name: {
                                                                    kind: 'Name',
                                                                    value:
                                                                      'cancellationUrl',
                                                                  },
                                                                },
                                                                {
                                                                  kind: 'Field',
                                                                  name: {
                                                                    kind: 'Name',
                                                                    value:
                                                                      'emailIcon',
                                                                  },
                                                                },
                                                                {
                                                                  kind: 'Field',
                                                                  name: {
                                                                    kind: 'Name',
                                                                    value:
                                                                      'successActionButtonUrl',
                                                                  },
                                                                },
                                                                {
                                                                  kind: 'Field',
                                                                  name: {
                                                                    kind: 'Name',
                                                                    value:
                                                                      'successActionButtonLabel',
                                                                  },
                                                                },
                                                                {
                                                                  kind: 'Field',
                                                                  name: {
                                                                    kind: 'Name',
                                                                    value:
                                                                      'newsletterLabelTextCode',
                                                                  },
                                                                },
                                                                {
                                                                  kind: 'Field',
                                                                  name: {
                                                                    kind: 'Name',
                                                                    value:
                                                                      'newsletterSlug',
                                                                  },
                                                                },
                                                              ],
                                                            },
                                                          },
                                                        ],
                                                      },
                                                    },
                                                  ],
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  PageContentForOfferingQuery,
  PageContentForOfferingQueryVariables
>;
export const PurchaseWithDetailsOfferingContentDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'PurchaseWithDetailsOfferingContent' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'limit' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'locale' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'stripePlanIds' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'ListType',
              type: {
                kind: 'NamedType',
                name: { kind: 'Name', value: 'String' },
              },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'purchases' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'pagination' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'start' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'skip' },
                      },
                    },
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'limit' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'limit' },
                      },
                    },
                  ],
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'filters' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'or' },
                      value: {
                        kind: 'ListValue',
                        values: [
                          {
                            kind: 'ObjectValue',
                            fields: [
                              {
                                kind: 'ObjectField',
                                name: {
                                  kind: 'Name',
                                  value: 'stripePlanChoices',
                                },
                                value: {
                                  kind: 'ObjectValue',
                                  fields: [
                                    {
                                      kind: 'ObjectField',
                                      name: {
                                        kind: 'Name',
                                        value: 'stripePlanChoice',
                                      },
                                      value: {
                                        kind: 'ObjectValue',
                                        fields: [
                                          {
                                            kind: 'ObjectField',
                                            name: { kind: 'Name', value: 'in' },
                                            value: {
                                              kind: 'Variable',
                                              name: {
                                                kind: 'Name',
                                                value: 'stripePlanIds',
                                              },
                                            },
                                          },
                                        ],
                                      },
                                    },
                                  ],
                                },
                              },
                            ],
                          },
                          {
                            kind: 'ObjectValue',
                            fields: [
                              {
                                kind: 'ObjectField',
                                name: { kind: 'Name', value: 'offering' },
                                value: {
                                  kind: 'ObjectValue',
                                  fields: [
                                    {
                                      kind: 'ObjectField',
                                      name: {
                                        kind: 'Name',
                                        value: 'stripeLegacyPlans',
                                      },
                                      value: {
                                        kind: 'ObjectValue',
                                        fields: [
                                          {
                                            kind: 'ObjectField',
                                            name: {
                                              kind: 'Name',
                                              value: 'stripeLegacyPlan',
                                            },
                                            value: {
                                              kind: 'ObjectValue',
                                              fields: [
                                                {
                                                  kind: 'ObjectField',
                                                  name: {
                                                    kind: 'Name',
                                                    value: 'in',
                                                  },
                                                  value: {
                                                    kind: 'Variable',
                                                    name: {
                                                      kind: 'Name',
                                                      value: 'stripePlanIds',
                                                    },
                                                  },
                                                },
                                              ],
                                            },
                                          },
                                        ],
                                      },
                                    },
                                  ],
                                },
                              },
                            ],
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'data' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'attributes' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: {
                                kind: 'Name',
                                value: 'stripePlanChoices',
                              },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: {
                                      kind: 'Name',
                                      value: 'stripePlanChoice',
                                    },
                                  },
                                ],
                              },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'purchaseDetails' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'data' },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: {
                                            kind: 'Name',
                                            value: 'attributes',
                                          },
                                          selectionSet: {
                                            kind: 'SelectionSet',
                                            selections: [
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'details',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'productName',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'subtitle',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'webIcon',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'localizations',
                                                },
                                                arguments: [
                                                  {
                                                    kind: 'Argument',
                                                    name: {
                                                      kind: 'Name',
                                                      value: 'filters',
                                                    },
                                                    value: {
                                                      kind: 'ObjectValue',
                                                      fields: [
                                                        {
                                                          kind: 'ObjectField',
                                                          name: {
                                                            kind: 'Name',
                                                            value: 'locale',
                                                          },
                                                          value: {
                                                            kind: 'ObjectValue',
                                                            fields: [
                                                              {
                                                                kind: 'ObjectField',
                                                                name: {
                                                                  kind: 'Name',
                                                                  value: 'eq',
                                                                },
                                                                value: {
                                                                  kind: 'Variable',
                                                                  name: {
                                                                    kind: 'Name',
                                                                    value:
                                                                      'locale',
                                                                  },
                                                                },
                                                              },
                                                            ],
                                                          },
                                                        },
                                                      ],
                                                    },
                                                  },
                                                ],
                                                selectionSet: {
                                                  kind: 'SelectionSet',
                                                  selections: [
                                                    {
                                                      kind: 'Field',
                                                      name: {
                                                        kind: 'Name',
                                                        value: 'data',
                                                      },
                                                      selectionSet: {
                                                        kind: 'SelectionSet',
                                                        selections: [
                                                          {
                                                            kind: 'Field',
                                                            name: {
                                                              kind: 'Name',
                                                              value:
                                                                'attributes',
                                                            },
                                                            selectionSet: {
                                                              kind: 'SelectionSet',
                                                              selections: [
                                                                {
                                                                  kind: 'Field',
                                                                  name: {
                                                                    kind: 'Name',
                                                                    value:
                                                                      'details',
                                                                  },
                                                                },
                                                                {
                                                                  kind: 'Field',
                                                                  name: {
                                                                    kind: 'Name',
                                                                    value:
                                                                      'productName',
                                                                  },
                                                                },
                                                                {
                                                                  kind: 'Field',
                                                                  name: {
                                                                    kind: 'Name',
                                                                    value:
                                                                      'subtitle',
                                                                  },
                                                                },
                                                                {
                                                                  kind: 'Field',
                                                                  name: {
                                                                    kind: 'Name',
                                                                    value:
                                                                      'webIcon',
                                                                  },
                                                                },
                                                              ],
                                                            },
                                                          },
                                                        ],
                                                      },
                                                    },
                                                  ],
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'offering' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'data' },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: {
                                            kind: 'Name',
                                            value: 'attributes',
                                          },
                                          selectionSet: {
                                            kind: 'SelectionSet',
                                            selections: [
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'stripeProductId',
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'stripeLegacyPlans',
                                                },
                                                arguments: [
                                                  {
                                                    kind: 'Argument',
                                                    name: {
                                                      kind: 'Name',
                                                      value: 'pagination',
                                                    },
                                                    value: {
                                                      kind: 'ObjectValue',
                                                      fields: [
                                                        {
                                                          kind: 'ObjectField',
                                                          name: {
                                                            kind: 'Name',
                                                            value: 'limit',
                                                          },
                                                          value: {
                                                            kind: 'IntValue',
                                                            value: '200',
                                                          },
                                                        },
                                                      ],
                                                    },
                                                  },
                                                ],
                                                selectionSet: {
                                                  kind: 'SelectionSet',
                                                  selections: [
                                                    {
                                                      kind: 'Field',
                                                      name: {
                                                        kind: 'Name',
                                                        value:
                                                          'stripeLegacyPlan',
                                                      },
                                                    },
                                                  ],
                                                },
                                              },
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'commonContent',
                                                },
                                                selectionSet: {
                                                  kind: 'SelectionSet',
                                                  selections: [
                                                    {
                                                      kind: 'Field',
                                                      name: {
                                                        kind: 'Name',
                                                        value: 'data',
                                                      },
                                                      selectionSet: {
                                                        kind: 'SelectionSet',
                                                        selections: [
                                                          {
                                                            kind: 'Field',
                                                            name: {
                                                              kind: 'Name',
                                                              value:
                                                                'attributes',
                                                            },
                                                            selectionSet: {
                                                              kind: 'SelectionSet',
                                                              selections: [
                                                                {
                                                                  kind: 'Field',
                                                                  name: {
                                                                    kind: 'Name',
                                                                    value:
                                                                      'privacyNoticeUrl',
                                                                  },
                                                                },
                                                                {
                                                                  kind: 'Field',
                                                                  name: {
                                                                    kind: 'Name',
                                                                    value:
                                                                      'privacyNoticeDownloadUrl',
                                                                  },
                                                                },
                                                                {
                                                                  kind: 'Field',
                                                                  name: {
                                                                    kind: 'Name',
                                                                    value:
                                                                      'termsOfServiceUrl',
                                                                  },
                                                                },
                                                                {
                                                                  kind: 'Field',
                                                                  name: {
                                                                    kind: 'Name',
                                                                    value:
                                                                      'termsOfServiceDownloadUrl',
                                                                  },
                                                                },
                                                                {
                                                                  kind: 'Field',
                                                                  name: {
                                                                    kind: 'Name',
                                                                    value:
                                                                      'cancellationUrl',
                                                                  },
                                                                },
                                                                {
                                                                  kind: 'Field',
                                                                  name: {
                                                                    kind: 'Name',
                                                                    value:
                                                                      'emailIcon',
                                                                  },
                                                                },
                                                                {
                                                                  kind: 'Field',
                                                                  name: {
                                                                    kind: 'Name',
                                                                    value:
                                                                      'successActionButtonUrl',
                                                                  },
                                                                },
                                                                {
                                                                  kind: 'Field',
                                                                  name: {
                                                                    kind: 'Name',
                                                                    value:
                                                                      'successActionButtonLabel',
                                                                  },
                                                                },
                                                                {
                                                                  kind: 'Field',
                                                                  name: {
                                                                    kind: 'Name',
                                                                    value:
                                                                      'newsletterLabelTextCode',
                                                                  },
                                                                },
                                                                {
                                                                  kind: 'Field',
                                                                  name: {
                                                                    kind: 'Name',
                                                                    value:
                                                                      'newsletterSlug',
                                                                  },
                                                                },
                                                                {
                                                                  kind: 'Field',
                                                                  name: {
                                                                    kind: 'Name',
                                                                    value:
                                                                      'localizations',
                                                                  },
                                                                  arguments: [
                                                                    {
                                                                      kind: 'Argument',
                                                                      name: {
                                                                        kind: 'Name',
                                                                        value:
                                                                          'filters',
                                                                      },
                                                                      value: {
                                                                        kind: 'ObjectValue',
                                                                        fields:
                                                                          [
                                                                            {
                                                                              kind: 'ObjectField',
                                                                              name: {
                                                                                kind: 'Name',
                                                                                value:
                                                                                  'locale',
                                                                              },
                                                                              value:
                                                                                {
                                                                                  kind: 'ObjectValue',
                                                                                  fields:
                                                                                    [
                                                                                      {
                                                                                        kind: 'ObjectField',
                                                                                        name: {
                                                                                          kind: 'Name',
                                                                                          value:
                                                                                            'eq',
                                                                                        },
                                                                                        value:
                                                                                          {
                                                                                            kind: 'Variable',
                                                                                            name: {
                                                                                              kind: 'Name',
                                                                                              value:
                                                                                                'locale',
                                                                                            },
                                                                                          },
                                                                                      },
                                                                                    ],
                                                                                },
                                                                            },
                                                                          ],
                                                                      },
                                                                    },
                                                                  ],
                                                                  selectionSet:
                                                                    {
                                                                      kind: 'SelectionSet',
                                                                      selections:
                                                                        [
                                                                          {
                                                                            kind: 'Field',
                                                                            name: {
                                                                              kind: 'Name',
                                                                              value:
                                                                                'data',
                                                                            },
                                                                            selectionSet:
                                                                              {
                                                                                kind: 'SelectionSet',
                                                                                selections:
                                                                                  [
                                                                                    {
                                                                                      kind: 'Field',
                                                                                      name: {
                                                                                        kind: 'Name',
                                                                                        value:
                                                                                          'attributes',
                                                                                      },
                                                                                      selectionSet:
                                                                                        {
                                                                                          kind: 'SelectionSet',
                                                                                          selections:
                                                                                            [
                                                                                              {
                                                                                                kind: 'Field',
                                                                                                name: {
                                                                                                  kind: 'Name',
                                                                                                  value:
                                                                                                    'privacyNoticeUrl',
                                                                                                },
                                                                                              },
                                                                                              {
                                                                                                kind: 'Field',
                                                                                                name: {
                                                                                                  kind: 'Name',
                                                                                                  value:
                                                                                                    'privacyNoticeDownloadUrl',
                                                                                                },
                                                                                              },
                                                                                              {
                                                                                                kind: 'Field',
                                                                                                name: {
                                                                                                  kind: 'Name',
                                                                                                  value:
                                                                                                    'termsOfServiceUrl',
                                                                                                },
                                                                                              },
                                                                                              {
                                                                                                kind: 'Field',
                                                                                                name: {
                                                                                                  kind: 'Name',
                                                                                                  value:
                                                                                                    'termsOfServiceDownloadUrl',
                                                                                                },
                                                                                              },
                                                                                              {
                                                                                                kind: 'Field',
                                                                                                name: {
                                                                                                  kind: 'Name',
                                                                                                  value:
                                                                                                    'cancellationUrl',
                                                                                                },
                                                                                              },
                                                                                              {
                                                                                                kind: 'Field',
                                                                                                name: {
                                                                                                  kind: 'Name',
                                                                                                  value:
                                                                                                    'emailIcon',
                                                                                                },
                                                                                              },
                                                                                              {
                                                                                                kind: 'Field',
                                                                                                name: {
                                                                                                  kind: 'Name',
                                                                                                  value:
                                                                                                    'successActionButtonUrl',
                                                                                                },
                                                                                              },
                                                                                              {
                                                                                                kind: 'Field',
                                                                                                name: {
                                                                                                  kind: 'Name',
                                                                                                  value:
                                                                                                    'successActionButtonLabel',
                                                                                                },
                                                                                              },
                                                                                              {
                                                                                                kind: 'Field',
                                                                                                name: {
                                                                                                  kind: 'Name',
                                                                                                  value:
                                                                                                    'newsletterLabelTextCode',
                                                                                                },
                                                                                              },
                                                                                              {
                                                                                                kind: 'Field',
                                                                                                name: {
                                                                                                  kind: 'Name',
                                                                                                  value:
                                                                                                    'newsletterSlug',
                                                                                                },
                                                                                              },
                                                                                            ],
                                                                                        },
                                                                                    },
                                                                                  ],
                                                                              },
                                                                          },
                                                                        ],
                                                                    },
                                                                },
                                                              ],
                                                            },
                                                          },
                                                        ],
                                                      },
                                                    },
                                                  ],
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  PurchaseWithDetailsOfferingContentQuery,
  PurchaseWithDetailsOfferingContentQueryVariables
>;
export const ServicesWithCapabilitiesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'ServicesWithCapabilities' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'limit' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'services' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'pagination' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'start' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'skip' },
                      },
                    },
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'limit' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'limit' },
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'data' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'attributes' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'oauthClientId' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'capabilities' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'data' },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: {
                                            kind: 'Name',
                                            value: 'attributes',
                                          },
                                          selectionSet: {
                                            kind: 'SelectionSet',
                                            selections: [
                                              {
                                                kind: 'Field',
                                                name: {
                                                  kind: 'Name',
                                                  value: 'slug',
                                                },
                                              },
                                            ],
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ServicesWithCapabilitiesQuery,
  ServicesWithCapabilitiesQueryVariables
>;

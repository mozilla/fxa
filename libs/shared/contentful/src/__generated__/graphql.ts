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
  /**
   * A date-time string at UTC, such as 2007-12-03T10:15:30Z,
   *     compliant with the 'date-time' format outlined in section 5.6 of
   *     the RFC 3339 profile of the ISO 8601 standard for representation
   *     of dates and times using the Gregorian calendar.
   */
  DateTime: { input: any; output: any };
  /** The 'Dimension' type represents dimensions as whole numeric values between `1` and `4000`. */
  Dimension: { input: any; output: any };
  /** The 'HexColor' type represents color in `rgb:ffffff` string format. */
  HexColor: { input: any; output: any };
  /** The 'Quality' type represents quality as whole numeric values between `1` and `100`. */
  Quality: { input: any; output: any };
};

/** Represents a binary file in a space. An asset can be any file type. */
export type Asset = {
  __typename?: 'Asset';
  contentType: Maybe<Scalars['String']['output']>;
  contentfulMetadata: ContentfulMetadata;
  description: Maybe<Scalars['String']['output']>;
  fileName: Maybe<Scalars['String']['output']>;
  height: Maybe<Scalars['Int']['output']>;
  linkedFrom: Maybe<AssetLinkingCollections>;
  size: Maybe<Scalars['Int']['output']>;
  sys: Sys;
  title: Maybe<Scalars['String']['output']>;
  url: Maybe<Scalars['String']['output']>;
  width: Maybe<Scalars['Int']['output']>;
};

/** Represents a binary file in a space. An asset can be any file type. */
export type AssetContentTypeArgs = {
  locale: InputMaybe<Scalars['String']['input']>;
};

/** Represents a binary file in a space. An asset can be any file type. */
export type AssetDescriptionArgs = {
  locale: InputMaybe<Scalars['String']['input']>;
};

/** Represents a binary file in a space. An asset can be any file type. */
export type AssetFileNameArgs = {
  locale: InputMaybe<Scalars['String']['input']>;
};

/** Represents a binary file in a space. An asset can be any file type. */
export type AssetHeightArgs = {
  locale: InputMaybe<Scalars['String']['input']>;
};

/** Represents a binary file in a space. An asset can be any file type. */
export type AssetLinkedFromArgs = {
  allowedLocales: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

/** Represents a binary file in a space. An asset can be any file type. */
export type AssetSizeArgs = {
  locale: InputMaybe<Scalars['String']['input']>;
};

/** Represents a binary file in a space. An asset can be any file type. */
export type AssetTitleArgs = {
  locale: InputMaybe<Scalars['String']['input']>;
};

/** Represents a binary file in a space. An asset can be any file type. */
export type AssetUrlArgs = {
  locale: InputMaybe<Scalars['String']['input']>;
  transform: InputMaybe<ImageTransformOptions>;
};

/** Represents a binary file in a space. An asset can be any file type. */
export type AssetWidthArgs = {
  locale: InputMaybe<Scalars['String']['input']>;
};

export type AssetCollection = {
  __typename?: 'AssetCollection';
  items: Array<Maybe<Asset>>;
  limit: Scalars['Int']['output'];
  skip: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type AssetFilter = {
  AND: InputMaybe<Array<InputMaybe<AssetFilter>>>;
  OR: InputMaybe<Array<InputMaybe<AssetFilter>>>;
  contentType: InputMaybe<Scalars['String']['input']>;
  contentType_contains: InputMaybe<Scalars['String']['input']>;
  contentType_exists: InputMaybe<Scalars['Boolean']['input']>;
  contentType_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  contentType_not: InputMaybe<Scalars['String']['input']>;
  contentType_not_contains: InputMaybe<Scalars['String']['input']>;
  contentType_not_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  contentfulMetadata: InputMaybe<ContentfulMetadataFilter>;
  description: InputMaybe<Scalars['String']['input']>;
  description_contains: InputMaybe<Scalars['String']['input']>;
  description_exists: InputMaybe<Scalars['Boolean']['input']>;
  description_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  description_not: InputMaybe<Scalars['String']['input']>;
  description_not_contains: InputMaybe<Scalars['String']['input']>;
  description_not_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  fileName: InputMaybe<Scalars['String']['input']>;
  fileName_contains: InputMaybe<Scalars['String']['input']>;
  fileName_exists: InputMaybe<Scalars['Boolean']['input']>;
  fileName_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  fileName_not: InputMaybe<Scalars['String']['input']>;
  fileName_not_contains: InputMaybe<Scalars['String']['input']>;
  fileName_not_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  height: InputMaybe<Scalars['Int']['input']>;
  height_exists: InputMaybe<Scalars['Boolean']['input']>;
  height_gt: InputMaybe<Scalars['Int']['input']>;
  height_gte: InputMaybe<Scalars['Int']['input']>;
  height_in: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  height_lt: InputMaybe<Scalars['Int']['input']>;
  height_lte: InputMaybe<Scalars['Int']['input']>;
  height_not: InputMaybe<Scalars['Int']['input']>;
  height_not_in: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  size: InputMaybe<Scalars['Int']['input']>;
  size_exists: InputMaybe<Scalars['Boolean']['input']>;
  size_gt: InputMaybe<Scalars['Int']['input']>;
  size_gte: InputMaybe<Scalars['Int']['input']>;
  size_in: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  size_lt: InputMaybe<Scalars['Int']['input']>;
  size_lte: InputMaybe<Scalars['Int']['input']>;
  size_not: InputMaybe<Scalars['Int']['input']>;
  size_not_in: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  sys: InputMaybe<SysFilter>;
  title: InputMaybe<Scalars['String']['input']>;
  title_contains: InputMaybe<Scalars['String']['input']>;
  title_exists: InputMaybe<Scalars['Boolean']['input']>;
  title_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  title_not: InputMaybe<Scalars['String']['input']>;
  title_not_contains: InputMaybe<Scalars['String']['input']>;
  title_not_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  url: InputMaybe<Scalars['String']['input']>;
  url_contains: InputMaybe<Scalars['String']['input']>;
  url_exists: InputMaybe<Scalars['Boolean']['input']>;
  url_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  url_not: InputMaybe<Scalars['String']['input']>;
  url_not_contains: InputMaybe<Scalars['String']['input']>;
  url_not_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  width: InputMaybe<Scalars['Int']['input']>;
  width_exists: InputMaybe<Scalars['Boolean']['input']>;
  width_gt: InputMaybe<Scalars['Int']['input']>;
  width_gte: InputMaybe<Scalars['Int']['input']>;
  width_in: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  width_lt: InputMaybe<Scalars['Int']['input']>;
  width_lte: InputMaybe<Scalars['Int']['input']>;
  width_not: InputMaybe<Scalars['Int']['input']>;
  width_not_in: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
};

export type AssetLinkingCollections = {
  __typename?: 'AssetLinkingCollections';
  entryCollection: Maybe<EntryCollection>;
};

export type AssetLinkingCollectionsEntryCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale: InputMaybe<Scalars['String']['input']>;
  preview: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};

export enum AssetOrder {
  ContentTypeAsc = 'contentType_ASC',
  ContentTypeDesc = 'contentType_DESC',
  FileNameAsc = 'fileName_ASC',
  FileNameDesc = 'fileName_DESC',
  HeightAsc = 'height_ASC',
  HeightDesc = 'height_DESC',
  SizeAsc = 'size_ASC',
  SizeDesc = 'size_DESC',
  SysFirstPublishedAtAsc = 'sys_firstPublishedAt_ASC',
  SysFirstPublishedAtDesc = 'sys_firstPublishedAt_DESC',
  SysIdAsc = 'sys_id_ASC',
  SysIdDesc = 'sys_id_DESC',
  SysPublishedAtAsc = 'sys_publishedAt_ASC',
  SysPublishedAtDesc = 'sys_publishedAt_DESC',
  SysPublishedVersionAsc = 'sys_publishedVersion_ASC',
  SysPublishedVersionDesc = 'sys_publishedVersion_DESC',
  UrlAsc = 'url_ASC',
  UrlDesc = 'url_DESC',
  WidthAsc = 'width_ASC',
  WidthDesc = 'width_DESC',
}

/** Capabilities that services honor, and that customers are entitled to depending on the offering they've purchased. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/capability) */
export type Capability = Entry & {
  __typename?: 'Capability';
  contentfulMetadata: ContentfulMetadata;
  description: Maybe<Scalars['String']['output']>;
  internalName: Maybe<Scalars['String']['output']>;
  linkedFrom: Maybe<CapabilityLinkingCollections>;
  servicesCollection: Maybe<CapabilityServicesCollection>;
  slug: Maybe<Scalars['String']['output']>;
  sys: Sys;
};

/** Capabilities that services honor, and that customers are entitled to depending on the offering they've purchased. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/capability) */
export type CapabilityDescriptionArgs = {
  locale: InputMaybe<Scalars['String']['input']>;
};

/** Capabilities that services honor, and that customers are entitled to depending on the offering they've purchased. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/capability) */
export type CapabilityInternalNameArgs = {
  locale: InputMaybe<Scalars['String']['input']>;
};

/** Capabilities that services honor, and that customers are entitled to depending on the offering they've purchased. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/capability) */
export type CapabilityLinkedFromArgs = {
  allowedLocales: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

/** Capabilities that services honor, and that customers are entitled to depending on the offering they've purchased. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/capability) */
export type CapabilityServicesCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale: InputMaybe<Scalars['String']['input']>;
  order: InputMaybe<Array<InputMaybe<CapabilityServicesCollectionOrder>>>;
  preview: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where: InputMaybe<ServiceFilter>;
};

/** Capabilities that services honor, and that customers are entitled to depending on the offering they've purchased. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/capability) */
export type CapabilitySlugArgs = {
  locale: InputMaybe<Scalars['String']['input']>;
};

export type CapabilityCollection = {
  __typename?: 'CapabilityCollection';
  items: Array<Maybe<Capability>>;
  limit: Scalars['Int']['output'];
  skip: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type CapabilityFilter = {
  AND: InputMaybe<Array<InputMaybe<CapabilityFilter>>>;
  OR: InputMaybe<Array<InputMaybe<CapabilityFilter>>>;
  contentfulMetadata: InputMaybe<ContentfulMetadataFilter>;
  description: InputMaybe<Scalars['String']['input']>;
  description_contains: InputMaybe<Scalars['String']['input']>;
  description_exists: InputMaybe<Scalars['Boolean']['input']>;
  description_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  description_not: InputMaybe<Scalars['String']['input']>;
  description_not_contains: InputMaybe<Scalars['String']['input']>;
  description_not_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  internalName: InputMaybe<Scalars['String']['input']>;
  internalName_contains: InputMaybe<Scalars['String']['input']>;
  internalName_exists: InputMaybe<Scalars['Boolean']['input']>;
  internalName_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  internalName_not: InputMaybe<Scalars['String']['input']>;
  internalName_not_contains: InputMaybe<Scalars['String']['input']>;
  internalName_not_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  services: InputMaybe<CfServiceNestedFilter>;
  servicesCollection_exists: InputMaybe<Scalars['Boolean']['input']>;
  slug: InputMaybe<Scalars['String']['input']>;
  slug_contains: InputMaybe<Scalars['String']['input']>;
  slug_exists: InputMaybe<Scalars['Boolean']['input']>;
  slug_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  slug_not: InputMaybe<Scalars['String']['input']>;
  slug_not_contains: InputMaybe<Scalars['String']['input']>;
  slug_not_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  sys: InputMaybe<SysFilter>;
};

export type CapabilityLinkingCollections = {
  __typename?: 'CapabilityLinkingCollections';
  entryCollection: Maybe<EntryCollection>;
  offeringCollection: Maybe<OfferingCollection>;
  serviceCollection: Maybe<ServiceCollection>;
};

export type CapabilityLinkingCollectionsEntryCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale: InputMaybe<Scalars['String']['input']>;
  preview: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};

export type CapabilityLinkingCollectionsOfferingCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale: InputMaybe<Scalars['String']['input']>;
  order: InputMaybe<
    Array<InputMaybe<CapabilityLinkingCollectionsOfferingCollectionOrder>>
  >;
  preview: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};

export type CapabilityLinkingCollectionsServiceCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale: InputMaybe<Scalars['String']['input']>;
  order: InputMaybe<
    Array<InputMaybe<CapabilityLinkingCollectionsServiceCollectionOrder>>
  >;
  preview: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};

export enum CapabilityLinkingCollectionsOfferingCollectionOrder {
  ApiIdentifierAsc = 'apiIdentifier_ASC',
  ApiIdentifierDesc = 'apiIdentifier_DESC',
  DescriptionAsc = 'description_ASC',
  DescriptionDesc = 'description_DESC',
  InternalNameAsc = 'internalName_ASC',
  InternalNameDesc = 'internalName_DESC',
  StripeProductIdAsc = 'stripeProductId_ASC',
  StripeProductIdDesc = 'stripeProductId_DESC',
  SysFirstPublishedAtAsc = 'sys_firstPublishedAt_ASC',
  SysFirstPublishedAtDesc = 'sys_firstPublishedAt_DESC',
  SysIdAsc = 'sys_id_ASC',
  SysIdDesc = 'sys_id_DESC',
  SysPublishedAtAsc = 'sys_publishedAt_ASC',
  SysPublishedAtDesc = 'sys_publishedAt_DESC',
  SysPublishedVersionAsc = 'sys_publishedVersion_ASC',
  SysPublishedVersionDesc = 'sys_publishedVersion_DESC',
}

export enum CapabilityLinkingCollectionsServiceCollectionOrder {
  DescriptionAsc = 'description_ASC',
  DescriptionDesc = 'description_DESC',
  InternalNameAsc = 'internalName_ASC',
  InternalNameDesc = 'internalName_DESC',
  OauthClientIdAsc = 'oauthClientId_ASC',
  OauthClientIdDesc = 'oauthClientId_DESC',
  SysFirstPublishedAtAsc = 'sys_firstPublishedAt_ASC',
  SysFirstPublishedAtDesc = 'sys_firstPublishedAt_DESC',
  SysIdAsc = 'sys_id_ASC',
  SysIdDesc = 'sys_id_DESC',
  SysPublishedAtAsc = 'sys_publishedAt_ASC',
  SysPublishedAtDesc = 'sys_publishedAt_DESC',
  SysPublishedVersionAsc = 'sys_publishedVersion_ASC',
  SysPublishedVersionDesc = 'sys_publishedVersion_DESC',
}

export enum CapabilityOrder {
  DescriptionAsc = 'description_ASC',
  DescriptionDesc = 'description_DESC',
  InternalNameAsc = 'internalName_ASC',
  InternalNameDesc = 'internalName_DESC',
  SlugAsc = 'slug_ASC',
  SlugDesc = 'slug_DESC',
  SysFirstPublishedAtAsc = 'sys_firstPublishedAt_ASC',
  SysFirstPublishedAtDesc = 'sys_firstPublishedAt_DESC',
  SysIdAsc = 'sys_id_ASC',
  SysIdDesc = 'sys_id_DESC',
  SysPublishedAtAsc = 'sys_publishedAt_ASC',
  SysPublishedAtDesc = 'sys_publishedAt_DESC',
  SysPublishedVersionAsc = 'sys_publishedVersion_ASC',
  SysPublishedVersionDesc = 'sys_publishedVersion_DESC',
}

export type CapabilityServicesCollection = {
  __typename?: 'CapabilityServicesCollection';
  items: Array<Maybe<Service>>;
  limit: Scalars['Int']['output'];
  skip: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export enum CapabilityServicesCollectionOrder {
  DescriptionAsc = 'description_ASC',
  DescriptionDesc = 'description_DESC',
  InternalNameAsc = 'internalName_ASC',
  InternalNameDesc = 'internalName_DESC',
  OauthClientIdAsc = 'oauthClientId_ASC',
  OauthClientIdDesc = 'oauthClientId_DESC',
  SysFirstPublishedAtAsc = 'sys_firstPublishedAt_ASC',
  SysFirstPublishedAtDesc = 'sys_firstPublishedAt_DESC',
  SysIdAsc = 'sys_id_ASC',
  SysIdDesc = 'sys_id_DESC',
  SysPublishedAtAsc = 'sys_publishedAt_ASC',
  SysPublishedAtDesc = 'sys_publishedAt_DESC',
  SysPublishedVersionAsc = 'sys_publishedVersion_ASC',
  SysPublishedVersionDesc = 'sys_publishedVersion_DESC',
}

/** Content used on multiple pages, not specific to a certain component. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/commonContent) */
export type CommonContent = Entry & {
  __typename?: 'CommonContent';
  cancellationUrl: Maybe<Scalars['String']['output']>;
  contentfulMetadata: ContentfulMetadata;
  emailIcon: Maybe<Scalars['String']['output']>;
  internalName: Maybe<Scalars['String']['output']>;
  linkedFrom: Maybe<CommonContentLinkingCollections>;
  newsletterLabelTextCode: Maybe<Scalars['String']['output']>;
  newsletterSlug: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  privacyNoticeDownloadUrl: Maybe<Scalars['String']['output']>;
  privacyNoticeUrl: Maybe<Scalars['String']['output']>;
  successActionButtonLabel: Maybe<Scalars['String']['output']>;
  successActionButtonUrl: Maybe<Scalars['String']['output']>;
  sys: Sys;
  termsOfServiceDownloadUrl: Maybe<Scalars['String']['output']>;
  termsOfServiceUrl: Maybe<Scalars['String']['output']>;
};

/** Content used on multiple pages, not specific to a certain component. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/commonContent) */
export type CommonContentCancellationUrlArgs = {
  locale: InputMaybe<Scalars['String']['input']>;
};

/** Content used on multiple pages, not specific to a certain component. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/commonContent) */
export type CommonContentEmailIconArgs = {
  locale: InputMaybe<Scalars['String']['input']>;
};

/** Content used on multiple pages, not specific to a certain component. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/commonContent) */
export type CommonContentInternalNameArgs = {
  locale: InputMaybe<Scalars['String']['input']>;
};

/** Content used on multiple pages, not specific to a certain component. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/commonContent) */
export type CommonContentLinkedFromArgs = {
  allowedLocales: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

/** Content used on multiple pages, not specific to a certain component. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/commonContent) */
export type CommonContentNewsletterLabelTextCodeArgs = {
  locale: InputMaybe<Scalars['String']['input']>;
};

/** Content used on multiple pages, not specific to a certain component. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/commonContent) */
export type CommonContentNewsletterSlugArgs = {
  locale: InputMaybe<Scalars['String']['input']>;
};

/** Content used on multiple pages, not specific to a certain component. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/commonContent) */
export type CommonContentPrivacyNoticeDownloadUrlArgs = {
  locale: InputMaybe<Scalars['String']['input']>;
};

/** Content used on multiple pages, not specific to a certain component. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/commonContent) */
export type CommonContentPrivacyNoticeUrlArgs = {
  locale: InputMaybe<Scalars['String']['input']>;
};

/** Content used on multiple pages, not specific to a certain component. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/commonContent) */
export type CommonContentSuccessActionButtonLabelArgs = {
  locale: InputMaybe<Scalars['String']['input']>;
};

/** Content used on multiple pages, not specific to a certain component. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/commonContent) */
export type CommonContentSuccessActionButtonUrlArgs = {
  locale: InputMaybe<Scalars['String']['input']>;
};

/** Content used on multiple pages, not specific to a certain component. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/commonContent) */
export type CommonContentTermsOfServiceDownloadUrlArgs = {
  locale: InputMaybe<Scalars['String']['input']>;
};

/** Content used on multiple pages, not specific to a certain component. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/commonContent) */
export type CommonContentTermsOfServiceUrlArgs = {
  locale: InputMaybe<Scalars['String']['input']>;
};

export type CommonContentCollection = {
  __typename?: 'CommonContentCollection';
  items: Array<Maybe<CommonContent>>;
  limit: Scalars['Int']['output'];
  skip: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type CommonContentFilter = {
  AND: InputMaybe<Array<InputMaybe<CommonContentFilter>>>;
  OR: InputMaybe<Array<InputMaybe<CommonContentFilter>>>;
  cancellationUrl: InputMaybe<Scalars['String']['input']>;
  cancellationUrl_contains: InputMaybe<Scalars['String']['input']>;
  cancellationUrl_exists: InputMaybe<Scalars['Boolean']['input']>;
  cancellationUrl_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  cancellationUrl_not: InputMaybe<Scalars['String']['input']>;
  cancellationUrl_not_contains: InputMaybe<Scalars['String']['input']>;
  cancellationUrl_not_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  contentfulMetadata: InputMaybe<ContentfulMetadataFilter>;
  emailIcon: InputMaybe<Scalars['String']['input']>;
  emailIcon_contains: InputMaybe<Scalars['String']['input']>;
  emailIcon_exists: InputMaybe<Scalars['Boolean']['input']>;
  emailIcon_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  emailIcon_not: InputMaybe<Scalars['String']['input']>;
  emailIcon_not_contains: InputMaybe<Scalars['String']['input']>;
  emailIcon_not_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  internalName: InputMaybe<Scalars['String']['input']>;
  internalName_contains: InputMaybe<Scalars['String']['input']>;
  internalName_exists: InputMaybe<Scalars['Boolean']['input']>;
  internalName_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  internalName_not: InputMaybe<Scalars['String']['input']>;
  internalName_not_contains: InputMaybe<Scalars['String']['input']>;
  internalName_not_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  newsletterLabelTextCode: InputMaybe<Scalars['String']['input']>;
  newsletterLabelTextCode_contains: InputMaybe<Scalars['String']['input']>;
  newsletterLabelTextCode_exists: InputMaybe<Scalars['Boolean']['input']>;
  newsletterLabelTextCode_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  newsletterLabelTextCode_not: InputMaybe<Scalars['String']['input']>;
  newsletterLabelTextCode_not_contains: InputMaybe<Scalars['String']['input']>;
  newsletterLabelTextCode_not_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  newsletterSlug_contains_all: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  newsletterSlug_contains_none: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  newsletterSlug_contains_some: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  newsletterSlug_exists: InputMaybe<Scalars['Boolean']['input']>;
  privacyNoticeDownloadUrl: InputMaybe<Scalars['String']['input']>;
  privacyNoticeDownloadUrl_contains: InputMaybe<Scalars['String']['input']>;
  privacyNoticeDownloadUrl_exists: InputMaybe<Scalars['Boolean']['input']>;
  privacyNoticeDownloadUrl_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  privacyNoticeDownloadUrl_not: InputMaybe<Scalars['String']['input']>;
  privacyNoticeDownloadUrl_not_contains: InputMaybe<Scalars['String']['input']>;
  privacyNoticeDownloadUrl_not_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  privacyNoticeUrl: InputMaybe<Scalars['String']['input']>;
  privacyNoticeUrl_contains: InputMaybe<Scalars['String']['input']>;
  privacyNoticeUrl_exists: InputMaybe<Scalars['Boolean']['input']>;
  privacyNoticeUrl_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  privacyNoticeUrl_not: InputMaybe<Scalars['String']['input']>;
  privacyNoticeUrl_not_contains: InputMaybe<Scalars['String']['input']>;
  privacyNoticeUrl_not_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  successActionButtonLabel: InputMaybe<Scalars['String']['input']>;
  successActionButtonLabel_contains: InputMaybe<Scalars['String']['input']>;
  successActionButtonLabel_exists: InputMaybe<Scalars['Boolean']['input']>;
  successActionButtonLabel_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  successActionButtonLabel_not: InputMaybe<Scalars['String']['input']>;
  successActionButtonLabel_not_contains: InputMaybe<Scalars['String']['input']>;
  successActionButtonLabel_not_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  successActionButtonUrl: InputMaybe<Scalars['String']['input']>;
  successActionButtonUrl_contains: InputMaybe<Scalars['String']['input']>;
  successActionButtonUrl_exists: InputMaybe<Scalars['Boolean']['input']>;
  successActionButtonUrl_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  successActionButtonUrl_not: InputMaybe<Scalars['String']['input']>;
  successActionButtonUrl_not_contains: InputMaybe<Scalars['String']['input']>;
  successActionButtonUrl_not_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  sys: InputMaybe<SysFilter>;
  termsOfServiceDownloadUrl: InputMaybe<Scalars['String']['input']>;
  termsOfServiceDownloadUrl_contains: InputMaybe<Scalars['String']['input']>;
  termsOfServiceDownloadUrl_exists: InputMaybe<Scalars['Boolean']['input']>;
  termsOfServiceDownloadUrl_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  termsOfServiceDownloadUrl_not: InputMaybe<Scalars['String']['input']>;
  termsOfServiceDownloadUrl_not_contains: InputMaybe<
    Scalars['String']['input']
  >;
  termsOfServiceDownloadUrl_not_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  termsOfServiceUrl: InputMaybe<Scalars['String']['input']>;
  termsOfServiceUrl_contains: InputMaybe<Scalars['String']['input']>;
  termsOfServiceUrl_exists: InputMaybe<Scalars['Boolean']['input']>;
  termsOfServiceUrl_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  termsOfServiceUrl_not: InputMaybe<Scalars['String']['input']>;
  termsOfServiceUrl_not_contains: InputMaybe<Scalars['String']['input']>;
  termsOfServiceUrl_not_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
};

export type CommonContentLinkingCollections = {
  __typename?: 'CommonContentLinkingCollections';
  entryCollection: Maybe<EntryCollection>;
  offeringCollection: Maybe<OfferingCollection>;
};

export type CommonContentLinkingCollectionsEntryCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale: InputMaybe<Scalars['String']['input']>;
  preview: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};

export type CommonContentLinkingCollectionsOfferingCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale: InputMaybe<Scalars['String']['input']>;
  order: InputMaybe<
    Array<InputMaybe<CommonContentLinkingCollectionsOfferingCollectionOrder>>
  >;
  preview: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};

export enum CommonContentLinkingCollectionsOfferingCollectionOrder {
  ApiIdentifierAsc = 'apiIdentifier_ASC',
  ApiIdentifierDesc = 'apiIdentifier_DESC',
  DescriptionAsc = 'description_ASC',
  DescriptionDesc = 'description_DESC',
  InternalNameAsc = 'internalName_ASC',
  InternalNameDesc = 'internalName_DESC',
  StripeProductIdAsc = 'stripeProductId_ASC',
  StripeProductIdDesc = 'stripeProductId_DESC',
  SysFirstPublishedAtAsc = 'sys_firstPublishedAt_ASC',
  SysFirstPublishedAtDesc = 'sys_firstPublishedAt_DESC',
  SysIdAsc = 'sys_id_ASC',
  SysIdDesc = 'sys_id_DESC',
  SysPublishedAtAsc = 'sys_publishedAt_ASC',
  SysPublishedAtDesc = 'sys_publishedAt_DESC',
  SysPublishedVersionAsc = 'sys_publishedVersion_ASC',
  SysPublishedVersionDesc = 'sys_publishedVersion_DESC',
}

export enum CommonContentOrder {
  CancellationUrlAsc = 'cancellationUrl_ASC',
  CancellationUrlDesc = 'cancellationUrl_DESC',
  EmailIconAsc = 'emailIcon_ASC',
  EmailIconDesc = 'emailIcon_DESC',
  InternalNameAsc = 'internalName_ASC',
  InternalNameDesc = 'internalName_DESC',
  NewsletterLabelTextCodeAsc = 'newsletterLabelTextCode_ASC',
  NewsletterLabelTextCodeDesc = 'newsletterLabelTextCode_DESC',
  PrivacyNoticeDownloadUrlAsc = 'privacyNoticeDownloadUrl_ASC',
  PrivacyNoticeDownloadUrlDesc = 'privacyNoticeDownloadUrl_DESC',
  PrivacyNoticeUrlAsc = 'privacyNoticeUrl_ASC',
  PrivacyNoticeUrlDesc = 'privacyNoticeUrl_DESC',
  SuccessActionButtonLabelAsc = 'successActionButtonLabel_ASC',
  SuccessActionButtonLabelDesc = 'successActionButtonLabel_DESC',
  SuccessActionButtonUrlAsc = 'successActionButtonUrl_ASC',
  SuccessActionButtonUrlDesc = 'successActionButtonUrl_DESC',
  SysFirstPublishedAtAsc = 'sys_firstPublishedAt_ASC',
  SysFirstPublishedAtDesc = 'sys_firstPublishedAt_DESC',
  SysIdAsc = 'sys_id_ASC',
  SysIdDesc = 'sys_id_DESC',
  SysPublishedAtAsc = 'sys_publishedAt_ASC',
  SysPublishedAtDesc = 'sys_publishedAt_DESC',
  SysPublishedVersionAsc = 'sys_publishedVersion_ASC',
  SysPublishedVersionDesc = 'sys_publishedVersion_DESC',
  TermsOfServiceDownloadUrlAsc = 'termsOfServiceDownloadUrl_ASC',
  TermsOfServiceDownloadUrlDesc = 'termsOfServiceDownloadUrl_DESC',
  TermsOfServiceUrlAsc = 'termsOfServiceUrl_ASC',
  TermsOfServiceUrlDesc = 'termsOfServiceUrl_DESC',
}

export type ContentfulMetadata = {
  __typename?: 'ContentfulMetadata';
  tags: Array<Maybe<ContentfulTag>>;
};

export type ContentfulMetadataFilter = {
  tags: InputMaybe<ContentfulMetadataTagsFilter>;
  tags_exists: InputMaybe<Scalars['Boolean']['input']>;
};

export type ContentfulMetadataTagsFilter = {
  id_contains_all: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_contains_none: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_contains_some: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

/**
 * Represents a tag entity for finding and organizing content easily.
 *     Find out more here: https://www.contentful.com/developers/docs/references/content-delivery-api/#/reference/content-tags
 */
export type ContentfulTag = {
  __typename?: 'ContentfulTag';
  id: Maybe<Scalars['String']['output']>;
  name: Maybe<Scalars['String']['output']>;
};

/** Additional Coupon configuration options that are not currently supported by Stripe. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/couponConfig) */
export type CouponConfig = Entry & {
  __typename?: 'CouponConfig';
  contentfulMetadata: ContentfulMetadata;
  countries: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  internalName: Maybe<Scalars['String']['output']>;
  linkedFrom: Maybe<CouponConfigLinkingCollections>;
  stripePromotionCodes: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  sys: Sys;
};

/** Additional Coupon configuration options that are not currently supported by Stripe. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/couponConfig) */
export type CouponConfigCountriesArgs = {
  locale: InputMaybe<Scalars['String']['input']>;
};

/** Additional Coupon configuration options that are not currently supported by Stripe. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/couponConfig) */
export type CouponConfigInternalNameArgs = {
  locale: InputMaybe<Scalars['String']['input']>;
};

/** Additional Coupon configuration options that are not currently supported by Stripe. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/couponConfig) */
export type CouponConfigLinkedFromArgs = {
  allowedLocales: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

/** Additional Coupon configuration options that are not currently supported by Stripe. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/couponConfig) */
export type CouponConfigStripePromotionCodesArgs = {
  locale: InputMaybe<Scalars['String']['input']>;
};

export type CouponConfigCollection = {
  __typename?: 'CouponConfigCollection';
  items: Array<Maybe<CouponConfig>>;
  limit: Scalars['Int']['output'];
  skip: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type CouponConfigFilter = {
  AND: InputMaybe<Array<InputMaybe<CouponConfigFilter>>>;
  OR: InputMaybe<Array<InputMaybe<CouponConfigFilter>>>;
  contentfulMetadata: InputMaybe<ContentfulMetadataFilter>;
  countries_contains_all: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  countries_contains_none: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  countries_contains_some: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  countries_exists: InputMaybe<Scalars['Boolean']['input']>;
  internalName: InputMaybe<Scalars['String']['input']>;
  internalName_contains: InputMaybe<Scalars['String']['input']>;
  internalName_exists: InputMaybe<Scalars['Boolean']['input']>;
  internalName_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  internalName_not: InputMaybe<Scalars['String']['input']>;
  internalName_not_contains: InputMaybe<Scalars['String']['input']>;
  internalName_not_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  stripePromotionCodes_contains_all: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  stripePromotionCodes_contains_none: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  stripePromotionCodes_contains_some: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  stripePromotionCodes_exists: InputMaybe<Scalars['Boolean']['input']>;
  sys: InputMaybe<SysFilter>;
};

export type CouponConfigLinkingCollections = {
  __typename?: 'CouponConfigLinkingCollections';
  entryCollection: Maybe<EntryCollection>;
  offeringCollection: Maybe<OfferingCollection>;
};

export type CouponConfigLinkingCollectionsEntryCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale: InputMaybe<Scalars['String']['input']>;
  preview: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};

export type CouponConfigLinkingCollectionsOfferingCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale: InputMaybe<Scalars['String']['input']>;
  order: InputMaybe<
    Array<InputMaybe<CouponConfigLinkingCollectionsOfferingCollectionOrder>>
  >;
  preview: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};

export enum CouponConfigLinkingCollectionsOfferingCollectionOrder {
  ApiIdentifierAsc = 'apiIdentifier_ASC',
  ApiIdentifierDesc = 'apiIdentifier_DESC',
  DescriptionAsc = 'description_ASC',
  DescriptionDesc = 'description_DESC',
  InternalNameAsc = 'internalName_ASC',
  InternalNameDesc = 'internalName_DESC',
  StripeProductIdAsc = 'stripeProductId_ASC',
  StripeProductIdDesc = 'stripeProductId_DESC',
  SysFirstPublishedAtAsc = 'sys_firstPublishedAt_ASC',
  SysFirstPublishedAtDesc = 'sys_firstPublishedAt_DESC',
  SysIdAsc = 'sys_id_ASC',
  SysIdDesc = 'sys_id_DESC',
  SysPublishedAtAsc = 'sys_publishedAt_ASC',
  SysPublishedAtDesc = 'sys_publishedAt_DESC',
  SysPublishedVersionAsc = 'sys_publishedVersion_ASC',
  SysPublishedVersionDesc = 'sys_publishedVersion_DESC',
}

export enum CouponConfigOrder {
  InternalNameAsc = 'internalName_ASC',
  InternalNameDesc = 'internalName_DESC',
  SysFirstPublishedAtAsc = 'sys_firstPublishedAt_ASC',
  SysFirstPublishedAtDesc = 'sys_firstPublishedAt_DESC',
  SysIdAsc = 'sys_id_ASC',
  SysIdDesc = 'sys_id_DESC',
  SysPublishedAtAsc = 'sys_publishedAt_ASC',
  SysPublishedAtDesc = 'sys_publishedAt_DESC',
  SysPublishedVersionAsc = 'sys_publishedVersion_ASC',
  SysPublishedVersionDesc = 'sys_publishedVersion_DESC',
}

export type Entry = {
  contentfulMetadata: ContentfulMetadata;
  sys: Sys;
};

export type EntryCollection = {
  __typename?: 'EntryCollection';
  items: Array<Maybe<Entry>>;
  limit: Scalars['Int']['output'];
  skip: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type EntryFilter = {
  AND: InputMaybe<Array<InputMaybe<EntryFilter>>>;
  OR: InputMaybe<Array<InputMaybe<EntryFilter>>>;
  contentfulMetadata: InputMaybe<ContentfulMetadataFilter>;
  sys: InputMaybe<SysFilter>;
};

export enum EntryOrder {
  SysFirstPublishedAtAsc = 'sys_firstPublishedAt_ASC',
  SysFirstPublishedAtDesc = 'sys_firstPublishedAt_DESC',
  SysIdAsc = 'sys_id_ASC',
  SysIdDesc = 'sys_id_DESC',
  SysPublishedAtAsc = 'sys_publishedAt_ASC',
  SysPublishedAtDesc = 'sys_publishedAt_DESC',
  SysPublishedVersionAsc = 'sys_publishedVersion_ASC',
  SysPublishedVersionDesc = 'sys_publishedVersion_DESC',
}

/** IAP configuration options required for IAP integrations. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/iap) */
export type Iap = Entry & {
  __typename?: 'Iap';
  appleProductIDs: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  contentfulMetadata: ContentfulMetadata;
  googleSkUs: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  internalName: Maybe<Scalars['String']['output']>;
  linkedFrom: Maybe<IapLinkingCollections>;
  sys: Sys;
};

/** IAP configuration options required for IAP integrations. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/iap) */
export type IapAppleProductIDsArgs = {
  locale: InputMaybe<Scalars['String']['input']>;
};

/** IAP configuration options required for IAP integrations. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/iap) */
export type IapGoogleSkUsArgs = {
  locale: InputMaybe<Scalars['String']['input']>;
};

/** IAP configuration options required for IAP integrations. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/iap) */
export type IapInternalNameArgs = {
  locale: InputMaybe<Scalars['String']['input']>;
};

/** IAP configuration options required for IAP integrations. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/iap) */
export type IapLinkedFromArgs = {
  allowedLocales: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type IapCollection = {
  __typename?: 'IapCollection';
  items: Array<Maybe<Iap>>;
  limit: Scalars['Int']['output'];
  skip: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type IapFilter = {
  AND: InputMaybe<Array<InputMaybe<IapFilter>>>;
  OR: InputMaybe<Array<InputMaybe<IapFilter>>>;
  appleProductIDs_contains_all: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  appleProductIDs_contains_none: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  appleProductIDs_contains_some: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  appleProductIDs_exists: InputMaybe<Scalars['Boolean']['input']>;
  contentfulMetadata: InputMaybe<ContentfulMetadataFilter>;
  googleSKUs_contains_all: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  googleSKUs_contains_none: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  googleSKUs_contains_some: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  googleSKUs_exists: InputMaybe<Scalars['Boolean']['input']>;
  internalName: InputMaybe<Scalars['String']['input']>;
  internalName_contains: InputMaybe<Scalars['String']['input']>;
  internalName_exists: InputMaybe<Scalars['Boolean']['input']>;
  internalName_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  internalName_not: InputMaybe<Scalars['String']['input']>;
  internalName_not_contains: InputMaybe<Scalars['String']['input']>;
  internalName_not_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  sys: InputMaybe<SysFilter>;
};

export type IapLinkingCollections = {
  __typename?: 'IapLinkingCollections';
  entryCollection: Maybe<EntryCollection>;
  offeringCollection: Maybe<OfferingCollection>;
};

export type IapLinkingCollectionsEntryCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale: InputMaybe<Scalars['String']['input']>;
  preview: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};

export type IapLinkingCollectionsOfferingCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale: InputMaybe<Scalars['String']['input']>;
  order: InputMaybe<
    Array<InputMaybe<IapLinkingCollectionsOfferingCollectionOrder>>
  >;
  preview: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};

export enum IapLinkingCollectionsOfferingCollectionOrder {
  ApiIdentifierAsc = 'apiIdentifier_ASC',
  ApiIdentifierDesc = 'apiIdentifier_DESC',
  DescriptionAsc = 'description_ASC',
  DescriptionDesc = 'description_DESC',
  InternalNameAsc = 'internalName_ASC',
  InternalNameDesc = 'internalName_DESC',
  StripeProductIdAsc = 'stripeProductId_ASC',
  StripeProductIdDesc = 'stripeProductId_DESC',
  SysFirstPublishedAtAsc = 'sys_firstPublishedAt_ASC',
  SysFirstPublishedAtDesc = 'sys_firstPublishedAt_DESC',
  SysIdAsc = 'sys_id_ASC',
  SysIdDesc = 'sys_id_DESC',
  SysPublishedAtAsc = 'sys_publishedAt_ASC',
  SysPublishedAtDesc = 'sys_publishedAt_DESC',
  SysPublishedVersionAsc = 'sys_publishedVersion_ASC',
  SysPublishedVersionDesc = 'sys_publishedVersion_DESC',
}

export enum IapOrder {
  InternalNameAsc = 'internalName_ASC',
  InternalNameDesc = 'internalName_DESC',
  SysFirstPublishedAtAsc = 'sys_firstPublishedAt_ASC',
  SysFirstPublishedAtDesc = 'sys_firstPublishedAt_DESC',
  SysIdAsc = 'sys_id_ASC',
  SysIdDesc = 'sys_id_DESC',
  SysPublishedAtAsc = 'sys_publishedAt_ASC',
  SysPublishedAtDesc = 'sys_publishedAt_DESC',
  SysPublishedVersionAsc = 'sys_publishedVersion_ASC',
  SysPublishedVersionDesc = 'sys_publishedVersion_DESC',
}

export enum ImageFormat {
  Avif = 'AVIF',
  /** JPG image format. */
  Jpg = 'JPG',
  /**
   * Progressive JPG format stores multiple passes of an image in progressively higher detail.
   *         When a progressive image is loading, the viewer will first see a lower quality pixelated version which
   *         will gradually improve in detail, until the image is fully downloaded. This is to display an image as
   *         early as possible to make the layout look as designed.
   */
  JpgProgressive = 'JPG_PROGRESSIVE',
  /** PNG image format */
  Png = 'PNG',
  /**
   * 8-bit PNG images support up to 256 colors and weigh less than the standard 24-bit PNG equivalent.
   *         The 8-bit PNG format is mostly used for simple images, such as icons or logos.
   */
  Png8 = 'PNG8',
  /** WebP image format. */
  Webp = 'WEBP',
}

export enum ImageResizeFocus {
  /** Focus the resizing on the bottom. */
  Bottom = 'BOTTOM',
  /** Focus the resizing on the bottom left. */
  BottomLeft = 'BOTTOM_LEFT',
  /** Focus the resizing on the bottom right. */
  BottomRight = 'BOTTOM_RIGHT',
  /** Focus the resizing on the center. */
  Center = 'CENTER',
  /** Focus the resizing on the largest face. */
  Face = 'FACE',
  /** Focus the resizing on the area containing all the faces. */
  Faces = 'FACES',
  /** Focus the resizing on the left. */
  Left = 'LEFT',
  /** Focus the resizing on the right. */
  Right = 'RIGHT',
  /** Focus the resizing on the top. */
  Top = 'TOP',
  /** Focus the resizing on the top left. */
  TopLeft = 'TOP_LEFT',
  /** Focus the resizing on the top right. */
  TopRight = 'TOP_RIGHT',
}

export enum ImageResizeStrategy {
  /** Crops a part of the original image to fit into the specified dimensions. */
  Crop = 'CROP',
  /** Resizes the image to the specified dimensions, cropping the image if needed. */
  Fill = 'FILL',
  /** Resizes the image to fit into the specified dimensions. */
  Fit = 'FIT',
  /**
   * Resizes the image to the specified dimensions, padding the image if needed.
   *         Uses desired background color as padding color.
   */
  Pad = 'PAD',
  /** Resizes the image to the specified dimensions, changing the original aspect ratio if needed. */
  Scale = 'SCALE',
  /** Creates a thumbnail from the image. */
  Thumb = 'THUMB',
}

export type ImageTransformOptions = {
  /**
   * Desired background color, used with corner radius or `PAD` resize strategy.
   *         Defaults to transparent (for `PNG`, `PNG8` and `WEBP`) or white (for `JPG` and `JPG_PROGRESSIVE`).
   */
  backgroundColor: InputMaybe<Scalars['HexColor']['input']>;
  /**
   * Desired corner radius in pixels.
   *         Results in an image with rounded corners (pass `-1` for a full circle/ellipse).
   *         Defaults to `0`. Uses desired background color as padding color,
   *         unless the format is `JPG` or `JPG_PROGRESSIVE` and resize strategy is `PAD`, then defaults to white.
   */
  cornerRadius: InputMaybe<Scalars['Int']['input']>;
  /** Desired image format. Defaults to the original image format. */
  format: InputMaybe<ImageFormat>;
  /** Desired height in pixels. Defaults to the original image height. */
  height: InputMaybe<Scalars['Dimension']['input']>;
  /**
   * Desired quality of the image in percents.
   *         Used for `PNG8`, `JPG`, `JPG_PROGRESSIVE` and `WEBP` formats.
   */
  quality: InputMaybe<Scalars['Quality']['input']>;
  /** Desired resize focus area. Defaults to `CENTER`. */
  resizeFocus: InputMaybe<ImageResizeFocus>;
  /** Desired resize strategy. Defaults to `FIT`. */
  resizeStrategy: InputMaybe<ImageResizeStrategy>;
  /** Desired width in pixels. Defaults to the original image width. */
  width: InputMaybe<Scalars['Dimension']['input']>;
};

/** Offering configuration. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/offering) */
export type Offering = Entry & {
  __typename?: 'Offering';
  apiIdentifier: Maybe<Scalars['String']['output']>;
  capabilitiesCollection: Maybe<OfferingCapabilitiesCollection>;
  commonContent: Maybe<CommonContent>;
  contentfulMetadata: ContentfulMetadata;
  countries: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  couponConfigCollection: Maybe<OfferingCouponConfigCollection>;
  defaultPurchase: Maybe<Purchase>;
  description: Maybe<Scalars['String']['output']>;
  experimentPurchaseCollection: Maybe<OfferingExperimentPurchaseCollection>;
  iapCollection: Maybe<OfferingIapCollection>;
  internalName: Maybe<Scalars['String']['output']>;
  linkedFrom: Maybe<OfferingLinkingCollections>;
  stripeLegacyPlans: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  stripeProductId: Maybe<Scalars['String']['output']>;
  sys: Sys;
};

/** Offering configuration. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/offering) */
export type OfferingApiIdentifierArgs = {
  locale: InputMaybe<Scalars['String']['input']>;
};

/** Offering configuration. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/offering) */
export type OfferingCapabilitiesCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale: InputMaybe<Scalars['String']['input']>;
  order: InputMaybe<Array<InputMaybe<OfferingCapabilitiesCollectionOrder>>>;
  preview: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where: InputMaybe<CapabilityFilter>;
};

/** Offering configuration. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/offering) */
export type OfferingCommonContentArgs = {
  locale: InputMaybe<Scalars['String']['input']>;
  preview: InputMaybe<Scalars['Boolean']['input']>;
  where: InputMaybe<CommonContentFilter>;
};

/** Offering configuration. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/offering) */
export type OfferingCountriesArgs = {
  locale: InputMaybe<Scalars['String']['input']>;
};

/** Offering configuration. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/offering) */
export type OfferingCouponConfigCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale: InputMaybe<Scalars['String']['input']>;
  order: InputMaybe<Array<InputMaybe<OfferingCouponConfigCollectionOrder>>>;
  preview: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where: InputMaybe<CouponConfigFilter>;
};

/** Offering configuration. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/offering) */
export type OfferingDefaultPurchaseArgs = {
  locale: InputMaybe<Scalars['String']['input']>;
  preview: InputMaybe<Scalars['Boolean']['input']>;
  where: InputMaybe<PurchaseFilter>;
};

/** Offering configuration. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/offering) */
export type OfferingDescriptionArgs = {
  locale: InputMaybe<Scalars['String']['input']>;
};

/** Offering configuration. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/offering) */
export type OfferingExperimentPurchaseCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale: InputMaybe<Scalars['String']['input']>;
  order: InputMaybe<
    Array<InputMaybe<OfferingExperimentPurchaseCollectionOrder>>
  >;
  preview: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where: InputMaybe<PurchaseFilter>;
};

/** Offering configuration. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/offering) */
export type OfferingIapCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale: InputMaybe<Scalars['String']['input']>;
  order: InputMaybe<Array<InputMaybe<OfferingIapCollectionOrder>>>;
  preview: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where: InputMaybe<IapFilter>;
};

/** Offering configuration. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/offering) */
export type OfferingInternalNameArgs = {
  locale: InputMaybe<Scalars['String']['input']>;
};

/** Offering configuration. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/offering) */
export type OfferingLinkedFromArgs = {
  allowedLocales: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

/** Offering configuration. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/offering) */
export type OfferingStripeLegacyPlansArgs = {
  locale: InputMaybe<Scalars['String']['input']>;
};

/** Offering configuration. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/offering) */
export type OfferingStripeProductIdArgs = {
  locale: InputMaybe<Scalars['String']['input']>;
};

export type OfferingCapabilitiesCollection = {
  __typename?: 'OfferingCapabilitiesCollection';
  items: Array<Maybe<Capability>>;
  limit: Scalars['Int']['output'];
  skip: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export enum OfferingCapabilitiesCollectionOrder {
  DescriptionAsc = 'description_ASC',
  DescriptionDesc = 'description_DESC',
  InternalNameAsc = 'internalName_ASC',
  InternalNameDesc = 'internalName_DESC',
  SlugAsc = 'slug_ASC',
  SlugDesc = 'slug_DESC',
  SysFirstPublishedAtAsc = 'sys_firstPublishedAt_ASC',
  SysFirstPublishedAtDesc = 'sys_firstPublishedAt_DESC',
  SysIdAsc = 'sys_id_ASC',
  SysIdDesc = 'sys_id_DESC',
  SysPublishedAtAsc = 'sys_publishedAt_ASC',
  SysPublishedAtDesc = 'sys_publishedAt_DESC',
  SysPublishedVersionAsc = 'sys_publishedVersion_ASC',
  SysPublishedVersionDesc = 'sys_publishedVersion_DESC',
}

export type OfferingCollection = {
  __typename?: 'OfferingCollection';
  items: Array<Maybe<Offering>>;
  limit: Scalars['Int']['output'];
  skip: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type OfferingCouponConfigCollection = {
  __typename?: 'OfferingCouponConfigCollection';
  items: Array<Maybe<CouponConfig>>;
  limit: Scalars['Int']['output'];
  skip: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export enum OfferingCouponConfigCollectionOrder {
  InternalNameAsc = 'internalName_ASC',
  InternalNameDesc = 'internalName_DESC',
  SysFirstPublishedAtAsc = 'sys_firstPublishedAt_ASC',
  SysFirstPublishedAtDesc = 'sys_firstPublishedAt_DESC',
  SysIdAsc = 'sys_id_ASC',
  SysIdDesc = 'sys_id_DESC',
  SysPublishedAtAsc = 'sys_publishedAt_ASC',
  SysPublishedAtDesc = 'sys_publishedAt_DESC',
  SysPublishedVersionAsc = 'sys_publishedVersion_ASC',
  SysPublishedVersionDesc = 'sys_publishedVersion_DESC',
}

export type OfferingExperimentPurchaseCollection = {
  __typename?: 'OfferingExperimentPurchaseCollection';
  items: Array<Maybe<Purchase>>;
  limit: Scalars['Int']['output'];
  skip: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export enum OfferingExperimentPurchaseCollectionOrder {
  DescriptionAsc = 'description_ASC',
  DescriptionDesc = 'description_DESC',
  InternalNameAsc = 'internalName_ASC',
  InternalNameDesc = 'internalName_DESC',
  SysFirstPublishedAtAsc = 'sys_firstPublishedAt_ASC',
  SysFirstPublishedAtDesc = 'sys_firstPublishedAt_DESC',
  SysIdAsc = 'sys_id_ASC',
  SysIdDesc = 'sys_id_DESC',
  SysPublishedAtAsc = 'sys_publishedAt_ASC',
  SysPublishedAtDesc = 'sys_publishedAt_DESC',
  SysPublishedVersionAsc = 'sys_publishedVersion_ASC',
  SysPublishedVersionDesc = 'sys_publishedVersion_DESC',
}

export type OfferingFilter = {
  AND: InputMaybe<Array<InputMaybe<OfferingFilter>>>;
  OR: InputMaybe<Array<InputMaybe<OfferingFilter>>>;
  apiIdentifier: InputMaybe<Scalars['String']['input']>;
  apiIdentifier_contains: InputMaybe<Scalars['String']['input']>;
  apiIdentifier_exists: InputMaybe<Scalars['Boolean']['input']>;
  apiIdentifier_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  apiIdentifier_not: InputMaybe<Scalars['String']['input']>;
  apiIdentifier_not_contains: InputMaybe<Scalars['String']['input']>;
  apiIdentifier_not_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  capabilities: InputMaybe<CfCapabilityNestedFilter>;
  capabilitiesCollection_exists: InputMaybe<Scalars['Boolean']['input']>;
  commonContent: InputMaybe<CfCommonContentNestedFilter>;
  commonContent_exists: InputMaybe<Scalars['Boolean']['input']>;
  contentfulMetadata: InputMaybe<ContentfulMetadataFilter>;
  countries_contains_all: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  countries_contains_none: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  countries_contains_some: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  countries_exists: InputMaybe<Scalars['Boolean']['input']>;
  couponConfig: InputMaybe<CfCouponConfigNestedFilter>;
  couponConfigCollection_exists: InputMaybe<Scalars['Boolean']['input']>;
  defaultPurchase: InputMaybe<CfPurchaseNestedFilter>;
  defaultPurchase_exists: InputMaybe<Scalars['Boolean']['input']>;
  description: InputMaybe<Scalars['String']['input']>;
  description_contains: InputMaybe<Scalars['String']['input']>;
  description_exists: InputMaybe<Scalars['Boolean']['input']>;
  description_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  description_not: InputMaybe<Scalars['String']['input']>;
  description_not_contains: InputMaybe<Scalars['String']['input']>;
  description_not_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  experimentPurchase: InputMaybe<CfPurchaseNestedFilter>;
  experimentPurchaseCollection_exists: InputMaybe<Scalars['Boolean']['input']>;
  iap: InputMaybe<CfIapNestedFilter>;
  iapCollection_exists: InputMaybe<Scalars['Boolean']['input']>;
  internalName: InputMaybe<Scalars['String']['input']>;
  internalName_contains: InputMaybe<Scalars['String']['input']>;
  internalName_exists: InputMaybe<Scalars['Boolean']['input']>;
  internalName_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  internalName_not: InputMaybe<Scalars['String']['input']>;
  internalName_not_contains: InputMaybe<Scalars['String']['input']>;
  internalName_not_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  stripeLegacyPlans_contains_all: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  stripeLegacyPlans_contains_none: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  stripeLegacyPlans_contains_some: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  stripeLegacyPlans_exists: InputMaybe<Scalars['Boolean']['input']>;
  stripeProductId: InputMaybe<Scalars['String']['input']>;
  stripeProductId_contains: InputMaybe<Scalars['String']['input']>;
  stripeProductId_exists: InputMaybe<Scalars['Boolean']['input']>;
  stripeProductId_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  stripeProductId_not: InputMaybe<Scalars['String']['input']>;
  stripeProductId_not_contains: InputMaybe<Scalars['String']['input']>;
  stripeProductId_not_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  sys: InputMaybe<SysFilter>;
};

export type OfferingIapCollection = {
  __typename?: 'OfferingIapCollection';
  items: Array<Maybe<Iap>>;
  limit: Scalars['Int']['output'];
  skip: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export enum OfferingIapCollectionOrder {
  InternalNameAsc = 'internalName_ASC',
  InternalNameDesc = 'internalName_DESC',
  SysFirstPublishedAtAsc = 'sys_firstPublishedAt_ASC',
  SysFirstPublishedAtDesc = 'sys_firstPublishedAt_DESC',
  SysIdAsc = 'sys_id_ASC',
  SysIdDesc = 'sys_id_DESC',
  SysPublishedAtAsc = 'sys_publishedAt_ASC',
  SysPublishedAtDesc = 'sys_publishedAt_DESC',
  SysPublishedVersionAsc = 'sys_publishedVersion_ASC',
  SysPublishedVersionDesc = 'sys_publishedVersion_DESC',
}

export type OfferingLinkingCollections = {
  __typename?: 'OfferingLinkingCollections';
  entryCollection: Maybe<EntryCollection>;
  purchaseCollection: Maybe<PurchaseCollection>;
  subGroupCollection: Maybe<SubGroupCollection>;
};

export type OfferingLinkingCollectionsEntryCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale: InputMaybe<Scalars['String']['input']>;
  preview: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};

export type OfferingLinkingCollectionsPurchaseCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale: InputMaybe<Scalars['String']['input']>;
  order: InputMaybe<
    Array<InputMaybe<OfferingLinkingCollectionsPurchaseCollectionOrder>>
  >;
  preview: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};

export type OfferingLinkingCollectionsSubGroupCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale: InputMaybe<Scalars['String']['input']>;
  order: InputMaybe<
    Array<InputMaybe<OfferingLinkingCollectionsSubGroupCollectionOrder>>
  >;
  preview: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};

export enum OfferingLinkingCollectionsPurchaseCollectionOrder {
  DescriptionAsc = 'description_ASC',
  DescriptionDesc = 'description_DESC',
  InternalNameAsc = 'internalName_ASC',
  InternalNameDesc = 'internalName_DESC',
  SysFirstPublishedAtAsc = 'sys_firstPublishedAt_ASC',
  SysFirstPublishedAtDesc = 'sys_firstPublishedAt_DESC',
  SysIdAsc = 'sys_id_ASC',
  SysIdDesc = 'sys_id_DESC',
  SysPublishedAtAsc = 'sys_publishedAt_ASC',
  SysPublishedAtDesc = 'sys_publishedAt_DESC',
  SysPublishedVersionAsc = 'sys_publishedVersion_ASC',
  SysPublishedVersionDesc = 'sys_publishedVersion_DESC',
}

export enum OfferingLinkingCollectionsSubGroupCollectionOrder {
  GroupNameAsc = 'groupName_ASC',
  GroupNameDesc = 'groupName_DESC',
  InternalNameAsc = 'internalName_ASC',
  InternalNameDesc = 'internalName_DESC',
  SysFirstPublishedAtAsc = 'sys_firstPublishedAt_ASC',
  SysFirstPublishedAtDesc = 'sys_firstPublishedAt_DESC',
  SysIdAsc = 'sys_id_ASC',
  SysIdDesc = 'sys_id_DESC',
  SysPublishedAtAsc = 'sys_publishedAt_ASC',
  SysPublishedAtDesc = 'sys_publishedAt_DESC',
  SysPublishedVersionAsc = 'sys_publishedVersion_ASC',
  SysPublishedVersionDesc = 'sys_publishedVersion_DESC',
}

export enum OfferingOrder {
  ApiIdentifierAsc = 'apiIdentifier_ASC',
  ApiIdentifierDesc = 'apiIdentifier_DESC',
  DescriptionAsc = 'description_ASC',
  DescriptionDesc = 'description_DESC',
  InternalNameAsc = 'internalName_ASC',
  InternalNameDesc = 'internalName_DESC',
  StripeProductIdAsc = 'stripeProductId_ASC',
  StripeProductIdDesc = 'stripeProductId_DESC',
  SysFirstPublishedAtAsc = 'sys_firstPublishedAt_ASC',
  SysFirstPublishedAtDesc = 'sys_firstPublishedAt_DESC',
  SysIdAsc = 'sys_id_ASC',
  SysIdDesc = 'sys_id_DESC',
  SysPublishedAtAsc = 'sys_publishedAt_ASC',
  SysPublishedAtDesc = 'sys_publishedAt_DESC',
  SysPublishedVersionAsc = 'sys_publishedVersion_ASC',
  SysPublishedVersionDesc = 'sys_publishedVersion_DESC',
}

/** Purchase flow related configuration options. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/purchase) */
export type Purchase = Entry & {
  __typename?: 'Purchase';
  contentfulMetadata: ContentfulMetadata;
  description: Maybe<Scalars['String']['output']>;
  internalName: Maybe<Scalars['String']['output']>;
  linkedFrom: Maybe<PurchaseLinkingCollections>;
  offering: Maybe<Offering>;
  purchaseDetails: Maybe<PurchaseDetails>;
  stripePlanChoices: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  sys: Sys;
};

/** Purchase flow related configuration options. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/purchase) */
export type PurchaseDescriptionArgs = {
  locale: InputMaybe<Scalars['String']['input']>;
};

/** Purchase flow related configuration options. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/purchase) */
export type PurchaseInternalNameArgs = {
  locale: InputMaybe<Scalars['String']['input']>;
};

/** Purchase flow related configuration options. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/purchase) */
export type PurchaseLinkedFromArgs = {
  allowedLocales: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

/** Purchase flow related configuration options. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/purchase) */
export type PurchaseOfferingArgs = {
  locale: InputMaybe<Scalars['String']['input']>;
  preview: InputMaybe<Scalars['Boolean']['input']>;
  where: InputMaybe<OfferingFilter>;
};

/** Purchase flow related configuration options. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/purchase) */
export type PurchasePurchaseDetailsArgs = {
  locale: InputMaybe<Scalars['String']['input']>;
  preview: InputMaybe<Scalars['Boolean']['input']>;
  where: InputMaybe<PurchaseDetailsFilter>;
};

/** Purchase flow related configuration options. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/purchase) */
export type PurchaseStripePlanChoicesArgs = {
  locale: InputMaybe<Scalars['String']['input']>;
};

export type PurchaseCollection = {
  __typename?: 'PurchaseCollection';
  items: Array<Maybe<Purchase>>;
  limit: Scalars['Int']['output'];
  skip: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

/** Available Purchase details component configuration options. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/purchaseDetails) */
export type PurchaseDetails = Entry & {
  __typename?: 'PurchaseDetails';
  contentfulMetadata: ContentfulMetadata;
  details: Maybe<Scalars['String']['output']>;
  internalName: Maybe<Scalars['String']['output']>;
  linkedFrom: Maybe<PurchaseDetailsLinkingCollections>;
  productName: Maybe<Scalars['String']['output']>;
  subtitle: Maybe<Scalars['String']['output']>;
  sys: Sys;
  webIcon: Maybe<Scalars['String']['output']>;
};

/** Available Purchase details component configuration options. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/purchaseDetails) */
export type PurchaseDetailsDetailsArgs = {
  locale: InputMaybe<Scalars['String']['input']>;
};

/** Available Purchase details component configuration options. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/purchaseDetails) */
export type PurchaseDetailsInternalNameArgs = {
  locale: InputMaybe<Scalars['String']['input']>;
};

/** Available Purchase details component configuration options. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/purchaseDetails) */
export type PurchaseDetailsLinkedFromArgs = {
  allowedLocales: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

/** Available Purchase details component configuration options. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/purchaseDetails) */
export type PurchaseDetailsProductNameArgs = {
  locale: InputMaybe<Scalars['String']['input']>;
};

/** Available Purchase details component configuration options. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/purchaseDetails) */
export type PurchaseDetailsSubtitleArgs = {
  locale: InputMaybe<Scalars['String']['input']>;
};

/** Available Purchase details component configuration options. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/purchaseDetails) */
export type PurchaseDetailsWebIconArgs = {
  locale: InputMaybe<Scalars['String']['input']>;
};

export type PurchaseDetailsCollection = {
  __typename?: 'PurchaseDetailsCollection';
  items: Array<Maybe<PurchaseDetails>>;
  limit: Scalars['Int']['output'];
  skip: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type PurchaseDetailsFilter = {
  AND: InputMaybe<Array<InputMaybe<PurchaseDetailsFilter>>>;
  OR: InputMaybe<Array<InputMaybe<PurchaseDetailsFilter>>>;
  contentfulMetadata: InputMaybe<ContentfulMetadataFilter>;
  details: InputMaybe<Scalars['String']['input']>;
  details_contains: InputMaybe<Scalars['String']['input']>;
  details_exists: InputMaybe<Scalars['Boolean']['input']>;
  details_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  details_not: InputMaybe<Scalars['String']['input']>;
  details_not_contains: InputMaybe<Scalars['String']['input']>;
  details_not_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  internalName: InputMaybe<Scalars['String']['input']>;
  internalName_contains: InputMaybe<Scalars['String']['input']>;
  internalName_exists: InputMaybe<Scalars['Boolean']['input']>;
  internalName_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  internalName_not: InputMaybe<Scalars['String']['input']>;
  internalName_not_contains: InputMaybe<Scalars['String']['input']>;
  internalName_not_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  productName: InputMaybe<Scalars['String']['input']>;
  productName_contains: InputMaybe<Scalars['String']['input']>;
  productName_exists: InputMaybe<Scalars['Boolean']['input']>;
  productName_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  productName_not: InputMaybe<Scalars['String']['input']>;
  productName_not_contains: InputMaybe<Scalars['String']['input']>;
  productName_not_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  subtitle: InputMaybe<Scalars['String']['input']>;
  subtitle_contains: InputMaybe<Scalars['String']['input']>;
  subtitle_exists: InputMaybe<Scalars['Boolean']['input']>;
  subtitle_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  subtitle_not: InputMaybe<Scalars['String']['input']>;
  subtitle_not_contains: InputMaybe<Scalars['String']['input']>;
  subtitle_not_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  sys: InputMaybe<SysFilter>;
  webIcon: InputMaybe<Scalars['String']['input']>;
  webIcon_contains: InputMaybe<Scalars['String']['input']>;
  webIcon_exists: InputMaybe<Scalars['Boolean']['input']>;
  webIcon_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  webIcon_not: InputMaybe<Scalars['String']['input']>;
  webIcon_not_contains: InputMaybe<Scalars['String']['input']>;
  webIcon_not_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type PurchaseDetailsLinkingCollections = {
  __typename?: 'PurchaseDetailsLinkingCollections';
  entryCollection: Maybe<EntryCollection>;
  purchaseCollection: Maybe<PurchaseCollection>;
};

export type PurchaseDetailsLinkingCollectionsEntryCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale: InputMaybe<Scalars['String']['input']>;
  preview: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};

export type PurchaseDetailsLinkingCollectionsPurchaseCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale: InputMaybe<Scalars['String']['input']>;
  order: InputMaybe<
    Array<InputMaybe<PurchaseDetailsLinkingCollectionsPurchaseCollectionOrder>>
  >;
  preview: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};

export enum PurchaseDetailsLinkingCollectionsPurchaseCollectionOrder {
  DescriptionAsc = 'description_ASC',
  DescriptionDesc = 'description_DESC',
  InternalNameAsc = 'internalName_ASC',
  InternalNameDesc = 'internalName_DESC',
  SysFirstPublishedAtAsc = 'sys_firstPublishedAt_ASC',
  SysFirstPublishedAtDesc = 'sys_firstPublishedAt_DESC',
  SysIdAsc = 'sys_id_ASC',
  SysIdDesc = 'sys_id_DESC',
  SysPublishedAtAsc = 'sys_publishedAt_ASC',
  SysPublishedAtDesc = 'sys_publishedAt_DESC',
  SysPublishedVersionAsc = 'sys_publishedVersion_ASC',
  SysPublishedVersionDesc = 'sys_publishedVersion_DESC',
}

export enum PurchaseDetailsOrder {
  InternalNameAsc = 'internalName_ASC',
  InternalNameDesc = 'internalName_DESC',
  ProductNameAsc = 'productName_ASC',
  ProductNameDesc = 'productName_DESC',
  SubtitleAsc = 'subtitle_ASC',
  SubtitleDesc = 'subtitle_DESC',
  SysFirstPublishedAtAsc = 'sys_firstPublishedAt_ASC',
  SysFirstPublishedAtDesc = 'sys_firstPublishedAt_DESC',
  SysIdAsc = 'sys_id_ASC',
  SysIdDesc = 'sys_id_DESC',
  SysPublishedAtAsc = 'sys_publishedAt_ASC',
  SysPublishedAtDesc = 'sys_publishedAt_DESC',
  SysPublishedVersionAsc = 'sys_publishedVersion_ASC',
  SysPublishedVersionDesc = 'sys_publishedVersion_DESC',
  WebIconAsc = 'webIcon_ASC',
  WebIconDesc = 'webIcon_DESC',
}

export type PurchaseFilter = {
  AND: InputMaybe<Array<InputMaybe<PurchaseFilter>>>;
  OR: InputMaybe<Array<InputMaybe<PurchaseFilter>>>;
  contentfulMetadata: InputMaybe<ContentfulMetadataFilter>;
  description: InputMaybe<Scalars['String']['input']>;
  description_contains: InputMaybe<Scalars['String']['input']>;
  description_exists: InputMaybe<Scalars['Boolean']['input']>;
  description_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  description_not: InputMaybe<Scalars['String']['input']>;
  description_not_contains: InputMaybe<Scalars['String']['input']>;
  description_not_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  internalName: InputMaybe<Scalars['String']['input']>;
  internalName_contains: InputMaybe<Scalars['String']['input']>;
  internalName_exists: InputMaybe<Scalars['Boolean']['input']>;
  internalName_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  internalName_not: InputMaybe<Scalars['String']['input']>;
  internalName_not_contains: InputMaybe<Scalars['String']['input']>;
  internalName_not_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  offering: InputMaybe<CfOfferingNestedFilter>;
  offering_exists: InputMaybe<Scalars['Boolean']['input']>;
  purchaseDetails: InputMaybe<CfPurchaseDetailsNestedFilter>;
  purchaseDetails_exists: InputMaybe<Scalars['Boolean']['input']>;
  stripePlanChoices_contains_all: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  stripePlanChoices_contains_none: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  stripePlanChoices_contains_some: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  stripePlanChoices_exists: InputMaybe<Scalars['Boolean']['input']>;
  sys: InputMaybe<SysFilter>;
};

export type PurchaseLinkingCollections = {
  __typename?: 'PurchaseLinkingCollections';
  entryCollection: Maybe<EntryCollection>;
  offeringCollection: Maybe<OfferingCollection>;
};

export type PurchaseLinkingCollectionsEntryCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale: InputMaybe<Scalars['String']['input']>;
  preview: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};

export type PurchaseLinkingCollectionsOfferingCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale: InputMaybe<Scalars['String']['input']>;
  order: InputMaybe<
    Array<InputMaybe<PurchaseLinkingCollectionsOfferingCollectionOrder>>
  >;
  preview: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};

export enum PurchaseLinkingCollectionsOfferingCollectionOrder {
  ApiIdentifierAsc = 'apiIdentifier_ASC',
  ApiIdentifierDesc = 'apiIdentifier_DESC',
  DescriptionAsc = 'description_ASC',
  DescriptionDesc = 'description_DESC',
  InternalNameAsc = 'internalName_ASC',
  InternalNameDesc = 'internalName_DESC',
  StripeProductIdAsc = 'stripeProductId_ASC',
  StripeProductIdDesc = 'stripeProductId_DESC',
  SysFirstPublishedAtAsc = 'sys_firstPublishedAt_ASC',
  SysFirstPublishedAtDesc = 'sys_firstPublishedAt_DESC',
  SysIdAsc = 'sys_id_ASC',
  SysIdDesc = 'sys_id_DESC',
  SysPublishedAtAsc = 'sys_publishedAt_ASC',
  SysPublishedAtDesc = 'sys_publishedAt_DESC',
  SysPublishedVersionAsc = 'sys_publishedVersion_ASC',
  SysPublishedVersionDesc = 'sys_publishedVersion_DESC',
}

export enum PurchaseOrder {
  DescriptionAsc = 'description_ASC',
  DescriptionDesc = 'description_DESC',
  InternalNameAsc = 'internalName_ASC',
  InternalNameDesc = 'internalName_DESC',
  SysFirstPublishedAtAsc = 'sys_firstPublishedAt_ASC',
  SysFirstPublishedAtDesc = 'sys_firstPublishedAt_DESC',
  SysIdAsc = 'sys_id_ASC',
  SysIdDesc = 'sys_id_DESC',
  SysPublishedAtAsc = 'sys_publishedAt_ASC',
  SysPublishedAtDesc = 'sys_publishedAt_DESC',
  SysPublishedVersionAsc = 'sys_publishedVersion_ASC',
  SysPublishedVersionDesc = 'sys_publishedVersion_DESC',
}

export type Query = {
  __typename?: 'Query';
  _node: Maybe<_Node>;
  asset: Maybe<Asset>;
  assetCollection: Maybe<AssetCollection>;
  capability: Maybe<Capability>;
  capabilityCollection: Maybe<CapabilityCollection>;
  commonContent: Maybe<CommonContent>;
  commonContentCollection: Maybe<CommonContentCollection>;
  couponConfig: Maybe<CouponConfig>;
  couponConfigCollection: Maybe<CouponConfigCollection>;
  entryCollection: Maybe<EntryCollection>;
  iap: Maybe<Iap>;
  iapCollection: Maybe<IapCollection>;
  offering: Maybe<Offering>;
  offeringCollection: Maybe<OfferingCollection>;
  purchase: Maybe<Purchase>;
  purchaseCollection: Maybe<PurchaseCollection>;
  purchaseDetails: Maybe<PurchaseDetails>;
  purchaseDetailsCollection: Maybe<PurchaseDetailsCollection>;
  service: Maybe<Service>;
  serviceCollection: Maybe<ServiceCollection>;
  subGroup: Maybe<SubGroup>;
  subGroupCollection: Maybe<SubGroupCollection>;
};

export type Query_NodeArgs = {
  id: Scalars['ID']['input'];
  locale: InputMaybe<Scalars['String']['input']>;
  preview: InputMaybe<Scalars['Boolean']['input']>;
};

export type QueryAssetArgs = {
  id: Scalars['String']['input'];
  locale: InputMaybe<Scalars['String']['input']>;
  preview: InputMaybe<Scalars['Boolean']['input']>;
};

export type QueryAssetCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale: InputMaybe<Scalars['String']['input']>;
  order: InputMaybe<Array<InputMaybe<AssetOrder>>>;
  preview: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where: InputMaybe<AssetFilter>;
};

export type QueryCapabilityArgs = {
  id: Scalars['String']['input'];
  locale: InputMaybe<Scalars['String']['input']>;
  preview: InputMaybe<Scalars['Boolean']['input']>;
};

export type QueryCapabilityCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale: InputMaybe<Scalars['String']['input']>;
  order: InputMaybe<Array<InputMaybe<CapabilityOrder>>>;
  preview: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where: InputMaybe<CapabilityFilter>;
};

export type QueryCommonContentArgs = {
  id: Scalars['String']['input'];
  locale: InputMaybe<Scalars['String']['input']>;
  preview: InputMaybe<Scalars['Boolean']['input']>;
};

export type QueryCommonContentCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale: InputMaybe<Scalars['String']['input']>;
  order: InputMaybe<Array<InputMaybe<CommonContentOrder>>>;
  preview: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where: InputMaybe<CommonContentFilter>;
};

export type QueryCouponConfigArgs = {
  id: Scalars['String']['input'];
  locale: InputMaybe<Scalars['String']['input']>;
  preview: InputMaybe<Scalars['Boolean']['input']>;
};

export type QueryCouponConfigCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale: InputMaybe<Scalars['String']['input']>;
  order: InputMaybe<Array<InputMaybe<CouponConfigOrder>>>;
  preview: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where: InputMaybe<CouponConfigFilter>;
};

export type QueryEntryCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale: InputMaybe<Scalars['String']['input']>;
  order: InputMaybe<Array<InputMaybe<EntryOrder>>>;
  preview: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where: InputMaybe<EntryFilter>;
};

export type QueryIapArgs = {
  id: Scalars['String']['input'];
  locale: InputMaybe<Scalars['String']['input']>;
  preview: InputMaybe<Scalars['Boolean']['input']>;
};

export type QueryIapCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale: InputMaybe<Scalars['String']['input']>;
  order: InputMaybe<Array<InputMaybe<IapOrder>>>;
  preview: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where: InputMaybe<IapFilter>;
};

export type QueryOfferingArgs = {
  id: Scalars['String']['input'];
  locale: InputMaybe<Scalars['String']['input']>;
  preview: InputMaybe<Scalars['Boolean']['input']>;
};

export type QueryOfferingCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale: InputMaybe<Scalars['String']['input']>;
  order: InputMaybe<Array<InputMaybe<OfferingOrder>>>;
  preview: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where: InputMaybe<OfferingFilter>;
};

export type QueryPurchaseArgs = {
  id: Scalars['String']['input'];
  locale: InputMaybe<Scalars['String']['input']>;
  preview: InputMaybe<Scalars['Boolean']['input']>;
};

export type QueryPurchaseCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale: InputMaybe<Scalars['String']['input']>;
  order: InputMaybe<Array<InputMaybe<PurchaseOrder>>>;
  preview: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where: InputMaybe<PurchaseFilter>;
};

export type QueryPurchaseDetailsArgs = {
  id: Scalars['String']['input'];
  locale: InputMaybe<Scalars['String']['input']>;
  preview: InputMaybe<Scalars['Boolean']['input']>;
};

export type QueryPurchaseDetailsCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale: InputMaybe<Scalars['String']['input']>;
  order: InputMaybe<Array<InputMaybe<PurchaseDetailsOrder>>>;
  preview: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where: InputMaybe<PurchaseDetailsFilter>;
};

export type QueryServiceArgs = {
  id: Scalars['String']['input'];
  locale: InputMaybe<Scalars['String']['input']>;
  preview: InputMaybe<Scalars['Boolean']['input']>;
};

export type QueryServiceCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale: InputMaybe<Scalars['String']['input']>;
  order: InputMaybe<Array<InputMaybe<ServiceOrder>>>;
  preview: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where: InputMaybe<ServiceFilter>;
};

export type QuerySubGroupArgs = {
  id: Scalars['String']['input'];
  locale: InputMaybe<Scalars['String']['input']>;
  preview: InputMaybe<Scalars['Boolean']['input']>;
};

export type QuerySubGroupCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale: InputMaybe<Scalars['String']['input']>;
  order: InputMaybe<Array<InputMaybe<SubGroupOrder>>>;
  preview: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where: InputMaybe<SubGroupFilter>;
};

/** Mapping of services to relevant OAuth configuration and capabilities. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/service) */
export type Service = Entry & {
  __typename?: 'Service';
  capabilitiesCollection: Maybe<ServiceCapabilitiesCollection>;
  contentfulMetadata: ContentfulMetadata;
  description: Maybe<Scalars['String']['output']>;
  internalName: Maybe<Scalars['String']['output']>;
  linkedFrom: Maybe<ServiceLinkingCollections>;
  oauthClientId: Maybe<Scalars['String']['output']>;
  sys: Sys;
};

/** Mapping of services to relevant OAuth configuration and capabilities. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/service) */
export type ServiceCapabilitiesCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale: InputMaybe<Scalars['String']['input']>;
  order: InputMaybe<Array<InputMaybe<ServiceCapabilitiesCollectionOrder>>>;
  preview: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where: InputMaybe<CapabilityFilter>;
};

/** Mapping of services to relevant OAuth configuration and capabilities. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/service) */
export type ServiceDescriptionArgs = {
  locale: InputMaybe<Scalars['String']['input']>;
};

/** Mapping of services to relevant OAuth configuration and capabilities. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/service) */
export type ServiceInternalNameArgs = {
  locale: InputMaybe<Scalars['String']['input']>;
};

/** Mapping of services to relevant OAuth configuration and capabilities. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/service) */
export type ServiceLinkedFromArgs = {
  allowedLocales: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

/** Mapping of services to relevant OAuth configuration and capabilities. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/service) */
export type ServiceOauthClientIdArgs = {
  locale: InputMaybe<Scalars['String']['input']>;
};

export type ServiceCapabilitiesCollection = {
  __typename?: 'ServiceCapabilitiesCollection';
  items: Array<Maybe<Capability>>;
  limit: Scalars['Int']['output'];
  skip: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export enum ServiceCapabilitiesCollectionOrder {
  DescriptionAsc = 'description_ASC',
  DescriptionDesc = 'description_DESC',
  InternalNameAsc = 'internalName_ASC',
  InternalNameDesc = 'internalName_DESC',
  SlugAsc = 'slug_ASC',
  SlugDesc = 'slug_DESC',
  SysFirstPublishedAtAsc = 'sys_firstPublishedAt_ASC',
  SysFirstPublishedAtDesc = 'sys_firstPublishedAt_DESC',
  SysIdAsc = 'sys_id_ASC',
  SysIdDesc = 'sys_id_DESC',
  SysPublishedAtAsc = 'sys_publishedAt_ASC',
  SysPublishedAtDesc = 'sys_publishedAt_DESC',
  SysPublishedVersionAsc = 'sys_publishedVersion_ASC',
  SysPublishedVersionDesc = 'sys_publishedVersion_DESC',
}

export type ServiceCollection = {
  __typename?: 'ServiceCollection';
  items: Array<Maybe<Service>>;
  limit: Scalars['Int']['output'];
  skip: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type ServiceFilter = {
  AND: InputMaybe<Array<InputMaybe<ServiceFilter>>>;
  OR: InputMaybe<Array<InputMaybe<ServiceFilter>>>;
  capabilities: InputMaybe<CfCapabilityNestedFilter>;
  capabilitiesCollection_exists: InputMaybe<Scalars['Boolean']['input']>;
  contentfulMetadata: InputMaybe<ContentfulMetadataFilter>;
  description: InputMaybe<Scalars['String']['input']>;
  description_contains: InputMaybe<Scalars['String']['input']>;
  description_exists: InputMaybe<Scalars['Boolean']['input']>;
  description_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  description_not: InputMaybe<Scalars['String']['input']>;
  description_not_contains: InputMaybe<Scalars['String']['input']>;
  description_not_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  internalName: InputMaybe<Scalars['String']['input']>;
  internalName_contains: InputMaybe<Scalars['String']['input']>;
  internalName_exists: InputMaybe<Scalars['Boolean']['input']>;
  internalName_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  internalName_not: InputMaybe<Scalars['String']['input']>;
  internalName_not_contains: InputMaybe<Scalars['String']['input']>;
  internalName_not_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  oauthClientId: InputMaybe<Scalars['String']['input']>;
  oauthClientId_contains: InputMaybe<Scalars['String']['input']>;
  oauthClientId_exists: InputMaybe<Scalars['Boolean']['input']>;
  oauthClientId_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  oauthClientId_not: InputMaybe<Scalars['String']['input']>;
  oauthClientId_not_contains: InputMaybe<Scalars['String']['input']>;
  oauthClientId_not_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  sys: InputMaybe<SysFilter>;
};

export type ServiceLinkingCollections = {
  __typename?: 'ServiceLinkingCollections';
  capabilityCollection: Maybe<CapabilityCollection>;
  entryCollection: Maybe<EntryCollection>;
};

export type ServiceLinkingCollectionsCapabilityCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale: InputMaybe<Scalars['String']['input']>;
  order: InputMaybe<
    Array<InputMaybe<ServiceLinkingCollectionsCapabilityCollectionOrder>>
  >;
  preview: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};

export type ServiceLinkingCollectionsEntryCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale: InputMaybe<Scalars['String']['input']>;
  preview: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};

export enum ServiceLinkingCollectionsCapabilityCollectionOrder {
  DescriptionAsc = 'description_ASC',
  DescriptionDesc = 'description_DESC',
  InternalNameAsc = 'internalName_ASC',
  InternalNameDesc = 'internalName_DESC',
  SlugAsc = 'slug_ASC',
  SlugDesc = 'slug_DESC',
  SysFirstPublishedAtAsc = 'sys_firstPublishedAt_ASC',
  SysFirstPublishedAtDesc = 'sys_firstPublishedAt_DESC',
  SysIdAsc = 'sys_id_ASC',
  SysIdDesc = 'sys_id_DESC',
  SysPublishedAtAsc = 'sys_publishedAt_ASC',
  SysPublishedAtDesc = 'sys_publishedAt_DESC',
  SysPublishedVersionAsc = 'sys_publishedVersion_ASC',
  SysPublishedVersionDesc = 'sys_publishedVersion_DESC',
}

export enum ServiceOrder {
  DescriptionAsc = 'description_ASC',
  DescriptionDesc = 'description_DESC',
  InternalNameAsc = 'internalName_ASC',
  InternalNameDesc = 'internalName_DESC',
  OauthClientIdAsc = 'oauthClientId_ASC',
  OauthClientIdDesc = 'oauthClientId_DESC',
  SysFirstPublishedAtAsc = 'sys_firstPublishedAt_ASC',
  SysFirstPublishedAtDesc = 'sys_firstPublishedAt_DESC',
  SysIdAsc = 'sys_id_ASC',
  SysIdDesc = 'sys_id_DESC',
  SysPublishedAtAsc = 'sys_publishedAt_ASC',
  SysPublishedAtDesc = 'sys_publishedAt_DESC',
  SysPublishedVersionAsc = 'sys_publishedVersion_ASC',
  SysPublishedVersionDesc = 'sys_publishedVersion_DESC',
}

/** Subscription Group configuration. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/subGroup) */
export type SubGroup = Entry & {
  __typename?: 'SubGroup';
  contentfulMetadata: ContentfulMetadata;
  groupName: Maybe<Scalars['String']['output']>;
  internalName: Maybe<Scalars['String']['output']>;
  linkedFrom: Maybe<SubGroupLinkingCollections>;
  offeringCollection: Maybe<SubGroupOfferingCollection>;
  sys: Sys;
};

/** Subscription Group configuration. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/subGroup) */
export type SubGroupGroupNameArgs = {
  locale: InputMaybe<Scalars['String']['input']>;
};

/** Subscription Group configuration. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/subGroup) */
export type SubGroupInternalNameArgs = {
  locale: InputMaybe<Scalars['String']['input']>;
};

/** Subscription Group configuration. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/subGroup) */
export type SubGroupLinkedFromArgs = {
  allowedLocales: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

/** Subscription Group configuration. [See type definition](https://app.contentful.com/spaces/l7gqxxg5i1gg/content_types/subGroup) */
export type SubGroupOfferingCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale: InputMaybe<Scalars['String']['input']>;
  order: InputMaybe<Array<InputMaybe<SubGroupOfferingCollectionOrder>>>;
  preview: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where: InputMaybe<OfferingFilter>;
};

export type SubGroupCollection = {
  __typename?: 'SubGroupCollection';
  items: Array<Maybe<SubGroup>>;
  limit: Scalars['Int']['output'];
  skip: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type SubGroupFilter = {
  AND: InputMaybe<Array<InputMaybe<SubGroupFilter>>>;
  OR: InputMaybe<Array<InputMaybe<SubGroupFilter>>>;
  contentfulMetadata: InputMaybe<ContentfulMetadataFilter>;
  groupName: InputMaybe<Scalars['String']['input']>;
  groupName_contains: InputMaybe<Scalars['String']['input']>;
  groupName_exists: InputMaybe<Scalars['Boolean']['input']>;
  groupName_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  groupName_not: InputMaybe<Scalars['String']['input']>;
  groupName_not_contains: InputMaybe<Scalars['String']['input']>;
  groupName_not_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  internalName: InputMaybe<Scalars['String']['input']>;
  internalName_contains: InputMaybe<Scalars['String']['input']>;
  internalName_exists: InputMaybe<Scalars['Boolean']['input']>;
  internalName_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  internalName_not: InputMaybe<Scalars['String']['input']>;
  internalName_not_contains: InputMaybe<Scalars['String']['input']>;
  internalName_not_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  offering: InputMaybe<CfOfferingNestedFilter>;
  offeringCollection_exists: InputMaybe<Scalars['Boolean']['input']>;
  sys: InputMaybe<SysFilter>;
};

export type SubGroupLinkingCollections = {
  __typename?: 'SubGroupLinkingCollections';
  entryCollection: Maybe<EntryCollection>;
};

export type SubGroupLinkingCollectionsEntryCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale: InputMaybe<Scalars['String']['input']>;
  preview: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};

export type SubGroupOfferingCollection = {
  __typename?: 'SubGroupOfferingCollection';
  items: Array<Maybe<Offering>>;
  limit: Scalars['Int']['output'];
  skip: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export enum SubGroupOfferingCollectionOrder {
  ApiIdentifierAsc = 'apiIdentifier_ASC',
  ApiIdentifierDesc = 'apiIdentifier_DESC',
  DescriptionAsc = 'description_ASC',
  DescriptionDesc = 'description_DESC',
  InternalNameAsc = 'internalName_ASC',
  InternalNameDesc = 'internalName_DESC',
  StripeProductIdAsc = 'stripeProductId_ASC',
  StripeProductIdDesc = 'stripeProductId_DESC',
  SysFirstPublishedAtAsc = 'sys_firstPublishedAt_ASC',
  SysFirstPublishedAtDesc = 'sys_firstPublishedAt_DESC',
  SysIdAsc = 'sys_id_ASC',
  SysIdDesc = 'sys_id_DESC',
  SysPublishedAtAsc = 'sys_publishedAt_ASC',
  SysPublishedAtDesc = 'sys_publishedAt_DESC',
  SysPublishedVersionAsc = 'sys_publishedVersion_ASC',
  SysPublishedVersionDesc = 'sys_publishedVersion_DESC',
}

export enum SubGroupOrder {
  GroupNameAsc = 'groupName_ASC',
  GroupNameDesc = 'groupName_DESC',
  InternalNameAsc = 'internalName_ASC',
  InternalNameDesc = 'internalName_DESC',
  SysFirstPublishedAtAsc = 'sys_firstPublishedAt_ASC',
  SysFirstPublishedAtDesc = 'sys_firstPublishedAt_DESC',
  SysIdAsc = 'sys_id_ASC',
  SysIdDesc = 'sys_id_DESC',
  SysPublishedAtAsc = 'sys_publishedAt_ASC',
  SysPublishedAtDesc = 'sys_publishedAt_DESC',
  SysPublishedVersionAsc = 'sys_publishedVersion_ASC',
  SysPublishedVersionDesc = 'sys_publishedVersion_DESC',
}

export type Sys = {
  __typename?: 'Sys';
  environmentId: Scalars['String']['output'];
  firstPublishedAt: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['String']['output'];
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  publishedVersion: Maybe<Scalars['Int']['output']>;
  spaceId: Scalars['String']['output'];
};

export type SysFilter = {
  firstPublishedAt: InputMaybe<Scalars['DateTime']['input']>;
  firstPublishedAt_exists: InputMaybe<Scalars['Boolean']['input']>;
  firstPublishedAt_gt: InputMaybe<Scalars['DateTime']['input']>;
  firstPublishedAt_gte: InputMaybe<Scalars['DateTime']['input']>;
  firstPublishedAt_in: InputMaybe<
    Array<InputMaybe<Scalars['DateTime']['input']>>
  >;
  firstPublishedAt_lt: InputMaybe<Scalars['DateTime']['input']>;
  firstPublishedAt_lte: InputMaybe<Scalars['DateTime']['input']>;
  firstPublishedAt_not: InputMaybe<Scalars['DateTime']['input']>;
  firstPublishedAt_not_in: InputMaybe<
    Array<InputMaybe<Scalars['DateTime']['input']>>
  >;
  id: InputMaybe<Scalars['String']['input']>;
  id_contains: InputMaybe<Scalars['String']['input']>;
  id_exists: InputMaybe<Scalars['Boolean']['input']>;
  id_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_not: InputMaybe<Scalars['String']['input']>;
  id_not_contains: InputMaybe<Scalars['String']['input']>;
  id_not_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  publishedAt: InputMaybe<Scalars['DateTime']['input']>;
  publishedAt_exists: InputMaybe<Scalars['Boolean']['input']>;
  publishedAt_gt: InputMaybe<Scalars['DateTime']['input']>;
  publishedAt_gte: InputMaybe<Scalars['DateTime']['input']>;
  publishedAt_in: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>;
  publishedAt_lt: InputMaybe<Scalars['DateTime']['input']>;
  publishedAt_lte: InputMaybe<Scalars['DateTime']['input']>;
  publishedAt_not: InputMaybe<Scalars['DateTime']['input']>;
  publishedAt_not_in: InputMaybe<
    Array<InputMaybe<Scalars['DateTime']['input']>>
  >;
  publishedVersion: InputMaybe<Scalars['Float']['input']>;
  publishedVersion_exists: InputMaybe<Scalars['Boolean']['input']>;
  publishedVersion_gt: InputMaybe<Scalars['Float']['input']>;
  publishedVersion_gte: InputMaybe<Scalars['Float']['input']>;
  publishedVersion_in: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  publishedVersion_lt: InputMaybe<Scalars['Float']['input']>;
  publishedVersion_lte: InputMaybe<Scalars['Float']['input']>;
  publishedVersion_not: InputMaybe<Scalars['Float']['input']>;
  publishedVersion_not_in: InputMaybe<
    Array<InputMaybe<Scalars['Float']['input']>>
  >;
};

export type _Node = {
  _id: Scalars['ID']['output'];
};

export type CfCapabilityNestedFilter = {
  AND: InputMaybe<Array<InputMaybe<CfCapabilityNestedFilter>>>;
  OR: InputMaybe<Array<InputMaybe<CfCapabilityNestedFilter>>>;
  contentfulMetadata: InputMaybe<ContentfulMetadataFilter>;
  description: InputMaybe<Scalars['String']['input']>;
  description_contains: InputMaybe<Scalars['String']['input']>;
  description_exists: InputMaybe<Scalars['Boolean']['input']>;
  description_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  description_not: InputMaybe<Scalars['String']['input']>;
  description_not_contains: InputMaybe<Scalars['String']['input']>;
  description_not_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  internalName: InputMaybe<Scalars['String']['input']>;
  internalName_contains: InputMaybe<Scalars['String']['input']>;
  internalName_exists: InputMaybe<Scalars['Boolean']['input']>;
  internalName_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  internalName_not: InputMaybe<Scalars['String']['input']>;
  internalName_not_contains: InputMaybe<Scalars['String']['input']>;
  internalName_not_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  servicesCollection_exists: InputMaybe<Scalars['Boolean']['input']>;
  slug: InputMaybe<Scalars['String']['input']>;
  slug_contains: InputMaybe<Scalars['String']['input']>;
  slug_exists: InputMaybe<Scalars['Boolean']['input']>;
  slug_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  slug_not: InputMaybe<Scalars['String']['input']>;
  slug_not_contains: InputMaybe<Scalars['String']['input']>;
  slug_not_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  sys: InputMaybe<SysFilter>;
};

export type CfCommonContentNestedFilter = {
  AND: InputMaybe<Array<InputMaybe<CfCommonContentNestedFilter>>>;
  OR: InputMaybe<Array<InputMaybe<CfCommonContentNestedFilter>>>;
  cancellationUrl: InputMaybe<Scalars['String']['input']>;
  cancellationUrl_contains: InputMaybe<Scalars['String']['input']>;
  cancellationUrl_exists: InputMaybe<Scalars['Boolean']['input']>;
  cancellationUrl_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  cancellationUrl_not: InputMaybe<Scalars['String']['input']>;
  cancellationUrl_not_contains: InputMaybe<Scalars['String']['input']>;
  cancellationUrl_not_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  contentfulMetadata: InputMaybe<ContentfulMetadataFilter>;
  emailIcon: InputMaybe<Scalars['String']['input']>;
  emailIcon_contains: InputMaybe<Scalars['String']['input']>;
  emailIcon_exists: InputMaybe<Scalars['Boolean']['input']>;
  emailIcon_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  emailIcon_not: InputMaybe<Scalars['String']['input']>;
  emailIcon_not_contains: InputMaybe<Scalars['String']['input']>;
  emailIcon_not_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  internalName: InputMaybe<Scalars['String']['input']>;
  internalName_contains: InputMaybe<Scalars['String']['input']>;
  internalName_exists: InputMaybe<Scalars['Boolean']['input']>;
  internalName_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  internalName_not: InputMaybe<Scalars['String']['input']>;
  internalName_not_contains: InputMaybe<Scalars['String']['input']>;
  internalName_not_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  newsletterLabelTextCode: InputMaybe<Scalars['String']['input']>;
  newsletterLabelTextCode_contains: InputMaybe<Scalars['String']['input']>;
  newsletterLabelTextCode_exists: InputMaybe<Scalars['Boolean']['input']>;
  newsletterLabelTextCode_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  newsletterLabelTextCode_not: InputMaybe<Scalars['String']['input']>;
  newsletterLabelTextCode_not_contains: InputMaybe<Scalars['String']['input']>;
  newsletterLabelTextCode_not_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  newsletterSlug_contains_all: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  newsletterSlug_contains_none: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  newsletterSlug_contains_some: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  newsletterSlug_exists: InputMaybe<Scalars['Boolean']['input']>;
  privacyNoticeDownloadUrl: InputMaybe<Scalars['String']['input']>;
  privacyNoticeDownloadUrl_contains: InputMaybe<Scalars['String']['input']>;
  privacyNoticeDownloadUrl_exists: InputMaybe<Scalars['Boolean']['input']>;
  privacyNoticeDownloadUrl_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  privacyNoticeDownloadUrl_not: InputMaybe<Scalars['String']['input']>;
  privacyNoticeDownloadUrl_not_contains: InputMaybe<Scalars['String']['input']>;
  privacyNoticeDownloadUrl_not_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  privacyNoticeUrl: InputMaybe<Scalars['String']['input']>;
  privacyNoticeUrl_contains: InputMaybe<Scalars['String']['input']>;
  privacyNoticeUrl_exists: InputMaybe<Scalars['Boolean']['input']>;
  privacyNoticeUrl_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  privacyNoticeUrl_not: InputMaybe<Scalars['String']['input']>;
  privacyNoticeUrl_not_contains: InputMaybe<Scalars['String']['input']>;
  privacyNoticeUrl_not_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  successActionButtonLabel: InputMaybe<Scalars['String']['input']>;
  successActionButtonLabel_contains: InputMaybe<Scalars['String']['input']>;
  successActionButtonLabel_exists: InputMaybe<Scalars['Boolean']['input']>;
  successActionButtonLabel_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  successActionButtonLabel_not: InputMaybe<Scalars['String']['input']>;
  successActionButtonLabel_not_contains: InputMaybe<Scalars['String']['input']>;
  successActionButtonLabel_not_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  successActionButtonUrl: InputMaybe<Scalars['String']['input']>;
  successActionButtonUrl_contains: InputMaybe<Scalars['String']['input']>;
  successActionButtonUrl_exists: InputMaybe<Scalars['Boolean']['input']>;
  successActionButtonUrl_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  successActionButtonUrl_not: InputMaybe<Scalars['String']['input']>;
  successActionButtonUrl_not_contains: InputMaybe<Scalars['String']['input']>;
  successActionButtonUrl_not_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  sys: InputMaybe<SysFilter>;
  termsOfServiceDownloadUrl: InputMaybe<Scalars['String']['input']>;
  termsOfServiceDownloadUrl_contains: InputMaybe<Scalars['String']['input']>;
  termsOfServiceDownloadUrl_exists: InputMaybe<Scalars['Boolean']['input']>;
  termsOfServiceDownloadUrl_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  termsOfServiceDownloadUrl_not: InputMaybe<Scalars['String']['input']>;
  termsOfServiceDownloadUrl_not_contains: InputMaybe<
    Scalars['String']['input']
  >;
  termsOfServiceDownloadUrl_not_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  termsOfServiceUrl: InputMaybe<Scalars['String']['input']>;
  termsOfServiceUrl_contains: InputMaybe<Scalars['String']['input']>;
  termsOfServiceUrl_exists: InputMaybe<Scalars['Boolean']['input']>;
  termsOfServiceUrl_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  termsOfServiceUrl_not: InputMaybe<Scalars['String']['input']>;
  termsOfServiceUrl_not_contains: InputMaybe<Scalars['String']['input']>;
  termsOfServiceUrl_not_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
};

export type CfCouponConfigNestedFilter = {
  AND: InputMaybe<Array<InputMaybe<CfCouponConfigNestedFilter>>>;
  OR: InputMaybe<Array<InputMaybe<CfCouponConfigNestedFilter>>>;
  contentfulMetadata: InputMaybe<ContentfulMetadataFilter>;
  countries_contains_all: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  countries_contains_none: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  countries_contains_some: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  countries_exists: InputMaybe<Scalars['Boolean']['input']>;
  internalName: InputMaybe<Scalars['String']['input']>;
  internalName_contains: InputMaybe<Scalars['String']['input']>;
  internalName_exists: InputMaybe<Scalars['Boolean']['input']>;
  internalName_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  internalName_not: InputMaybe<Scalars['String']['input']>;
  internalName_not_contains: InputMaybe<Scalars['String']['input']>;
  internalName_not_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  stripePromotionCodes_contains_all: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  stripePromotionCodes_contains_none: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  stripePromotionCodes_contains_some: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  stripePromotionCodes_exists: InputMaybe<Scalars['Boolean']['input']>;
  sys: InputMaybe<SysFilter>;
};

export type CfIapNestedFilter = {
  AND: InputMaybe<Array<InputMaybe<CfIapNestedFilter>>>;
  OR: InputMaybe<Array<InputMaybe<CfIapNestedFilter>>>;
  appleProductIDs_contains_all: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  appleProductIDs_contains_none: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  appleProductIDs_contains_some: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  appleProductIDs_exists: InputMaybe<Scalars['Boolean']['input']>;
  contentfulMetadata: InputMaybe<ContentfulMetadataFilter>;
  googleSKUs_contains_all: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  googleSKUs_contains_none: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  googleSKUs_contains_some: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  googleSKUs_exists: InputMaybe<Scalars['Boolean']['input']>;
  internalName: InputMaybe<Scalars['String']['input']>;
  internalName_contains: InputMaybe<Scalars['String']['input']>;
  internalName_exists: InputMaybe<Scalars['Boolean']['input']>;
  internalName_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  internalName_not: InputMaybe<Scalars['String']['input']>;
  internalName_not_contains: InputMaybe<Scalars['String']['input']>;
  internalName_not_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  sys: InputMaybe<SysFilter>;
};

export type CfOfferingNestedFilter = {
  AND: InputMaybe<Array<InputMaybe<CfOfferingNestedFilter>>>;
  OR: InputMaybe<Array<InputMaybe<CfOfferingNestedFilter>>>;
  apiIdentifier: InputMaybe<Scalars['String']['input']>;
  apiIdentifier_contains: InputMaybe<Scalars['String']['input']>;
  apiIdentifier_exists: InputMaybe<Scalars['Boolean']['input']>;
  apiIdentifier_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  apiIdentifier_not: InputMaybe<Scalars['String']['input']>;
  apiIdentifier_not_contains: InputMaybe<Scalars['String']['input']>;
  apiIdentifier_not_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  capabilitiesCollection_exists: InputMaybe<Scalars['Boolean']['input']>;
  commonContent_exists: InputMaybe<Scalars['Boolean']['input']>;
  contentfulMetadata: InputMaybe<ContentfulMetadataFilter>;
  countries_contains_all: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  countries_contains_none: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  countries_contains_some: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  countries_exists: InputMaybe<Scalars['Boolean']['input']>;
  couponConfigCollection_exists: InputMaybe<Scalars['Boolean']['input']>;
  defaultPurchase_exists: InputMaybe<Scalars['Boolean']['input']>;
  description: InputMaybe<Scalars['String']['input']>;
  description_contains: InputMaybe<Scalars['String']['input']>;
  description_exists: InputMaybe<Scalars['Boolean']['input']>;
  description_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  description_not: InputMaybe<Scalars['String']['input']>;
  description_not_contains: InputMaybe<Scalars['String']['input']>;
  description_not_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  experimentPurchaseCollection_exists: InputMaybe<Scalars['Boolean']['input']>;
  iapCollection_exists: InputMaybe<Scalars['Boolean']['input']>;
  internalName: InputMaybe<Scalars['String']['input']>;
  internalName_contains: InputMaybe<Scalars['String']['input']>;
  internalName_exists: InputMaybe<Scalars['Boolean']['input']>;
  internalName_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  internalName_not: InputMaybe<Scalars['String']['input']>;
  internalName_not_contains: InputMaybe<Scalars['String']['input']>;
  internalName_not_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  stripeLegacyPlans_contains_all: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  stripeLegacyPlans_contains_none: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  stripeLegacyPlans_contains_some: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  stripeLegacyPlans_exists: InputMaybe<Scalars['Boolean']['input']>;
  stripeProductId: InputMaybe<Scalars['String']['input']>;
  stripeProductId_contains: InputMaybe<Scalars['String']['input']>;
  stripeProductId_exists: InputMaybe<Scalars['Boolean']['input']>;
  stripeProductId_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  stripeProductId_not: InputMaybe<Scalars['String']['input']>;
  stripeProductId_not_contains: InputMaybe<Scalars['String']['input']>;
  stripeProductId_not_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  sys: InputMaybe<SysFilter>;
};

export type CfPurchaseDetailsNestedFilter = {
  AND: InputMaybe<Array<InputMaybe<CfPurchaseDetailsNestedFilter>>>;
  OR: InputMaybe<Array<InputMaybe<CfPurchaseDetailsNestedFilter>>>;
  contentfulMetadata: InputMaybe<ContentfulMetadataFilter>;
  details: InputMaybe<Scalars['String']['input']>;
  details_contains: InputMaybe<Scalars['String']['input']>;
  details_exists: InputMaybe<Scalars['Boolean']['input']>;
  details_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  details_not: InputMaybe<Scalars['String']['input']>;
  details_not_contains: InputMaybe<Scalars['String']['input']>;
  details_not_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  internalName: InputMaybe<Scalars['String']['input']>;
  internalName_contains: InputMaybe<Scalars['String']['input']>;
  internalName_exists: InputMaybe<Scalars['Boolean']['input']>;
  internalName_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  internalName_not: InputMaybe<Scalars['String']['input']>;
  internalName_not_contains: InputMaybe<Scalars['String']['input']>;
  internalName_not_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  productName: InputMaybe<Scalars['String']['input']>;
  productName_contains: InputMaybe<Scalars['String']['input']>;
  productName_exists: InputMaybe<Scalars['Boolean']['input']>;
  productName_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  productName_not: InputMaybe<Scalars['String']['input']>;
  productName_not_contains: InputMaybe<Scalars['String']['input']>;
  productName_not_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  subtitle: InputMaybe<Scalars['String']['input']>;
  subtitle_contains: InputMaybe<Scalars['String']['input']>;
  subtitle_exists: InputMaybe<Scalars['Boolean']['input']>;
  subtitle_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  subtitle_not: InputMaybe<Scalars['String']['input']>;
  subtitle_not_contains: InputMaybe<Scalars['String']['input']>;
  subtitle_not_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  sys: InputMaybe<SysFilter>;
  webIcon: InputMaybe<Scalars['String']['input']>;
  webIcon_contains: InputMaybe<Scalars['String']['input']>;
  webIcon_exists: InputMaybe<Scalars['Boolean']['input']>;
  webIcon_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  webIcon_not: InputMaybe<Scalars['String']['input']>;
  webIcon_not_contains: InputMaybe<Scalars['String']['input']>;
  webIcon_not_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type CfPurchaseNestedFilter = {
  AND: InputMaybe<Array<InputMaybe<CfPurchaseNestedFilter>>>;
  OR: InputMaybe<Array<InputMaybe<CfPurchaseNestedFilter>>>;
  contentfulMetadata: InputMaybe<ContentfulMetadataFilter>;
  description: InputMaybe<Scalars['String']['input']>;
  description_contains: InputMaybe<Scalars['String']['input']>;
  description_exists: InputMaybe<Scalars['Boolean']['input']>;
  description_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  description_not: InputMaybe<Scalars['String']['input']>;
  description_not_contains: InputMaybe<Scalars['String']['input']>;
  description_not_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  internalName: InputMaybe<Scalars['String']['input']>;
  internalName_contains: InputMaybe<Scalars['String']['input']>;
  internalName_exists: InputMaybe<Scalars['Boolean']['input']>;
  internalName_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  internalName_not: InputMaybe<Scalars['String']['input']>;
  internalName_not_contains: InputMaybe<Scalars['String']['input']>;
  internalName_not_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  offering_exists: InputMaybe<Scalars['Boolean']['input']>;
  purchaseDetails_exists: InputMaybe<Scalars['Boolean']['input']>;
  stripePlanChoices_contains_all: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  stripePlanChoices_contains_none: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  stripePlanChoices_contains_some: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  stripePlanChoices_exists: InputMaybe<Scalars['Boolean']['input']>;
  sys: InputMaybe<SysFilter>;
};

export type CfServiceNestedFilter = {
  AND: InputMaybe<Array<InputMaybe<CfServiceNestedFilter>>>;
  OR: InputMaybe<Array<InputMaybe<CfServiceNestedFilter>>>;
  capabilitiesCollection_exists: InputMaybe<Scalars['Boolean']['input']>;
  contentfulMetadata: InputMaybe<ContentfulMetadataFilter>;
  description: InputMaybe<Scalars['String']['input']>;
  description_contains: InputMaybe<Scalars['String']['input']>;
  description_exists: InputMaybe<Scalars['Boolean']['input']>;
  description_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  description_not: InputMaybe<Scalars['String']['input']>;
  description_not_contains: InputMaybe<Scalars['String']['input']>;
  description_not_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  internalName: InputMaybe<Scalars['String']['input']>;
  internalName_contains: InputMaybe<Scalars['String']['input']>;
  internalName_exists: InputMaybe<Scalars['Boolean']['input']>;
  internalName_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  internalName_not: InputMaybe<Scalars['String']['input']>;
  internalName_not_contains: InputMaybe<Scalars['String']['input']>;
  internalName_not_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  oauthClientId: InputMaybe<Scalars['String']['input']>;
  oauthClientId_contains: InputMaybe<Scalars['String']['input']>;
  oauthClientId_exists: InputMaybe<Scalars['Boolean']['input']>;
  oauthClientId_in: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  oauthClientId_not: InputMaybe<Scalars['String']['input']>;
  oauthClientId_not_contains: InputMaybe<Scalars['String']['input']>;
  oauthClientId_not_in: InputMaybe<
    Array<InputMaybe<Scalars['String']['input']>>
  >;
  sys: InputMaybe<SysFilter>;
};

export type CapabilityServiceByPlanIdsQueryVariables = Exact<{
  skip: Scalars['Int']['input'];
  limit: Scalars['Int']['input'];
  locale: Scalars['String']['input'];
  stripePlanIds:
    | Array<InputMaybe<Scalars['String']['input']>>
    | InputMaybe<Scalars['String']['input']>;
}>;

export type CapabilityServiceByPlanIdsQuery = {
  __typename?: 'Query';
  purchaseCollection: {
    __typename?: 'PurchaseCollection';
    total: number;
    items: Array<{
      __typename?: 'Purchase';
      stripePlanChoices: Array<string | null> | null;
      offering: {
        __typename?: 'Offering';
        stripeLegacyPlans: Array<string | null> | null;
        capabilitiesCollection: {
          __typename?: 'OfferingCapabilitiesCollection';
          items: Array<{
            __typename?: 'Capability';
            slug: string | null;
            servicesCollection: {
              __typename?: 'CapabilityServicesCollection';
              items: Array<{
                __typename?: 'Service';
                oauthClientId: string | null;
              } | null>;
            } | null;
          } | null>;
        } | null;
      } | null;
    } | null>;
  } | null;
};

export type EligibilityContentByOfferingQueryVariables = Exact<{
  apiIdentifier: Scalars['String']['input'];
}>;

export type EligibilityContentByOfferingQuery = {
  __typename?: 'Query';
  offeringCollection: {
    __typename?: 'OfferingCollection';
    items: Array<{
      __typename?: 'Offering';
      apiIdentifier: string | null;
      stripeProductId: string | null;
      defaultPurchase: {
        __typename?: 'Purchase';
        stripePlanChoices: Array<string | null> | null;
      } | null;
      linkedFrom: {
        __typename?: 'OfferingLinkingCollections';
        subGroupCollection: {
          __typename?: 'SubGroupCollection';
          items: Array<{
            __typename?: 'SubGroup';
            groupName: string | null;
            offeringCollection: {
              __typename?: 'SubGroupOfferingCollection';
              items: Array<{
                __typename?: 'Offering';
                apiIdentifier: string | null;
                stripeProductId: string | null;
                defaultPurchase: {
                  __typename?: 'Purchase';
                  stripePlanChoices: Array<string | null> | null;
                } | null;
              } | null>;
            } | null;
          } | null>;
        } | null;
      } | null;
    } | null>;
  } | null;
};

export type EligibilityContentByPlanIdsQueryVariables = Exact<{
  skip: Scalars['Int']['input'];
  limit: Scalars['Int']['input'];
  locale: Scalars['String']['input'];
  stripePlanIds:
    | Array<InputMaybe<Scalars['String']['input']>>
    | InputMaybe<Scalars['String']['input']>;
}>;

export type EligibilityContentByPlanIdsQuery = {
  __typename?: 'Query';
  purchaseCollection: {
    __typename?: 'PurchaseCollection';
    total: number;
    items: Array<{
      __typename?: 'Purchase';
      stripePlanChoices: Array<string | null> | null;
      offering: {
        __typename?: 'Offering';
        stripeProductId: string | null;
        stripeLegacyPlans: Array<string | null> | null;
        countries: Array<string | null> | null;
        linkedFrom: {
          __typename?: 'OfferingLinkingCollections';
          subGroupCollection: {
            __typename?: 'SubGroupCollection';
            items: Array<{
              __typename?: 'SubGroup';
              groupName: string | null;
              offeringCollection: {
                __typename?: 'SubGroupOfferingCollection';
                items: Array<{
                  __typename?: 'Offering';
                  stripeProductId: string | null;
                  stripeLegacyPlans: Array<string | null> | null;
                  countries: Array<string | null> | null;
                } | null>;
              } | null;
            } | null>;
          } | null;
        } | null;
      } | null;
    } | null>;
  } | null;
};

export type OfferingQueryVariables = Exact<{
  id: Scalars['String']['input'];
  locale: Scalars['String']['input'];
}>;

export type OfferingQuery = {
  __typename?: 'Query';
  offering: {
    __typename?: 'Offering';
    stripeProductId: string | null;
    countries: Array<string | null> | null;
    defaultPurchase: {
      __typename?: 'Purchase';
      purchaseDetails: {
        __typename?: 'PurchaseDetails';
        productName: string | null;
        details: string | null;
        subtitle: string | null;
        webIcon: string | null;
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
  offeringCollection: {
    __typename?: 'OfferingCollection';
    items: Array<{
      __typename?: 'Offering';
      apiIdentifier: string | null;
      stripeProductId: string | null;
      defaultPurchase: {
        __typename?: 'Purchase';
        purchaseDetails: {
          __typename?: 'PurchaseDetails';
          details: string | null;
          productName: string | null;
          subtitle: string | null;
          webIcon: string | null;
        } | null;
      } | null;
      commonContent: {
        __typename?: 'CommonContent';
        privacyNoticeUrl: string | null;
        privacyNoticeDownloadUrl: string | null;
        termsOfServiceUrl: string | null;
        termsOfServiceDownloadUrl: string | null;
        cancellationUrl: string | null;
        emailIcon: string | null;
        successActionButtonUrl: string | null;
        successActionButtonLabel: string | null;
        newsletterLabelTextCode: string | null;
        newsletterSlug: Array<string | null> | null;
      } | null;
    } | null>;
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
  purchaseCollection: {
    __typename?: 'PurchaseCollection';
    items: Array<{
      __typename?: 'Purchase';
      stripePlanChoices: Array<string | null> | null;
      purchaseDetails: {
        __typename?: 'PurchaseDetails';
        details: string | null;
        productName: string | null;
        subtitle: string | null;
        webIcon: string | null;
      } | null;
      offering: {
        __typename?: 'Offering';
        stripeProductId: string | null;
        stripeLegacyPlans: Array<string | null> | null;
        commonContent: {
          __typename?: 'CommonContent';
          privacyNoticeUrl: string | null;
          privacyNoticeDownloadUrl: string | null;
          termsOfServiceUrl: string | null;
          termsOfServiceDownloadUrl: string | null;
          cancellationUrl: string | null;
          emailIcon: string | null;
          successActionButtonUrl: string | null;
          successActionButtonLabel: string | null;
          newsletterLabelTextCode: string | null;
          newsletterSlug: Array<string | null> | null;
        } | null;
      } | null;
    } | null>;
  } | null;
};

export type PurchaseWithDetailsQueryVariables = Exact<{
  id: Scalars['String']['input'];
  locale: Scalars['String']['input'];
}>;

export type PurchaseWithDetailsQuery = {
  __typename?: 'Query';
  purchase: {
    __typename?: 'Purchase';
    internalName: string | null;
    description: string | null;
    purchaseDetails: {
      __typename?: 'PurchaseDetails';
      productName: string | null;
      details: string | null;
      webIcon: string | null;
    } | null;
  } | null;
};

export type ServicesWithCapabilitiesQueryVariables = Exact<{
  skip: Scalars['Int']['input'];
  limit: Scalars['Int']['input'];
  locale: Scalars['String']['input'];
}>;

export type ServicesWithCapabilitiesQuery = {
  __typename?: 'Query';
  serviceCollection: {
    __typename?: 'ServiceCollection';
    items: Array<{
      __typename?: 'Service';
      oauthClientId: string | null;
      capabilitiesCollection: {
        __typename?: 'ServiceCapabilitiesCollection';
        items: Array<{ __typename?: 'Capability'; slug: string | null } | null>;
      } | null;
    } | null>;
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
            name: { kind: 'Name', value: 'purchaseCollection' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'skip' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'skip' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'limit' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'limit' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'locale' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'locale' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'OR' },
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
                                  value: 'stripePlanChoices_contains_some',
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
                                        value:
                                          'stripeLegacyPlans_contains_some',
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
                { kind: 'Field', name: { kind: 'Name', value: 'total' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'items' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'stripePlanChoices' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'offering' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: {
                                kind: 'Name',
                                value: 'stripeLegacyPlans',
                              },
                            },
                            {
                              kind: 'Field',
                              name: {
                                kind: 'Name',
                                value: 'capabilitiesCollection',
                              },
                              arguments: [
                                {
                                  kind: 'Argument',
                                  name: { kind: 'Name', value: 'skip' },
                                  value: { kind: 'IntValue', value: '0' },
                                },
                                {
                                  kind: 'Argument',
                                  name: { kind: 'Name', value: 'limit' },
                                  value: { kind: 'IntValue', value: '25' },
                                },
                              ],
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'items' },
                                    selectionSet: {
                                      kind: 'SelectionSet',
                                      selections: [
                                        {
                                          kind: 'Field',
                                          name: { kind: 'Name', value: 'slug' },
                                        },
                                        {
                                          kind: 'Field',
                                          name: {
                                            kind: 'Name',
                                            value: 'servicesCollection',
                                          },
                                          arguments: [
                                            {
                                              kind: 'Argument',
                                              name: {
                                                kind: 'Name',
                                                value: 'skip',
                                              },
                                              value: {
                                                kind: 'IntValue',
                                                value: '0',
                                              },
                                            },
                                            {
                                              kind: 'Argument',
                                              name: {
                                                kind: 'Name',
                                                value: 'limit',
                                              },
                                              value: {
                                                kind: 'IntValue',
                                                value: '15',
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
                                                  value: 'items',
                                                },
                                                selectionSet: {
                                                  kind: 'SelectionSet',
                                                  selections: [
                                                    {
                                                      kind: 'Field',
                                                      name: {
                                                        kind: 'Name',
                                                        value: 'oauthClientId',
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
            name: { kind: 'Name', value: 'offeringCollection' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'skip' },
                value: { kind: 'IntValue', value: '0' },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'limit' },
                value: { kind: 'IntValue', value: '2' },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'apiIdentifier' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'apiIdentifier' },
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
                  name: { kind: 'Name', value: 'items' },
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
                              name: {
                                kind: 'Name',
                                value: 'stripePlanChoices',
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'linkedFrom' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: {
                                kind: 'Name',
                                value: 'subGroupCollection',
                              },
                              arguments: [
                                {
                                  kind: 'Argument',
                                  name: { kind: 'Name', value: 'skip' },
                                  value: { kind: 'IntValue', value: '0' },
                                },
                                {
                                  kind: 'Argument',
                                  name: { kind: 'Name', value: 'limit' },
                                  value: { kind: 'IntValue', value: '25' },
                                },
                              ],
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'items' },
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
                                            value: 'offeringCollection',
                                          },
                                          arguments: [
                                            {
                                              kind: 'Argument',
                                              name: {
                                                kind: 'Name',
                                                value: 'skip',
                                              },
                                              value: {
                                                kind: 'IntValue',
                                                value: '0',
                                              },
                                            },
                                            {
                                              kind: 'Argument',
                                              name: {
                                                kind: 'Name',
                                                value: 'limit',
                                              },
                                              value: {
                                                kind: 'IntValue',
                                                value: '20',
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
                                                  value: 'items',
                                                },
                                                selectionSet: {
                                                  kind: 'SelectionSet',
                                                  selections: [
                                                    {
                                                      kind: 'Field',
                                                      name: {
                                                        kind: 'Name',
                                                        value: 'apiIdentifier',
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
                                                      selectionSet: {
                                                        kind: 'SelectionSet',
                                                        selections: [
                                                          {
                                                            kind: 'Field',
                                                            name: {
                                                              kind: 'Name',
                                                              value:
                                                                'stripePlanChoices',
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
            name: { kind: 'Name', value: 'purchaseCollection' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'skip' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'skip' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'limit' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'limit' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'locale' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'locale' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'OR' },
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
                                  value: 'stripePlanChoices_contains_some',
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
                                        value:
                                          'stripeLegacyPlans_contains_some',
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
                { kind: 'Field', name: { kind: 'Name', value: 'total' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'items' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'stripePlanChoices' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'offering' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'stripeProductId' },
                            },
                            {
                              kind: 'Field',
                              name: {
                                kind: 'Name',
                                value: 'stripeLegacyPlans',
                              },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'countries' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'linkedFrom' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: {
                                      kind: 'Name',
                                      value: 'subGroupCollection',
                                    },
                                    arguments: [
                                      {
                                        kind: 'Argument',
                                        name: { kind: 'Name', value: 'skip' },
                                        value: { kind: 'IntValue', value: '0' },
                                      },
                                      {
                                        kind: 'Argument',
                                        name: { kind: 'Name', value: 'limit' },
                                        value: {
                                          kind: 'IntValue',
                                          value: '25',
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
                                            value: 'items',
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
                                                  value: 'offeringCollection',
                                                },
                                                arguments: [
                                                  {
                                                    kind: 'Argument',
                                                    name: {
                                                      kind: 'Name',
                                                      value: 'skip',
                                                    },
                                                    value: {
                                                      kind: 'IntValue',
                                                      value: '0',
                                                    },
                                                  },
                                                  {
                                                    kind: 'Argument',
                                                    name: {
                                                      kind: 'Name',
                                                      value: 'limit',
                                                    },
                                                    value: {
                                                      kind: 'IntValue',
                                                      value: '20',
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
                                                        value: 'items',
                                                      },
                                                      selectionSet: {
                                                        kind: 'SelectionSet',
                                                        selections: [
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
} as unknown as DocumentNode<
  EligibilityContentByPlanIdsQuery,
  EligibilityContentByPlanIdsQueryVariables
>;
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
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'locale' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'locale' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'stripeProductId' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'countries' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'defaultPurchase' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'purchaseDetails' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'productName' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'details' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'subtitle' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'webIcon' },
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
            name: { kind: 'Name', value: 'offeringCollection' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'skip' },
                value: { kind: 'IntValue', value: '0' },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'limit' },
                value: { kind: 'IntValue', value: '2' },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'locale' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'locale' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'apiIdentifier' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'apiIdentifier' },
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
                  name: { kind: 'Name', value: 'items' },
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
                              name: { kind: 'Name', value: 'purchaseDetails' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'details' },
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
                                    name: { kind: 'Name', value: 'subtitle' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'webIcon' },
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
                              name: { kind: 'Name', value: 'privacyNoticeUrl' },
                            },
                            {
                              kind: 'Field',
                              name: {
                                kind: 'Name',
                                value: 'privacyNoticeDownloadUrl',
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
                                value: 'termsOfServiceDownloadUrl',
                              },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'cancellationUrl' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'emailIcon' },
                            },
                            {
                              kind: 'Field',
                              name: {
                                kind: 'Name',
                                value: 'successActionButtonUrl',
                              },
                            },
                            {
                              kind: 'Field',
                              name: {
                                kind: 'Name',
                                value: 'successActionButtonLabel',
                              },
                            },
                            {
                              kind: 'Field',
                              name: {
                                kind: 'Name',
                                value: 'newsletterLabelTextCode',
                              },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'newsletterSlug' },
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
            name: { kind: 'Name', value: 'purchaseCollection' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'skip' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'skip' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'limit' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'limit' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'locale' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'locale' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'where' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'OR' },
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
                                  value: 'stripePlanChoices_contains_some',
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
                                        value:
                                          'stripeLegacyPlans_contains_some',
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
                  name: { kind: 'Name', value: 'items' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'stripePlanChoices' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'purchaseDetails' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'details' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'productName' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'subtitle' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'webIcon' },
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
                              name: { kind: 'Name', value: 'stripeProductId' },
                            },
                            {
                              kind: 'Field',
                              name: {
                                kind: 'Name',
                                value: 'stripeLegacyPlans',
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
                                    name: {
                                      kind: 'Name',
                                      value: 'privacyNoticeUrl',
                                    },
                                  },
                                  {
                                    kind: 'Field',
                                    name: {
                                      kind: 'Name',
                                      value: 'privacyNoticeDownloadUrl',
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
                                      value: 'termsOfServiceDownloadUrl',
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
                                    name: { kind: 'Name', value: 'emailIcon' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: {
                                      kind: 'Name',
                                      value: 'successActionButtonUrl',
                                    },
                                  },
                                  {
                                    kind: 'Field',
                                    name: {
                                      kind: 'Name',
                                      value: 'successActionButtonLabel',
                                    },
                                  },
                                  {
                                    kind: 'Field',
                                    name: {
                                      kind: 'Name',
                                      value: 'newsletterLabelTextCode',
                                    },
                                  },
                                  {
                                    kind: 'Field',
                                    name: {
                                      kind: 'Name',
                                      value: 'newsletterSlug',
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
export const PurchaseWithDetailsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'PurchaseWithDetails' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
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
            name: { kind: 'Name', value: 'purchase' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'locale' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'locale' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'internalName' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'purchaseDetails' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'productName' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'details' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'webIcon' },
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
  PurchaseWithDetailsQuery,
  PurchaseWithDetailsQueryVariables
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
            name: { kind: 'Name', value: 'serviceCollection' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'skip' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'skip' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'limit' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'limit' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'locale' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'locale' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'items' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'oauthClientId' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'capabilitiesCollection' },
                        arguments: [
                          {
                            kind: 'Argument',
                            name: { kind: 'Name', value: 'skip' },
                            value: {
                              kind: 'Variable',
                              name: { kind: 'Name', value: 'skip' },
                            },
                          },
                          {
                            kind: 'Argument',
                            name: { kind: 'Name', value: 'limit' },
                            value: {
                              kind: 'Variable',
                              name: { kind: 'Name', value: 'limit' },
                            },
                          },
                        ],
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'items' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'slug' },
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

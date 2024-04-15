/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
  '\n  query CapabilityServiceByPlanIds(\n    $skip: Int!\n    $limit: Int!\n    $locale: String!\n    $stripePlanIds: [String]!\n  ) {\n    purchaseCollection(\n      skip: $skip\n      limit: $limit\n      locale: $locale\n      where: {\n        OR: [\n          { stripePlanChoices_contains_some: $stripePlanIds }\n          { offering: { stripeLegacyPlans_contains_some: $stripePlanIds } }\n        ]\n      }\n    ) {\n      total\n      items {\n        stripePlanChoices\n        offering {\n          stripeLegacyPlans\n          capabilitiesCollection(skip: 0, limit: 25) {\n            items {\n              slug\n              servicesCollection(skip: 0, limit: 15) {\n                items {\n                  oauthClientId\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n':
    types.CapabilityServiceByPlanIdsDocument,
  '\n  query EligibilityContentByOffering(\n    $skip: Int!\n    $limit: Int!\n    $locale: String!\n    $offering: String!\n  ) {\n    offeringCollection(\n      skip: $skip\n      limit: $limit\n      locale: $locale\n      where: { apiIdentifier_contains: $offering }\n    ) {\n      items {\n        apiIdentifier\n        stripeProductId\n        stripeLegacyPlans\n        countries\n        linkedFrom {\n          subGroupCollection(skip: 0, limit: 25) {\n            items {\n              groupName\n              offeringCollection(skip: 0, limit: 20) {\n                items {\n                  apiIdentifier\n                  stripeProductId\n                  stripeLegacyPlans\n                  countries\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n':
    types.EligibilityContentByOfferingDocument,
  '\n  query EligibilityContentByPlanIds(\n    $skip: Int!\n    $limit: Int!\n    $locale: String!\n    $stripePlanIds: [String]!\n  ) {\n    purchaseCollection(\n      skip: $skip\n      limit: $limit\n      locale: $locale\n      where: {\n        OR: [\n          { stripePlanChoices_contains_some: $stripePlanIds }\n          { offering: { stripeLegacyPlans_contains_some: $stripePlanIds } }\n        ]\n      }\n    ) {\n      total\n      items {\n        stripePlanChoices\n        offering {\n          stripeProductId\n          stripeLegacyPlans\n          countries\n          linkedFrom {\n            subGroupCollection(skip: 0, limit: 25) {\n              items {\n                groupName\n                offeringCollection(skip: 0, limit: 20) {\n                  items {\n                    stripeProductId\n                    stripeLegacyPlans\n                    countries\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n':
    types.EligibilityContentByPlanIdsDocument,
  '\n  query Offering($id: String!, $locale: String!) {\n    offering(id: $id, locale: $locale) {\n      stripeProductId\n      countries\n      defaultPurchase {\n        purchaseDetails {\n          productName\n          details\n          subtitle\n          webIcon\n        }\n      }\n    }\n  }\n':
    types.OfferingDocument,
  '\n  query PurchaseWithDetailsOfferingContent(\n    $skip: Int!\n    $limit: Int!\n    $locale: String!\n    $stripePlanIds: [String]!\n  ) {\n    purchaseCollection(\n      skip: $skip\n      limit: $limit\n      locale: $locale\n      where: {\n        OR: [\n          { stripePlanChoices_contains_some: $stripePlanIds }\n          { offering: { stripeLegacyPlans_contains_some: $stripePlanIds } }\n        ]\n      }\n    ) {\n      items {\n        stripePlanChoices\n        purchaseDetails {\n          details\n          productName\n          subtitle\n          webIcon\n        }\n        offering {\n          stripeProductId\n          stripeLegacyPlans\n          commonContent {\n            privacyNoticeUrl\n            privacyNoticeDownloadUrl\n            termsOfServiceUrl\n            termsOfServiceDownloadUrl\n            cancellationUrl\n            emailIcon\n            successActionButtonUrl\n            successActionButtonLabel\n            newsletterLabelTextCode\n            newsletterSlug\n          }\n        }\n      }\n    }\n  }\n':
    types.PurchaseWithDetailsOfferingContentDocument,
  '\n  query PurchaseWithDetails($id: String!, $locale: String!) {\n    purchase(id: $id, locale: $locale) {\n      internalName\n      description\n      purchaseDetails {\n        productName\n        details\n        webIcon\n      }\n    }\n  }\n':
    types.PurchaseWithDetailsDocument,
  '\n  query ServicesWithCapabilities($skip: Int!, $limit: Int!, $locale: String!) {\n    serviceCollection(skip: $skip, limit: $limit, locale: $locale) {\n      items {\n        oauthClientId\n        capabilitiesCollection(skip: $skip, limit: $limit) {\n          items {\n            slug\n          }\n        }\n      }\n    }\n  }\n':
    types.ServicesWithCapabilitiesDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query CapabilityServiceByPlanIds(\n    $skip: Int!\n    $limit: Int!\n    $locale: String!\n    $stripePlanIds: [String]!\n  ) {\n    purchaseCollection(\n      skip: $skip\n      limit: $limit\n      locale: $locale\n      where: {\n        OR: [\n          { stripePlanChoices_contains_some: $stripePlanIds }\n          { offering: { stripeLegacyPlans_contains_some: $stripePlanIds } }\n        ]\n      }\n    ) {\n      total\n      items {\n        stripePlanChoices\n        offering {\n          stripeLegacyPlans\n          capabilitiesCollection(skip: 0, limit: 25) {\n            items {\n              slug\n              servicesCollection(skip: 0, limit: 15) {\n                items {\n                  oauthClientId\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n'
): (typeof documents)['\n  query CapabilityServiceByPlanIds(\n    $skip: Int!\n    $limit: Int!\n    $locale: String!\n    $stripePlanIds: [String]!\n  ) {\n    purchaseCollection(\n      skip: $skip\n      limit: $limit\n      locale: $locale\n      where: {\n        OR: [\n          { stripePlanChoices_contains_some: $stripePlanIds }\n          { offering: { stripeLegacyPlans_contains_some: $stripePlanIds } }\n        ]\n      }\n    ) {\n      total\n      items {\n        stripePlanChoices\n        offering {\n          stripeLegacyPlans\n          capabilitiesCollection(skip: 0, limit: 25) {\n            items {\n              slug\n              servicesCollection(skip: 0, limit: 15) {\n                items {\n                  oauthClientId\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query EligibilityContentByOffering(\n    $skip: Int!\n    $limit: Int!\n    $locale: String!\n    $offering: String!\n  ) {\n    offeringCollection(\n      skip: $skip\n      limit: $limit\n      locale: $locale\n      where: { apiIdentifier_contains: $offering }\n    ) {\n      items {\n        apiIdentifier\n        stripeProductId\n        stripeLegacyPlans\n        countries\n        linkedFrom {\n          subGroupCollection(skip: 0, limit: 25) {\n            items {\n              groupName\n              offeringCollection(skip: 0, limit: 20) {\n                items {\n                  apiIdentifier\n                  stripeProductId\n                  stripeLegacyPlans\n                  countries\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n'
): (typeof documents)['\n  query EligibilityContentByOffering(\n    $skip: Int!\n    $limit: Int!\n    $locale: String!\n    $offering: String!\n  ) {\n    offeringCollection(\n      skip: $skip\n      limit: $limit\n      locale: $locale\n      where: { apiIdentifier_contains: $offering }\n    ) {\n      items {\n        apiIdentifier\n        stripeProductId\n        stripeLegacyPlans\n        countries\n        linkedFrom {\n          subGroupCollection(skip: 0, limit: 25) {\n            items {\n              groupName\n              offeringCollection(skip: 0, limit: 20) {\n                items {\n                  apiIdentifier\n                  stripeProductId\n                  stripeLegacyPlans\n                  countries\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query EligibilityContentByPlanIds(\n    $skip: Int!\n    $limit: Int!\n    $locale: String!\n    $stripePlanIds: [String]!\n  ) {\n    purchaseCollection(\n      skip: $skip\n      limit: $limit\n      locale: $locale\n      where: {\n        OR: [\n          { stripePlanChoices_contains_some: $stripePlanIds }\n          { offering: { stripeLegacyPlans_contains_some: $stripePlanIds } }\n        ]\n      }\n    ) {\n      total\n      items {\n        stripePlanChoices\n        offering {\n          stripeProductId\n          stripeLegacyPlans\n          countries\n          linkedFrom {\n            subGroupCollection(skip: 0, limit: 25) {\n              items {\n                groupName\n                offeringCollection(skip: 0, limit: 20) {\n                  items {\n                    stripeProductId\n                    stripeLegacyPlans\n                    countries\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n'
): (typeof documents)['\n  query EligibilityContentByPlanIds(\n    $skip: Int!\n    $limit: Int!\n    $locale: String!\n    $stripePlanIds: [String]!\n  ) {\n    purchaseCollection(\n      skip: $skip\n      limit: $limit\n      locale: $locale\n      where: {\n        OR: [\n          { stripePlanChoices_contains_some: $stripePlanIds }\n          { offering: { stripeLegacyPlans_contains_some: $stripePlanIds } }\n        ]\n      }\n    ) {\n      total\n      items {\n        stripePlanChoices\n        offering {\n          stripeProductId\n          stripeLegacyPlans\n          countries\n          linkedFrom {\n            subGroupCollection(skip: 0, limit: 25) {\n              items {\n                groupName\n                offeringCollection(skip: 0, limit: 20) {\n                  items {\n                    stripeProductId\n                    stripeLegacyPlans\n                    countries\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query Offering($id: String!, $locale: String!) {\n    offering(id: $id, locale: $locale) {\n      stripeProductId\n      countries\n      defaultPurchase {\n        purchaseDetails {\n          productName\n          details\n          subtitle\n          webIcon\n        }\n      }\n    }\n  }\n'
): (typeof documents)['\n  query Offering($id: String!, $locale: String!) {\n    offering(id: $id, locale: $locale) {\n      stripeProductId\n      countries\n      defaultPurchase {\n        purchaseDetails {\n          productName\n          details\n          subtitle\n          webIcon\n        }\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query PurchaseWithDetailsOfferingContent(\n    $skip: Int!\n    $limit: Int!\n    $locale: String!\n    $stripePlanIds: [String]!\n  ) {\n    purchaseCollection(\n      skip: $skip\n      limit: $limit\n      locale: $locale\n      where: {\n        OR: [\n          { stripePlanChoices_contains_some: $stripePlanIds }\n          { offering: { stripeLegacyPlans_contains_some: $stripePlanIds } }\n        ]\n      }\n    ) {\n      items {\n        stripePlanChoices\n        purchaseDetails {\n          details\n          productName\n          subtitle\n          webIcon\n        }\n        offering {\n          stripeProductId\n          stripeLegacyPlans\n          commonContent {\n            privacyNoticeUrl\n            privacyNoticeDownloadUrl\n            termsOfServiceUrl\n            termsOfServiceDownloadUrl\n            cancellationUrl\n            emailIcon\n            successActionButtonUrl\n            successActionButtonLabel\n            newsletterLabelTextCode\n            newsletterSlug\n          }\n        }\n      }\n    }\n  }\n'
): (typeof documents)['\n  query PurchaseWithDetailsOfferingContent(\n    $skip: Int!\n    $limit: Int!\n    $locale: String!\n    $stripePlanIds: [String]!\n  ) {\n    purchaseCollection(\n      skip: $skip\n      limit: $limit\n      locale: $locale\n      where: {\n        OR: [\n          { stripePlanChoices_contains_some: $stripePlanIds }\n          { offering: { stripeLegacyPlans_contains_some: $stripePlanIds } }\n        ]\n      }\n    ) {\n      items {\n        stripePlanChoices\n        purchaseDetails {\n          details\n          productName\n          subtitle\n          webIcon\n        }\n        offering {\n          stripeProductId\n          stripeLegacyPlans\n          commonContent {\n            privacyNoticeUrl\n            privacyNoticeDownloadUrl\n            termsOfServiceUrl\n            termsOfServiceDownloadUrl\n            cancellationUrl\n            emailIcon\n            successActionButtonUrl\n            successActionButtonLabel\n            newsletterLabelTextCode\n            newsletterSlug\n          }\n        }\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query PurchaseWithDetails($id: String!, $locale: String!) {\n    purchase(id: $id, locale: $locale) {\n      internalName\n      description\n      purchaseDetails {\n        productName\n        details\n        webIcon\n      }\n    }\n  }\n'
): (typeof documents)['\n  query PurchaseWithDetails($id: String!, $locale: String!) {\n    purchase(id: $id, locale: $locale) {\n      internalName\n      description\n      purchaseDetails {\n        productName\n        details\n        webIcon\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query ServicesWithCapabilities($skip: Int!, $limit: Int!, $locale: String!) {\n    serviceCollection(skip: $skip, limit: $limit, locale: $locale) {\n      items {\n        oauthClientId\n        capabilitiesCollection(skip: $skip, limit: $limit) {\n          items {\n            slug\n          }\n        }\n      }\n    }\n  }\n'
): (typeof documents)['\n  query ServicesWithCapabilities($skip: Int!, $limit: Int!, $locale: String!) {\n    serviceCollection(skip: $skip, limit: $limit, locale: $locale) {\n      items {\n        oauthClientId\n        capabilitiesCollection(skip: $skip, limit: $limit) {\n          items {\n            slug\n          }\n        }\n      }\n    }\n  }\n'];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> =
  TDocumentNode extends DocumentNode<infer TType, any> ? TType : never;

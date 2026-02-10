/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { graphql } from '../../../__generated__/gql';

export const validationOfferingsQuery = graphql(`
  query ValidationOfferings {
    offerings(pagination: { limit: 500 }) {
      apiIdentifier
      stripeProductId
      countries
      defaultPurchase {
        purchaseDetails {
          details
          productName
          subtitle
          webIcon
        }
        stripePlanChoices {
          stripePlanChoice
        }
      }
      commonContent {
        privacyNoticeUrl
        privacyNoticeDownloadUrl
        termsOfServiceUrl
        termsOfServiceDownloadUrl
        cancellationUrl
        emailIcon
        successActionButtonUrl
        successActionButtonLabel
        newsletterLabelTextCode
        newsletterSlug
        supportUrl
      }
      capabilities {
        slug
        services {
          oauthClientId
        }
      }
      stripeLegacyPlans(pagination: { limit: 200 }) {
        stripeLegacyPlan
      }
      couponConfig {
        internalName
        stripePromotionCodes {
          PromoCode
        }
      }
      subGroups {
        internalName
        groupName
      }
    }
  }
`);

export const validationPurchasesQuery = graphql(`
  query ValidationPurchases {
    purchases(pagination: { limit: 500 }) {
      internalName
      purchaseDetails {
        details
        productName
        subtitle
        webIcon
      }
      stripePlanChoices {
        stripePlanChoice
      }
    }
  }
`);

export const validationPurchaseDetailsQuery = graphql(`
  query ValidationPurchaseDetails {
    purchaseDetails(pagination: { limit: 500 }) {
      details
      productName
      subtitle
      webIcon
    }
  }
`);

export const validationCommonContentsQuery = graphql(`
  query ValidationCommonContents {
    commonContents(pagination: { limit: 500 }) {
      privacyNoticeUrl
      privacyNoticeDownloadUrl
      termsOfServiceUrl
      termsOfServiceDownloadUrl
      cancellationUrl
      emailIcon
      successActionButtonUrl
      successActionButtonLabel
      newsletterLabelTextCode
      newsletterSlug
      supportUrl
    }
  }
`);

export const validationCapabilitiesQuery = graphql(`
  query ValidationCapabilities {
    capabilities(pagination: { limit: 500 }) {
      slug
      services {
        oauthClientId
      }
    }
  }
`);

export const validationServicesQuery = graphql(`
  query ValidationServices {
    services(pagination: { limit: 500 }) {
      oauthClientId
    }
  }
`);

export const validationSubgroupsQuery = graphql(`
  query ValidationSubgroups {
    subgroups(pagination: { limit: 500 }) {
      internalName
      groupName
    }
  }
`);

export const validationIapsQuery = graphql(`
  query ValidationIaps {
    iaps(pagination: { limit: 500 }) {
      storeID
      interval
      offering {
        apiIdentifier
      }
    }
  }
`);

export const validationChurnInterventionsQuery = graphql(`
  query ValidationChurnInterventions {
    churnInterventions(pagination: { limit: 500 }) {
      churnInterventionId
      churnType
      stripeCouponId
      interval
      discountAmount
      ctaMessage
      modalHeading
      modalMessage
      productPageUrl
      termsHeading
      termsDetails
      redemptionLimit
    }
  }
`);

export const validationCancelInterstitialOffersQuery = graphql(`
  query ValidationCancelInterstitialOffers {
    cancelInterstitialOffers(pagination: { limit: 500 }) {
      offeringApiIdentifier
      currentInterval
      upgradeInterval
      modalHeading1
      modalMessage
      productPageUrl
      upgradeButtonLabel
      upgradeButtonUrl
      offering {
        stripeProductId
      }
    }
  }
`);

export const validationCouponConfigsQuery = graphql(`
  query ValidationCouponConfigs {
    couponConfigs(pagination: { limit: 500 }) {
      internalName
      stripePromotionCodes {
        PromoCode
      }
    }
  }
`);

import { faker } from '@faker-js/faker';

export function CMSValidationOfferingFactory() {
  return {
    apiIdentifier: faker.string.alphanumeric(10),
    stripeProductId: `prod_${faker.string.alphanumeric(14)}`,
    countries: ['US', 'CA'],
    defaultPurchase: {
      purchaseDetails: {
        details: faker.lorem.sentence(),
        productName: faker.commerce.productName(),
        subtitle: faker.lorem.sentence(),
        webIcon: faker.internet.url(),
      },
      stripePlanChoices: [
        { stripePlanChoice: `price_${faker.string.alphanumeric(14)}` },
      ],
    },
    commonContent: {
      privacyNoticeUrl: faker.internet.url(),
      privacyNoticeDownloadUrl: faker.internet.url(),
      termsOfServiceUrl: faker.internet.url(),
      termsOfServiceDownloadUrl: faker.internet.url(),
      cancellationUrl: faker.internet.url(),
      emailIcon: faker.internet.url(),
      successActionButtonUrl: faker.internet.url(),
      successActionButtonLabel: faker.string.alpha(10),
      newsletterLabelTextCode: 'snp',
      newsletterSlug: ['mozilla-accounts'],
      supportUrl: faker.internet.url(),
    },
    capabilities: [
      {
        slug: faker.string.alphanumeric(10),
        services: [{ oauthClientId: faker.string.hexadecimal({ length: 16 }) }],
      },
    ],
    stripeLegacyPlans: [
      { stripeLegacyPlan: `plan_${faker.string.alphanumeric(14)}` },
    ],
    couponConfig: {
      internalName: faker.string.alpha(10),
      stripePromotionCodes: [{ PromoCode: faker.string.alphanumeric(10) }],
    },
    subGroups: [
      { internalName: faker.string.alpha(10), groupName: faker.string.alpha(10) },
    ],
  };
}

export function CMSValidationPurchaseFactory() {
  return {
    internalName: faker.string.alpha(10),
    purchaseDetails: {
      details: faker.lorem.sentence(),
      productName: faker.commerce.productName(),
      subtitle: null,
      webIcon: faker.internet.url(),
    },
    stripePlanChoices: [
      { stripePlanChoice: `price_${faker.string.alphanumeric(14)}` },
    ],
  };
}

export function CMSValidationCapabilityFactory() {
  return {
    slug: faker.string.alphanumeric(10),
    services: [{ oauthClientId: faker.string.hexadecimal({ length: 16 }) }],
  };
}

export function CMSValidationChurnInterventionFactory() {
  return {
    churnInterventionId: faker.string.alphanumeric(10),
    churnType: 'cancel',
    stripeCouponId: faker.string.alphanumeric(10),
    interval: 'monthly',
    discountAmount: 50,
    ctaMessage: faker.lorem.sentence(),
    modalHeading: faker.lorem.sentence(),
    modalMessage: faker.lorem.paragraph(),
    productPageUrl: faker.internet.url(),
    termsHeading: faker.lorem.sentence(),
    termsDetails: faker.lorem.paragraph(),
    redemptionLimit: 3,
  };
}

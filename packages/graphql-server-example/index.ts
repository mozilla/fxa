import { ApolloServer } from '@apollo/server';

import { startStandaloneServer } from '@apollo/server/standalone';

const typeDefs = `#graphql
  type Coupon {
    promotionCode: String!
    type: String!
    durationInMonths: Int!
    discountAmount: Int!
  }

  type InvoiceTax {
    amount: Int!
    inclusive: Boolean!
    displayName: String!
  }

  type InvoiceDiscount {
    amount: Int!
    amountOff: Int
    percentOff: Int
  }

  type InvoicePreview {
    total: Int!
    totalExcludingTax: Int
    subtotal: Int!
    subtotalExcludingTax: Int
    currency: String!
    tax: [InvoiceTax!]
    discount: [InvoiceDiscount!]
  }


  type PlanStyles {
    webIconBackground: String
  }

  type Plan {
    id: String!
    productName: String!
    planName: String!
    active: Boolean!
    styles: PlanStyles
    description: [String!]
    subtitle: String
    upgradeCTA: String

    successActionButtonUrl: String!
    successActionButtonLabel: String!
    webIconUrl: String!
    tosUrl: String!
    tosDownloadUrl: String!
    privacyNoticeUrl: String!
    privacyNoticeDownloadUrl: String!
    cancellationSurveyUrl: String
  }

  type Query {
    invoicePreview(
      planId: String!
      promotionCode: String
    ): InvoicePreview!

    coupon(
      planId: String!
      promotionCode: String!
    ): Coupon

    plan(
      id: String!
      locale: String!
    ): Plan!
  }
`;

const mockCoupon = {
  promotionCode: 'mockPromotionCode',
  type: 'mockType',
  durationInMonths: 12,
  discountAmount: 1000,
};

const mockInvoicePreview = {
  total: 2250,
  totalExcludingTax: 1950,
  subtotal: 2000,
  subtotalExcludingTax: 2000,
  currency: 'USD',
  tax: [
    {
      amount: 300,
      inclusive: false,
      displayName: 'Sales Tax',
    },
  ],
  discount: [
    {
      amount: 50,
      amountOff: 50,
      percentOff: null,
    },
  ],
};

const mockPlan = {
  id: '123',
  productName: 'Testing Foxkeh',
  planName: 'Test',
  active: true,
  styles: {
    webIconBackground: '#20123a',
  },
  description: ['Testing Foxkeh', 'Product Detail line 2'],
  subtitle: 'Test Plan Subtitle',
  upgradeCTA: 'Lets get you updated',
  successActionButtonUrl: 'https://foxkeh.com/buttons/',
  successActionButtonLabel: 'You did it!',
  webIconUrl: 'https://accounts-static.cdn.mozilla.net/legal/mozilla_vpn_tos',
  tosUrl: 'https://accounts-static.cdn.mozilla.net/legal/mozilla_vpn_tos',
  tosDownloadUrl:
    'https://accounts-static.cdn.mozilla.net/legal/mozilla_vpn_tos',
  privacyNoticeUrl:
    'https://accounts-static.cdn.mozilla.net/legal/mozilla_vpn_tos',
  privacyNoticeDownloadUrl:
    'https://accounts-static.cdn.mozilla.net/legal/mozilla_vpn_tos',
  cancellationSurveyUrl:
    'https://accounts-static.cdn.mozilla.net/legal/mozilla_cancellation_survey_url',
};

const resolvers = {
  Query: {
    invoicePreview: (_, params) => mockInvoicePreview,

    coupon: (_, params) => {
      if (params.promotionCode === 'expired') {
        throw new Error('Expired coupon code');
      }
      if (params.promotionCode === 'maximallyRedeemed') {
        throw new Error('Coupon code maximally redeemed');
      }

      return mockCoupon;
    },

    plan: (_, params) => mockPlan,
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Listen
(async () => {
  const { url } = await startStandaloneServer(server, {
    listen: {
      port: parseInt(process.env.PORT, 10) || 8100,
    },
  });

  console.log(`🚀  Server ready at: ${url}`);
})();

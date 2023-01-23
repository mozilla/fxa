import type { GatsbyNode } from 'gatsby';
import path from 'path';

import { MarkdownQuery, SubplatQuery } from './src/lib/types';

export const onCreateWebpackConfig: GatsbyNode['onCreateWebpackConfig'] = ({
  stage,
  plugins,
  actions,
}) => {
  actions.setWebpackConfig({
    module: {
      rules: [
        {
          include: /[/\\]node_modules[/\\]@fluent/,
          test: /\.js$/,
          type: 'javascript/esm',
        },
      ],
    },
    plugins: [
      plugins.define({
        __DEVELOPMENT__: stage === `develop` || stage === `develop-html`,
      }),
    ],
  });
};

export const createPages: GatsbyNode['createPages'] = async ({
  graphql,
  actions,
}) => {
  const { createPage } = actions;
  const planTemplate1 = path.resolve(
    'src/templates/Checkout/checkout-template-1.tsx'
  );

  const gqlQuery = await graphql<SubplatQuery>(`
    query SubPlatQuery {
      subplat {
        plan(id: "123", locale: "en-us") {
          id
          productName
          planName
          active
          styles {
            webIconBackground
          }
          description
          subtitle
          upgradeCTA
          successActionButtonUrl
          successActionButtonLabel
          webIconUrl
          tosUrl
          tosDownloadUrl
          privacyNoticeUrl
          privacyNoticeDownloadUrl
          cancellationSurveyUrl
        }

        invoicePreview(planId: "123") {
          total
          totalExcludingTax
          subtotal
          subtotalExcludingTax
          currency
          tax {
            amount
            inclusive
            displayName
          }
          discount {
            amount
            amountOff
          }
        }

        coupon(planId: "123", promotionCode: "") {
          discountAmount
          durationInMonths
          promotionCode
          type
        }
      }
    }
  `);

  const mockPlan = gqlQuery.data?.subplat;
  const pathName = mockPlan?.plan.productName
    .replace(/\s+/g, '-')
    .toLowerCase();
  createPage({
    path: `/plan/${pathName}`,
    component: planTemplate1,
    context: mockPlan,
  });

  const markDownQuery = await graphql<MarkdownQuery>(`
    query allProducts {
      allMarkdownRemark {
        edges {
          node {
            frontmatter {
              active
              cancellationSurveyUrl
              description
              id
              planName
              privacyNoticeDownloadUrl
              privacyNoticeUrl
              productName
              styles {
                webIconBackground
              }
              subtitle
              successActionButtonLabel
              successActionButtonUrl
              title
              tosDownloadUrl
              tosUrl
              upgradeCTA
              webIconUrl
            }
          }
        }
      }
    }
  `);

  markDownQuery.data?.allMarkdownRemark.edges.forEach(({ node }) => {
    const plan = node.frontmatter;
    const pathName = plan.productName.replace(/\s+/g, '-').toLowerCase();
    const coupon = mockPlan?.coupon;
    const invoicePreview = mockPlan?.invoicePreview;
    const revisedPlan = {
      plan,
      coupon,
      invoicePreview,
    };
    createPage({
      path: `/plan/${pathName}`,
      component: planTemplate1,
      context: revisedPlan,
    });
  });
};

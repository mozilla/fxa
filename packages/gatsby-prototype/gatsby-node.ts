import type { GatsbyNode } from 'gatsby';

import path from 'path';

// const onCreateWebpackConfig: GatsbyNode['onCreateWebpackConfig'] = async ({
//   stage,
//   loaders,
//   plugins,
//   actions,
// }): Promise<void> => {
//   actions.setWebpackConfig({
//     module: {
//       rules: [
//         {
//           test: /\.js$/,
//           type: 'javascript/esm',
//         },
//       ],
//     },
//     plugins: [
//       plugins.define({
//         __DEVELOPMENT__: stage === `develop` || stage === `develop-html`,
//       }),
//     ],
//   });
// };

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;
  const planTemplate1 = path.resolve(
    'src/templates/Checkout/checkout-template-1.tsx'
  );

  const gqlQuery = await graphql(`
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

  const mockPlan = gqlQuery.data.subplat;
  const pathName = gqlQuery.data.subplat.plan.productName
    .replace(/\s+/g, '-')
    .toLowerCase();
  createPage({
    path: `/plan/${pathName}`,
    component: planTemplate1,
    context: mockPlan,
  });

  const markDownQuery = await graphql(`
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
      subplat {
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

  markDownQuery.data.allMarkdownRemark.edges.forEach(({ node }: any) => {
    const plan = node.frontmatter;
    const pathName = plan.productName.replace(/\s+/g, '-').toLowerCase();
    const otherData = markDownQuery.data.subplat;
    const mockPlan = { plan, ...otherData };
    createPage({
      path: `/plan/${pathName}`,
      component: planTemplate1,
      context: mockPlan,
    });
  });
};

// module.exports = onCreateWebpackConfig;

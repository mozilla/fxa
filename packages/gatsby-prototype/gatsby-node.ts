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
  const planTemplate = path.resolve('src/templates/template1.tsx');

  const res = await graphql(`
    query allProducts {
      allMarkdownRemark {
        edges {
          node {
            frontmatter {
              active
              cancellationSurveyUrl
              description
              id
              path
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

  res.data.allMarkdownRemark.edges.forEach(({ node }: any) => {
    const path = node.frontmatter.path;
    const plan = node.frontmatter;
    createPage({
      path,
      component: planTemplate,
      context: { plan },
    });
  });
};

// module.exports = onCreateWebpackConfig;

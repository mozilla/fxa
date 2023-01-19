import type { GatsbyNode } from 'gatsby';

const path = require('path');

const onCreateWebpackConfig: GatsbyNode['onCreateWebpackConfig'] = async ({
  stage,
  loaders,
  plugins,
  actions,
}): Promise<void> => {
  actions.setWebpackConfig({
    module: {
      rules: [
        {
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

const createPages: GatsbyNode['createPages'] = async ({ graphql, actions }) => {
  const { createPage } = actions;
  const queryResults: any = await graphql(`
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

  const productTemplate = path.resolve(`src/templates/template1.tsx`);

  queryResults.data.allMarkdownRemark.edges.forEach(({ node }: any) => {
    const path = node.frontmatter.path;
    createPage({
      path: `products/${path}`,
      component: productTemplate,
      // context: {
      //   // This time the entire product is passed down as context
      //   product: node,
      // },
    });
  });
};

module.exports = onCreateWebpackConfig;
module.exports = createPages;

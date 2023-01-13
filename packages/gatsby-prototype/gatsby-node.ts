import type { GatsbyNode } from 'gatsby';

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

module.exports = onCreateWebpackConfig;

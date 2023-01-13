import type { GatsbyNode } from "gatsby";

const onCreateWebpackConfig: GatsbyNode["onCreateWebpackConfig"] = async({
  stage,
  loaders,
  plugins,
  actions,
}): Promise<void> => {
  actions.setWebpackConfig({
    module: {
      rules: [
        {
          test:  /\.js|\.jsx$/,
          use: [
            loaders.postcss(),
            `babel-loader`,
          ],
          include: /[/\\]node_modules[/\\]@fluent[/\\](bundle|langneg|syntax)[\\/]syntax[/\\]esm[/\\]/,
          query: {
            presets: ['babel-preset-gatsby']
          }
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

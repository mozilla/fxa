import type { CodegenConfig } from '@graphql-codegen/cli';

const CONTENTFUL_GRAPHQL_API_URL = process.env.CONTENTFUL_GRAPHQL_API_URL;
const CONTENTFUL_GRAPHQL_API_KEY = process.env.CONTENTFUL_GRAPHQL_API_KEY;
const CONTENTFUL_GRAPHQL_SPACE_ID = process.env.CONTENTFUL_GRAPHQL_SPACE_ID;
const CONTENTFUL_GRAPHQL_ENVIRONMENT =
  process.env.CONTENTFUL_GRAPHQL_ENVIRONMENT;

const config: CodegenConfig = {
  overwrite: true,
  schema: `${CONTENTFUL_GRAPHQL_API_URL}/spaces/${CONTENTFUL_GRAPHQL_SPACE_ID}/environments/${CONTENTFUL_GRAPHQL_ENVIRONMENT}?access_token=${CONTENTFUL_GRAPHQL_API_KEY}`,
  documents: [
    'libs/shared/cms/src/lib/queries/*.ts',
    'libs/shared/cms/src/lib/queries/**/*.ts',
  ],
  generates: {
    'libs/shared/cms/src/__generated__/': {
      preset: 'client',
      config: {
        avoidOptionals: true,
      },
    },
  },
};

export default config;

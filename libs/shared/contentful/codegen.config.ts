import type { CodegenConfig } from '@graphql-codegen/cli';

const CONTENTFUL_GRAPHQL_API_URL = process.env.CONTENTFUL_GRAPHQL_API_URL;

const CONTENTFUL_GRAPHQL_API_KEY = process.env.CONTENTFUL_GRAPHQL_API_KEY;

const config: CodegenConfig = {
  overwrite: true,
  schema: `${CONTENTFUL_GRAPHQL_API_URL}?access_token=${CONTENTFUL_GRAPHQL_API_KEY}`,
  documents: ['libs/shared/contentful/src/lib/queries/*.ts'],
  generates: {
    'libs/shared/contentful/src/__generated__/': {
      preset: 'client',
    },
  },
};

export default config;

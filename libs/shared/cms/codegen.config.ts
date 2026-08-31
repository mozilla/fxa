import type { CodegenConfig } from '@graphql-codegen/cli';
import { preset as clientPreset } from '@graphql-codegen/client-preset';

const STRAPI_GRAPHQL_API_URL =
  process.env.STRAPI_CLIENT_CONFIG__GRAPHQL_API_URI;
const STRAPI_API_KEY = process.env.STRAPI_CLIENT_CONFIG__API_KEY;

if (!STRAPI_GRAPHQL_API_URL || !STRAPI_API_KEY) {
  throw new Error('Please provide a valid Strapi API URL and API key');
}

const config: CodegenConfig = {
  overwrite: true,
  schema: {
    [STRAPI_GRAPHQL_API_URL]: {
      headers: {
        Authorization: `Bearer ${STRAPI_API_KEY}`,
      },
    },
  },
  documents: [
    'libs/shared/cms/src/lib/queries/*.ts',
    'libs/shared/cms/src/lib/queries/**/*.ts',
  ],
  generates: {
    'libs/shared/cms/src/__generated__/': {
      preset: clientPreset,
      config: {
        avoidOptionals: true,
      },
    },
  },
};

export default config;

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');
const { withSentryConfig } = require('@sentry/nextjs');
const { version } = require('./package.json');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  env: {
    version,
    GLEAN_CONFIG__VERSION: version,
    GLEAN_CLIENT_CONFIG__VERSION: version,
  },
  // `next experimental-analyze` serves from .next regardless of distDir (vercel/next.js#86731)
  distDir: process.env.NEXT_DIST_DIR ?? 'build',
  serverExternalPackages: [
    'axios',
    '@apollo',
    '@faker-js/faker',
    '@google-cloud/firestore',
    '@googleapis/androidpublisher',
    '@googlemaps/google-maps-services-js',
    '@grpc',
    '@nestjs/common',
    '@nestjs/config',
    '@nestjs/core',
    '@nestjs/mapped-types',
    '@nestjs/passport',
    '@nestjs/platform-express',
    '@nestjs/schedule',
    '@opentelemetry',
    '@prisma/instrumentation',
    '@sentry',
    '@sentry/node',
    '@sentry/nestjs',
    '@sentry/open-telemetry',
    '@type-cacheable/core',
    'app-store-server-api',
    'aws-sdk',
    'class-transformer',
    'class-validator',
    'google-gax',
    'graphql',
    'graphql-request',
    'hot-shots',
    'knex',
    'kysely',
    'maxmind',
    'mozlog',
    'mysql2',
    'nest-typed-config',
    'nest-winston',
    'objection',
    'superagent',
    'typedi',
    'whatwg-url',
    'winston',
  ],
  experimental: {
    optimizePackageImports: ['@radix-ui/react-form', '@radix-ui/react-tooltip'],
    serverMinification: false, // https://github.com/vercel/next.js/issues/59594
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.accounts.firefox.com',
        port: '',
        pathname: '/product-icons/**',
      },
      {
        protocol: 'https',
        hostname: '123done-stage.dev.lcip.org',
        port: '',
        pathname: '/img/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
};

/**
 * @type {import('@sentry/nextjs').SentryBuildOptions}
 **/
const sentryOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: 'mozilla',
  project: 'fxa-payments-next',

  // Enable source maps
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js proxy, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: '/monitoring',
};

// Use withSentryConfig to wrap the next config
/** @param {import('next').NextConfig} passedConfig */
const sentryEnhancedConfig = (passedConfig) =>
  withSentryConfig(passedConfig, sentryOptions);

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
  sentryEnhancedConfig,
];

module.exports = composePlugins(...plugins)(nextConfig);

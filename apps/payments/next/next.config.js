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
  nx: {
    // Set this to true if you would like to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
  env: {
    version,
  },
  experimental: {
    instrumentationHook: true,
    serverComponentsExternalPackages: [
      '@nestjs/core',
      '@nestjs/common',
      '@nestjs/websockets',
      '@nestjs/graphql',
      '@nestjs/mapped-types',
      'class-transformer',
      'class-validator',
      'hot-shots',
      'knex',
      'kysely',
      'mysql2',
      'nest-typed-config',
      'superagent',
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'accounts-static.cdn.mozilla.net',
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
};

/**
 * @type {import('@sentry/nextjs').SentryBuildOptions}
 **/
const sentryOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: "mozilla",
  project: "fxa-payments-next",

  // Enable source maps
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Automatically annotate React components to show their full name in breadcrumbs and session replay
  reactComponentAnnotation: {
    enabled: true,
  },

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,
}

// Use withSentryConfig to wrap the next config
const sentryEnhancedConfig = (passedConfig) =>
  withSentryConfig(passedConfig, sentryOptions);

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
  sentryEnhancedConfig,
];

module.exports = composePlugins(...plugins)(nextConfig);

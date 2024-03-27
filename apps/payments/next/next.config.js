/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    // Set this to true if you would like to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
  experimental: {
    serverComponentsExternalPackages: [
      '@nestjs/core',
      '@nestjs/common',
      'class-transformer',
      'class-validator',
      'hot-shots',
      'knex',
      'kysely',
      'mysql2',
      'nest-typed-config',
      'rxjs',
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
    ],
  },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);

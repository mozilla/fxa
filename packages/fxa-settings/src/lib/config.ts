/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { deepMerge } from './utilities';

export const META_CONFIG = 'fxa-config';

export interface Config {
  env: string;
  version: string;
  sentry: {
    url: string;
    dsn: string;
  };
  servers: {
    gql: {
      url: string;
    };
    auth: {
      url: string;
    };
  };
}

export function getDefault() {
  return {
    env: 'development',
    sentry: {
      url: 'https://sentry.prod.mozaws.net',
    },
    servers: {
      gql: {
        url: '',
      },
      auth: {
        url: '',
      },
    },
  } as Config;
}

export function readConfigMeta(
  headQuerySelector: typeof document.head.querySelector
) {
  const metaEl = headQuerySelector(`meta[name="${META_CONFIG}"]`);

  if (!metaEl) {
    throw new Error('<meta name="fxa-config"> is missing');
  }

  update(decode(metaEl.getAttribute('content')));
}

export function decode(content: string | null) {
  const isDev = process.env.NODE_ENV === 'development';

  if (!content) {
    if (isDev) {
      console.warn('fxa-settings is missing server config');
    } else {
      throw new Error('Configuration is empty');
    }
  }

  const decoded = decodeURIComponent(content!);

  try {
    return JSON.parse(decoded);
  } catch (error) {
    if (isDev) {
      console.warn('fxa-settings server config is invalid');
    } else {
      throw new Error(
        `Invalid configuration ${JSON.stringify(content)}: ${decoded}`
      );
    }
  }
}

export function reset() {
  const initial = getDefault();

  // This resets any existing default
  // keys back to their original value
  Object.assign(config, initial);

  // This removes any foreign keys that
  // may have found there way in
  Object.keys(config).forEach((key) => {
    if (!initial.hasOwnProperty(key)) {
      delete (config as any)[key];
    }
  });
}

export function update(newData: { [key: string]: any }) {
  deepMerge(config, newData);
}

const config: Config = getDefault();
export default config;

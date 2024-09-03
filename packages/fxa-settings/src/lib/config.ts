/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { deepMerge } from './utilities';

export const META_CONFIG = 'fxa-config';

export interface Config {
  env: string;
  l10n: {
    strict: boolean;
    baseUrl: string;
  };
  marketingEmailPreferencesUrl: string;
  metrics: {
    navTiming: {
      enabled: boolean;
      endpoint: string;
    };
  };
  sentry: {
    dsn: string;
    env: string;
    sampleRate: number;
    serverName: string;
    clientName: string;
    version: string;
  };
  servers: {
    gql: {
      url: string;
    };
    auth: {
      url: string;
    };
    oauth: {
      url: string;
    };
    profile: {
      url: string;
    };
  };
  oauth: {
    clientId: string;
    scopedKeysEnabled: boolean;
    scopedKeysValidation: Record<string, any>;
    isPromptNoneEnabled: boolean;
    isPromptNoneEnabledClientIds: string[];
    reactClientIdsEnabled: string[];
  };
  recoveryCodes: {
    count: number;
    length: number;
  };
  version: string;
  googleAuthConfig: {
    enabled: boolean;
    clientId: string;
    redirectUri: string;
    authorizationEndpoint: string;
  };
  appleAuthConfig: {
    enabled: boolean;
    clientId: string;
    redirectUri: string;
    authorizationEndpoint: string;
  };
  brandMessagingMode?: string;
  glean: {
    enabled: boolean;
    applicationId: string;
    uploadEnabled: boolean;
    appDisplayVersion: string;
    appChannel: string;
    serverEndpoint: string;
    logPings: boolean;
    debugViewTag: string;
  };
  redirectAllowlist: string[];
  sendFxAStatusOnSettings: boolean;
  showReactApp: {
    signUpRoutes: boolean;
    signInRoutes: boolean;
  };
  rolloutRates?: {
    keyStretchV2?: number;
  };
  featureFlags?: {
    keyStretchV2?: boolean;
    resetPasswordWithCode?: boolean;
  };
}

export function getDefault() {
  return {
    env: 'development',
    l10n: {
      strict: false,
      baseUrl: '/settings/locales',
    },
    marketingEmailPreferencesUrl: 'https://basket.mozilla.org/fxa/',
    metrics: {
      navTiming: { enabled: false, endpoint: '/check-your-metrics-config' },
    },
    sentry: {
      dsn: '',
      env: 'local',
      serverName: 'fxa-settings-server',
      clientName: 'fxa-settings-client',
      sampleRate: 1.0,
    },
    servers: {
      gql: {
        url: '',
      },
      auth: {
        url: '',
      },
      oauth: {
        url: '',
      },
      profile: {
        url: '',
      },
    },
    oauth: {
      clientId: '',
      scopedKeysEnabled: true,
      scopedKeysValidation: {},
      isPromptNoneEnabled: false,
      isPromptNoneEnabledClientIds: new Array<string>(),
      reactClientIdsEnabled: new Array<string>(),
    },
    recoveryCodes: {
      count: 8,
      length: 10,
    },
    googleAuthConfig: {
      enabled: false,
      clientId: '',
      redirectUri: '',
      authorizationEndpoint: '',
    },
    appleAuthConfig: {
      enabled: false,
      clientId: '',
      redirectUri: '',
      authorizationEndpoint: '',
    },
    brandMessagingMode: 'prelaunch',
    glean: {
      enabled: false,
      applicationId: 'accounts_frontend_dev',
      uploadEnabled: true,
      appChannel: 'development',
      serverEndpoint: 'https://incoming.telemetry.mozilla.org',
      logPings: false,
      debugViewTag: '',
    },
    redirectAllowlist: ['localhost'],
    sendFxAStatusOnSettings: false,
    showReactApp: {
      signUpRoutes: false,
      signInRoutes: false,
    },
    featureFlags: {
      resetPasswordWithCode: false,
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

  const metaConfig = decode(metaEl.getAttribute('content'));

  return update(metaConfig);
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
  return deepMerge(config, newData);
}

const config: Config = getDefault();
export default config;

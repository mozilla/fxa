// This configuration is a subset of the configuration declared in server/config/index.js
// Which config is copied over is defined in server/lib/server.js
export interface Config {
  env: string;
  featureFlags: { [key: string]: any };
  googleAnalytics: {
    enabled: boolean;
    measurementId: string;
    supportedProductIds: string;
    debugMode: boolean;
  };
  lang: string;
  legalDocLinks: {
    privacyNotice: string;
    termsOfService: string;
  };
  newsletterId: string;
  productRedirectURLs: {
    [productId: string]: string;
  };
  sentry: {
    dsn: string;
    env: string;
    sampleRate: number;
    clientName?: string;
    serverName?: string;
  };
  servers: {
    auth: {
      url: string;
    };
    content: {
      url: string;
    };
    oauth: {
      url: string;
      clientId: string;
    };
    profile: {
      url: string;
    };
  };
  paypal: {
    apiUrl: string;
    clientId: string;
    scriptUrl: string;
  };
  stripe: {
    apiKey: string;
  };
  version: string | undefined;
}

export const config: Config = defaultConfig();

export function defaultConfig(): Config {
  return {
    env: 'development',
    featureFlags: {},
    googleAnalytics: {
      enabled: false,
      measurementId: '',
      supportedProductIds: 'prod_GqM9ToKK62qjkK',
      debugMode: false,
    },
    lang: '',
    legalDocLinks: {
      privacyNotice: '',
      termsOfService: '',
    },
    newsletterId: 'mozilla-and-you',
    productRedirectURLs: {},
    sentry: {
      dsn: '',
      env: 'local',
      sampleRate: 1.0,
      serverName: 'fxa-payments-server',
      clientName: 'fxa-payments-client',
    },
    servers: {
      auth: {
        url: '',
      },
      content: {
        url: '',
      },
      oauth: {
        url: '',
        clientId: '',
      },
      profile: {
        url: '',
      },
    },
    paypal: {
      apiUrl: '',
      clientId: '',
      scriptUrl: '',
    },
    stripe: {
      apiKey: '',
    },
    version: undefined,
  };
}

export function resetConfig() {
  Object.assign(config, defaultConfig());
}

export function decodeConfig(content: string | null) {
  if (!content) {
    throw new Error('Configuration is empty');
  }
  const decoded = decodeURIComponent(content);
  try {
    return JSON.parse(decoded);
  } catch (e) {
    throw new Error(
      `Invalid configuration ${JSON.stringify(content)}: ${decoded}`
    );
  }
}

// Define a minimal function type for accessing meta content that's easier to
// mock, yet still matches real DOM.
type headQuerySelectorType = (
  name: string
) => null | { getAttribute: (name: string) => null | string };

export const META_CONFIG = 'fxa-config';
export const META_FEATURE_FLAGS = 'fxa-feature-flags';

export function readConfigFromMeta(headQuerySelector: headQuerySelectorType) {
  const getMetaElement = (name: string) =>
    headQuerySelector(`meta[name="${name}"]`);

  const configEl = getMetaElement(META_CONFIG);
  if (!configEl) {
    throw new Error('<meta name="fxa-config"> is missing');
  }
  updateConfig(decodeConfig(configEl.getAttribute('content')));

  const featureEl = getMetaElement(META_FEATURE_FLAGS);
  if (!featureEl) {
    throw new Error('<meta name="fxa-feature-flags"> is missing');
  }
  updateConfig({
    featureFlags: decodeConfig(featureEl.getAttribute('content')),
  });

  updateConfig({ lang: document.documentElement.lang });
}

function merge(obj: any, data: any) {
  for (const [key, value] of Object.entries(data)) {
    if (value === null || typeof value !== 'object') {
      obj[key] = value;
    } else {
      if (!obj[key]) {
        obj[key] = {};
      }
      merge(obj[key], value);
    }
  }
  return obj;
}

export function updateConfig(newData: any) {
  merge(config, newData);
}

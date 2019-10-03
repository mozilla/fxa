// This configuration is a subset of the configuration declared in server/config/index.js
// Which config is copied over is defined in server/lib/server.js
export interface Config {
  featureFlags: { [key: string]: any };
  sentryDsn: string;
  servers: {
    auth: {
      url: string;
    };
    content: {
      url: string;
    };
    oauth: {
      url: string;
    };
    profile: {
      url: string;
    };
  };
  stripe: {
    apiKey: string;
  };
  lang: string;
  productRedirectURLs: {
    [productId: string]: string;
  };
  legalDocLinks: {
    privacyNotice: string
    termsOfService: string
  };
  metrics: {
    flow: {
      enabled: boolean
    }
  };
  flowMetricsData: {
    flowBeginTime: number | null,
    flowId: string | null,
  }
}

export const config: Config = defaultConfig();

export function defaultConfig(): Config {
  return {
    featureFlags: {},
    sentryDsn: '',
    servers: {
      auth: {
        url: '',
      },
      content: {
        url: '',
      },
      oauth: {
        url: '',
      },
      profile: {
        url: '',
      },
    },
    stripe: {
      apiKey: '',
    },
    lang: '',
    productRedirectURLs: {},
    legalDocLinks: {
      privacyNotice: '',
      termsOfService: '',
    },
    metrics: {
      flow: {
        enabled: false
      }
    },
    flowMetricsData: {
      flowBeginTime: null,
      flowId: null,
    }
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
export const META_FLOW_METRICS_DATA = 'fxa-flow-metrics-data';

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

  if (config.metrics.flow.enabled) {
    const flowMetricsDataEl = getMetaElement(META_FLOW_METRICS_DATA);
    if (!flowMetricsDataEl) {
      throw new Error('<meta name="fxa-flow-metrics-data"> is missing');
    }
    updateConfig({ flowMetricsData: decodeConfig(flowMetricsDataEl.getAttribute('content')) });
  }
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

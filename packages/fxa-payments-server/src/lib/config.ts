// This configuration is a subset of the configuration declared in server/config/index.js
// Which config is copied over is defined in server/lib/server.js
export interface Config {
  featureFlags: {[key: string]: any}
  servers: {
    auth: {
      url: string
    }
    content: {
      url: string
    }
    oauth: {
      url: string
    }
    profile: {
      url: string
    }
  }
  stripe: {
    apiKey: string
  }
  lang: string
}

export const config: Config = {
  featureFlags: {},
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
};

function decodeConfig(content: string|null) {
  if (!content) {
    throw new Error('Configuration is empty');
  }
  const decoded = decodeURIComponent(content);
  try {
    return JSON.parse(decoded);
  } catch (e) {
    throw new Error(`Invalid configuration ${JSON.stringify(content)}: ${decoded}`);
  }
}

export function readConfigFromMeta() {
  const configEl = document.head.querySelector('meta[name="fxa-config"]');
  if (!configEl) {
    throw new Error('<meta name="fxa-config"> is missing');
  }
  updateConfig(decodeConfig(configEl.getAttribute('content')));
  const featureEl = document.head.querySelector('meta[name="fxa-feature-flags"]');
  if (!featureEl) {
    throw new Error('<meta name="fxa-feature-flags"> is missing');
  }
  updateConfig({featureFlags: decodeConfig(featureEl.getAttribute('content'))});
  updateConfig({lang: document.documentElement.lang});
}

function merge(obj: any, data: any) {
  for (const [key, value] of Object.entries(data)) {
    if (value === null || typeof value !== "object") {
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

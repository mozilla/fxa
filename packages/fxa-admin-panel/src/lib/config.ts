// This configuration is a subset of the configuration declared in server/config/index.ts
// Which config is copied over is defined in server/lib/server.ts
export interface Config {
  env: string;
  servers: {
    admin: {
      url: string;
    };
  };
}

export const config: Config = defaultConfig();

export function defaultConfig(): Config {
  return {
    env: 'development',
    servers: {
      admin: {
        url: '',
      },
    },
  };
}

export function resetConfig() {
  Object.assign(config, defaultConfig());
}

export function decodeConfig(content: string | null) {
  if (!content) {
    throw new Error('Configuration is empty');
  }
  // For development port, to prevent page from blowing
  // up in the absence of the replaced config string
  if (content === '__SERVER_CONFIG__') {
    return {};
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

export function readConfigFromMeta(headQuerySelector: headQuerySelectorType) {
  const getMetaElement = (name: string) =>
    headQuerySelector(`meta[name="${name}"]`);

  const configEl = getMetaElement(META_CONFIG);
  if (!configEl) {
    throw new Error('<meta name="fxa-config"> is missing');
  }

  updateConfig(decodeConfig(configEl.getAttribute('content')));
}

function merge(obj: { [key: string]: any }, data: { [key: string]: any }) {
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

export function updateConfig(newData: { [key: string]: any }) {
  merge(config, newData);
}

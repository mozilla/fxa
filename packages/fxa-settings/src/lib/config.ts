export interface Config {
  env: string;
  sentry: {
    url: string;
    dsn: string;
  };
  version: string | undefined;
}

export default {
  env: 'development',
  version: undefined,
  sentry: {
    url: 'https://sentry.prod.mozaws.net',
    dsn: '',
  },
} as Config;

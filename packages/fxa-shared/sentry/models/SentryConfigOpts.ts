export type SentryConfigOpts = {
  /** Name of release */
  release?: string;

  /** Fall back for name of release */
  version?: string;

  /** Sentry specific settings */
  sentry?: {
    /** The datasource name. This value can be obtained from the sentry portal. */
    dsn?: string;
    /** The environment name. */
    env?: string;
    /** The rate (as percent between 0 and 1) at which errors are sampled. Can be reduced to decrease data volume. */
    sampleRate?: number;
    /** The rate (as percent between 0 and 1) at which traces are sampled. Can be reduced to decrease data volume. */
    tracesSampleRate?: number;
    /** The name of the active client. */
    clientName?: string;
    /** The name of the active server. */
    serverName?: string;

    /** When set to true, building a configuration will throw an error critical fields are missing. */
    strict?: boolean;
  };
};

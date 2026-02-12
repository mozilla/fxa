# shared-monitoring

This library provides monitoring functionality including error tracking with Sentry and distributed tracing.

It exports the `initMonitoring` function which initializes both error monitoring (Sentry) and performance monitoring (tracing) for server applications.

## Usage

```typescript
import { initMonitoring } from '@fxa/shared/monitoring';

initMonitoring({
  log: logger,
  config: {
    tracing: {
      /* tracing config */
    },
    sentry: {
      /* sentry config */
    },
  },
});
```

## Exported APIs

- `initMonitoring(opts: MonitoringConfig)` - Initialize monitoring components
- `MonitoringConfig` - Type definition for monitoring configuration

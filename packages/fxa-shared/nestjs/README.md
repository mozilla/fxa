# NestJS Shared Components

These modules are intended to be used to avoid repeat implementations of core FxA server application features such as:

- Health routes
- Error reporting (via Sentry)
- Logging (via mozlog)
- Metrics (via hot-shots)

## Health Routes

The health routes module adds several URL routes to the current application:

- `GET /__lbheartbeat__` - Returns a basic 200 status code as long as the application is running.
- `GET /__heartbeat__` - Returns a 200 status or runs the configured health function and returns its output. The configured health function should catch its own errors as needed and throw the appropriate `HTTPException`.
- `GET /__version__` - Returns the current version information.
- `GET /__exception__` - Throws an exception, used to verify the Sentry configuration is working correctly.

Update `app.module.ts` to use the Health module:

```typescript
import { HealthModule } from 'fxa-shared/nestjs/health/health.module';
import { getVersionInfo } from 'fxa-shared/nestjs/version';

// Must be called from within the app so that the current working directory can be passed in
const version = getVersionInfo(__dirname);

@Module({
  imports: [
    // .. app imports ..

    // Default health check
    HealthModule.register({ version }),

    // Configure a custom health check, e.g. using a database helper to verify the db is
    // functioning properly.
    HealthModule.forRootAsync({
      imports: [DatabaseModule],
      inject: [DatabaseService],
      useFactory: async (db: DatabaseService) => ({
        version,
        extraHealthData: () => db.dbHealthCheck(),
      }),
    }),

    // .. remaining imports, etc.
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

**Note**: Only one `HealthModule` import from above should be used.

## Sentry Module

To use the Sentry module two code changes should be made.

Update `main.ts` to use the Sentry global intercepter:

```typescript
import { SentryInterceptor } from 'fxa-shared/nestjs/sentry/sentry.interceptor';

//...

async function bootstrap() {
  // app is initialized

  // Add sentry as error reporter
  app.useGlobalInterceptors(new SentryInterceptor());

  // remaining app setup
}
```

Update `app.module.ts` to include the Sentry module, note that we also fetch the version:

```typescript
import { SentryModule } from 'fxa-shared/nestjs/sentry/sentry.module';
import { getVersionInfo } from 'fxa-shared/nestjs/version';

// Must be called from within the app so that the current working directory can be passed in
const version = getVersionInfo(__dirname);

@Module({
  imports: [
    // .. app imports ..
    SentryModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig>) => ({
        dsn: configService.get('sentryDsn'),
        environment: configService.get('env'),
        version: version.version,
      }),
    }),
    // .. remaining imports, etc.
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

## Logging Module

The logging module only requires an import in `app.module.ts` for dependency injection, and then provides a `MozLoggerService` for logging. Because no configuration is passed in, the application's `ConfigService` must include a `log` key that returns a config object that can be passed to `mozlog`.

Update `app.module.ts` to include the Logging module:

```typescript
import { LoggerModule } from 'fxa-shared/nestjs/logger/logger.module';

@Module({
  imports: [
    // .. app imports ..
    LoggerModule,
    // .. remaining imports, etc.
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

Note that the `MozLoggerService` allows the context to be set, which will be added to the log path.

By default the logger is global, so any Nest injectable object can use it, for example a service:

```typescript
import { Injectable } from '@nestjs/common';
import { MozLoggerService } from 'fxa-shared/nestjs/logger/logger.service';

@Injectable()
export class MyExampleService {
  constructor(private log: MozLoggerService) {
    this.log.setContext(MyExampleService.name);
  }

  logStuff() {
    this.log.info('logStuff', { message: 'Logging stuff' });
  }
}
```

## Metrics

The Metrics factory creates a single `HotShotsD` instance when instantiated by NestJS. No configuration is passed in, so the application's `ConfigService` must include a `metrics` key.

Relevant section for `config.ts`:

```typescript
const conf = convict({
  // ... other config ...
  metrics: {
    host: {
      default: 'localhost',
      doc: 'Metrics host to report to',
      env: 'METRIC_HOST',
      format: String,
    },
    port: {
      default: 8125,
      doc: 'Metric port to report to',
      env: 'METRIC_PORT',
      format: Number,
    },
    prefix: {
      default: 'fxa-event-broker.',
      doc: 'Metric prefix for statsD',
      env: 'METRIC_PREFIX',
      format: String,
    },
    telegraf: {
      default: true,
      doc: 'Whether to use telegraf formatted metrics',
      env: 'METRIC_USE_TELEGRAF',
      format: Boolean,
    },
  },
});
```

Update `app.module.ts` to include the Metrics providor:

```typescript
import { MetricsFactory } from 'fxa-shared/nestjs/metrics.service';

@Module({
  imports: [
    // .. app imports ..
  ],
  controllers: [],
  providers: [MetricsFactory],
})
export class AppModule {}
```

Use the metrics instance:

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { StatsD } from 'hot-shots';
import { MozLoggerService } from 'fxa-shared/nestjs/logger/logger.service';

@Injectable()
export class MyExampleService {
  constructor(@Inject('METRICS') private metrics: StatsD) {}

  metricStuff() {
    this.metrics.increment('somecounter');
  }
}
```

See the `hot-shots` module for more details.

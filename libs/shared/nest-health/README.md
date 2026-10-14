# shared/nest-health

NestJS health routes for FxA services:

- `GET /__lbheartbeat__` - Returns a basic 200 status code as long as the application is running.
- `GET /__heartbeat__` - Returns a 200 status or runs the configured health function and returns its output. The configured health function should catch its own errors as needed and throw the appropriate `HTTPException`.
- `GET /__version__` - Returns the current version information.
- `GET /__exception__` - Throws an exception, used to verify the Sentry configuration is working correctly.

Update `app.module.ts` to use the Health module:

```typescript
import { getVersionInfo, HealthModule } from '@fxa/shared/nest-health';

// Must be called from within the app so that the current working directory can be passed in
const version = getVersionInfo(__dirname);

@Module({
  imports: [
    // Default health check
    HealthModule.register({ version }),

    // Or a custom health check, e.g. a database helper that verifies the db works.
    HealthModule.forRootAsync({
      imports: [DatabaseModule],
      inject: [DatabaseService],
      useFactory: async (db: DatabaseService) => ({
        version,
        extraHealthData: () => db.dbHealthCheck(),
      }),
    }),
  ],
})
export class AppModule {}
```

**Note**: Use only one of the `HealthModule` imports above.

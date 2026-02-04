# Jest Integration Test Infrastructure - Learnings

## Overview

This document captures learnings from setting up Jest integration tests for `fxa-auth-server` that spawn the auth server as a child process.

**Key Insight:** The auth server cannot be `require()`d directly in Jest due to ESM module compatibility issues. The solution is to spawn it as a child process.

---

## The Problem: ESM Module Incompatibility

### What We Tried (Option B - Failed)

We attempted to `require('../bin/key_server')` directly in Jest tests, which failed due to:

1. **ESM Modules in node_modules**
   - `@octokit/rest` uses ES module syntax (`import/export`)
   - `universal-user-agent` uses ES module syntax
   - Many transitive dependencies use ESM

2. **BigInt Literals**
   - Some packages use `8n` syntax (BigInt)
   - esbuild's default target (`es2018`) doesn't support BigInt

3. **Legacy Non-Strict Code**
   - `yamlparser` defines `function eval()` which is illegal in strict mode
   - Cannot be transformed by any modern bundler

### Transformers We Tried

| Transformer | Result |
|-------------|--------|
| `ts-jest` | Failed on ESM imports |
| `esbuild-jest` | Failed on BigInt, then on `yamlparser` |
| `transformIgnorePatterns: []` | Whack-a-mole with incompatible packages |

### Why Mocha Tests Work

The existing Mocha tests use `esbuild-register`:
```bash
mocha --require esbuild-register ...
```

This works because `esbuild-register` hooks into Node's module loader at runtime, transparently handling ESM. Jest's transform pipeline is different and can't achieve the same result.

---

## The Solution: Option A - Child Process

Spawn the auth server as a separate Node.js process, avoiding Jest's module system entirely.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Jest Test Process                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  test/remote/smoke.spec.ts                          │    │
│  │                                                     │    │
│  │  beforeAll: createTestServer()                      │    │
│  │    └─> spawns child process                         │    │
│  │    └─> waits for heartbeat                          │    │
│  │                                                     │    │
│  │  tests: fetch(server.publicUrl + '/v1/...')         │    │
│  │                                                     │    │
│  │  afterAll: server.stop()                            │    │
│  │    └─> kills child process                          │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP requests
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Auth Server (Child Process)                     │
│                                                              │
│  node -r esbuild-register bin/key_server.js                 │
│                                                              │
│  - Runs on dynamically allocated port                        │
│  - Uses esbuild-register for ESM support                    │
│  - Isolated from Jest's module system                       │
└─────────────────────────────────────────────────────────────┘
```

### Key Implementation Details

#### 1. Dynamic Port Allocation

```typescript
import portfinder from 'portfinder';

const authServerPort = await portfinder.getPortPromise({ port: 9000 });
```

This enables parallel test execution - each test suite gets its own port.

#### 2. Spawning with esbuild-register

```typescript
const serverProcess = spawn(
  'node',
  ['-r', 'esbuild-register', 'bin/key_server.js'],
  {
    cwd: AUTH_SERVER_ROOT,
    env: {
      ...process.env,
      NODE_ENV: 'dev',
      CONFIG_FILES: configPath,
      PORT: String(port),
    },
    stdio: printLogs ? 'inherit' : 'pipe',
  }
);
```

#### 3. Waiting for Server Ready

```typescript
async function waitForServer(url: string, maxAttempts = 30): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`${url}/__heartbeat__`);
      if (response.ok) return;
    } catch (e) {
      // Server not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error(`Server did not become ready`);
}
```

#### 4. Clean Shutdown

```typescript
stop: async () => {
  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill('SIGTERM');
    await new Promise(resolve => setTimeout(resolve, 500));
    if (!serverProcess.killed) {
      serverProcess.kill('SIGKILL');
    }
  }
}
```

---

## File Structure

```
test/
├── support/
│   ├── helpers/
│   │   ├── test-server.ts      # Spawns auth server as child process
│   │   ├── mailbox.ts          # Email fetching from mail_helper
│   │   └── profile-helper.ts   # Mock profile server
│   ├── jest-setup-integration.ts  # Jest setup (env vars, timeout)
│   └── .tmp/                   # Temp config files (gitignored)
├── remote/
│   └── smoke.spec.ts           # Example integration test
└── ...
```

---

## Jest Configuration

### jest.integration.config.js

```javascript
const baseConfig = require('./jest.config');

module.exports = {
  ...baseConfig,

  // Module mappings
  moduleNameMapper: {
    ...baseConfig.moduleNameMapper,
    '^@fxa/vendored/(.*)$': '<rootDir>/../../libs/vendored/$1/src',
  },

  // Test patterns
  testMatch: [
    '<rootDir>/test/remote/**/*.spec.ts',
    '<rootDir>/test/integration/**/*.spec.ts',
  ],

  // Longer timeout for server startup
  testTimeout: 120000,

  // Setup file
  setupFilesAfterEnv: [
    '<rootDir>/test/support/jest-setup-integration.ts',
  ],
};
```

### Key Settings

| Setting | Value | Reason |
|---------|-------|--------|
| `testTimeout` | 120000 | Server startup takes 5-10 seconds |
| `forceExit` | CLI flag | Kill hanging connections |
| `moduleNameMapper` | vendored paths | Resolve @fxa/vendored/* |

---

## Writing Integration Tests

### Test Naming Convention

**Important:** Integration tests MUST include `#integration` in the describe block name. This is used by CI to filter tests.

```typescript
// CORRECT - includes #integration tag
describe('#integration - my feature', () => {

// WRONG - missing tag, won't be recognized as integration test
describe('my feature', () => {
```

For V2 protocol tests, use `#integrationV2`:
```typescript
describe('#integrationV2 - my feature with v2 protocol', () => {
```

### Basic Pattern

```typescript
import { createTestServer, TestServerInstance } from '../support/helpers/test-server';

describe('#integration - my feature', () => {
  let server: TestServerInstance;

  beforeAll(async () => {
    server = await createTestServer();
  });

  afterAll(async () => {
    await server.stop();
  });

  it('should do something', async () => {
    const response = await fetch(`${server.publicUrl}/v1/some/endpoint`);
    expect(response.ok).toBe(true);
  });
});
```

### With Config Overrides

```typescript
beforeAll(async () => {
  server = await createTestServer({
    configOverrides: {
      signinConfirmation: { skipForNewAccounts: false },
    },
  });
});
```

### With Logging Enabled

```typescript
beforeAll(async () => {
  server = await createTestServer({
    printLogs: true,  // or set REMOTE_TEST_LOGS=true
  });
});
```

### Using Unique Emails

```typescript
it('creates an account', async () => {
  const email = server.uniqueEmail();  // e.g., "a1b2c3d4e5@restmail.net"
  // Use email in test...
});
```

---

## Running Tests

```bash
# Run all integration tests
npx jest --config jest.integration.config.js --forceExit

# Run specific test file
npx jest --config jest.integration.config.js test/remote/smoke.spec.ts --forceExit

# Run with logs
REMOTE_TEST_LOGS=true npx jest --config jest.integration.config.js --forceExit

# Run without coverage (faster)
npx jest --config jest.integration.config.js --no-coverage --forceExit
```

### CI Integration

The CI script (`scripts/test-ci.sh`) uses `TEST_TYPE` environment variable to filter tests:

```bash
# Unit tests only (excludes #integration)
TEST_TYPE=unit yarn test

# Integration tests only (includes #integration)
TEST_TYPE=integration yarn test

# V2 integration tests only (includes #integrationV2)
TEST_TYPE=integration-v2 yarn test
```

For Mocha, this uses `--grep` patterns. For Jest, we may need to use `--testNamePattern`:

```bash
# Jest equivalent for integration tests
npx jest --config jest.integration.config.js --testNamePattern="#integration" --forceExit
```

---

## Common Issues and Solutions

### 1. "Server did not become ready"

**Cause:** Server failed to start or is taking too long.

**Solutions:**
- Run with `REMOTE_TEST_LOGS=true` to see server output
- Check if required services are running (MySQL, Redis)
- Check for port conflicts

### 2. Jest doesn't exit

**Cause:** Open handles (connections, timers).

**Solution:** Always use `--forceExit` flag for integration tests.

### 3. Port conflicts

**Cause:** Previous test didn't clean up, or running multiple test suites.

**Solution:** `portfinder` handles this automatically by finding available ports.

### 4. "Cannot find module" errors

**Cause:** Missing module mappings in Jest config.

**Solution:** Add to `moduleNameMapper` in jest.integration.config.js.

---

## Dependencies Added

```bash
yarn add -D portfinder
```

Note: `@types/portfinder` doesn't exist, so we created a local type declaration at `test/support/types/portfinder.d.ts`.

---

## What NOT to Do

### Don't require the server directly

```typescript
// BAD - will fail with ESM errors
const server = require('../bin/key_server');
```

### Don't use esbuild-jest for integration tests

```typescript
// BAD - leads to whack-a-mole with incompatible packages
transform: {
  '^.+\\.[tj]sx?$': 'esbuild-jest',
},
transformIgnorePatterns: [],
```

### Don't hardcode ports

```typescript
// BAD - will conflict with parallel tests
const url = 'http://localhost:9000';

// GOOD - use dynamic port
const url = server.publicUrl;
```

---

## Comparison: Original Mocha vs New Jest

| Aspect | Mocha (Original) | Jest (New) |
|--------|------------------|------------|
| Server loading | `proxyquire` + `esbuild-register` | Child process spawn |
| Port allocation | Fixed (9000) | Dynamic (portfinder) |
| Parallelization | Not supported | Supported |
| Config overrides | Via `proxyquire` | Via temp config file |
| Module mocking | `proxyquire` | Not supported (use DI) |

---

## Future Improvements

1. **Parallel execution** - Already supported via dynamic ports, but may need `maxWorkers` tuning for CI

2. **Retry mechanism** - Add `--testRetries=2` for flaky tests

3. **Server pooling** - For faster tests, could maintain a pool of pre-started servers

4. **Better cleanup** - Track all spawned processes and ensure cleanup on test failure

---

## Summary

The key learning is that **Jest's module transformation cannot handle the auth-server's dependency tree**. The solution is to spawn the server as a child process using `node -r esbuild-register`, which:

1. Avoids Jest's module system entirely
2. Uses the same ESM handling as Mocha tests
3. Enables parallel test execution via dynamic ports
4. Provides clean isolation between test suites

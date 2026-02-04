# Jest Migration Guide for fxa-auth-server

This document captures learnings from migrating Mocha + Chai + Sinon tests to Jest + TypeScript in the fxa-auth-server package. Use this guide to continue the test migration effort.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Jest Configuration](#jest-configuration)
3. [Test File Conventions](#test-file-conventions)
4. [Assertion Conversion](#assertion-conversion)
5. [Mocking Patterns](#mocking-patterns)
6. [Shared Mocks](#shared-mocks)
7. [Known Issues & Workarounds](#known-issues--workarounds)
8. [CI Integration](#ci-integration)
9. [Step-by-Step Migration Process](#step-by-step-migration-process)
10. [Files Successfully Migrated](#files-successfully-migrated)
11. [Remote/Integration Test Migration](#remoteintegration-test-migration)
12. [Tips for AI Systems](#tips-for-ai-systems)

---

## Project Structure

```
packages/fxa-auth-server/
├── jest.config.js          # Jest configuration
├── jest.setup.js           # Global setup (runs before each test file)
├── lib/
│   ├── **/*.ts             # Source files
│   └── **/*.spec.ts        # Co-located Jest tests (NEW)
├── config/
│   └── **/*.spec.ts        # Config Jest tests (NEW)
├── test/
│   ├── local/              # Original Mocha tests (being migrated)
│   ├── mocks.js            # Shared mock factories
│   └── routes_helpers.js   # Route testing helpers
└── scripts/
    └── test-ci.sh          # CI test runner (runs both Mocha and Jest)
```

## Jest Configuration

### jest.config.js

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: [
    '<rootDir>/lib/**/*.spec.ts',
    '<rootDir>/config/**/*.spec.ts',
  ],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { isolatedModules: true }],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(@fxa|fxa-shared)/)',
  ],
  moduleNameMapper: {
    '^@fxa/shared/(.*)$': '<rootDir>/../../libs/shared/$1/src',
    '^@fxa/accounts/(.*)$': '<rootDir>/../../libs/accounts/$1/src',
    '^@fxa/payments/(.*)$': '<rootDir>/../../libs/payments/$1/src',
    '^@fxa/profile/(.*)$': '<rootDir>/../../libs/profile/$1/src',
    '^fxa-shared/(.*)$': '<rootDir>/../fxa-shared/$1',
  },
  testTimeout: 10000,
  clearMocks: true,
  setupFiles: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['/node_modules/'],
  collectCoverageFrom: [
    'lib/**/*.{ts,js}',
    'config/**/*.{ts,js}',
    '!lib/**/*.spec.{ts,js}',
    '!config/**/*.spec.{ts,js}',
    '!**/node_modules/**',
  ],
  coverageDirectory: '../../artifacts/coverage/fxa-auth-server-jest',
  coverageReporters: ['text', 'lcov', 'html'],
};
```

### jest.setup.js

```javascript
/**
 * Jest global setup - runs before each test file.
 *
 * Sets environment variable to bypass OAuth key validation during tests.
 * The config module loads keys at import time, so this must be set before
 * any test imports modules that depend on config.
 */
process.env.FXA_OPENID_UNSAFELY_ALLOW_MISSING_ACTIVE_KEY = 'true';
```

**Why this is needed:** The auth-server config module validates OAuth/OpenID keys at import time. Jest's module resolution differs from Mocha's, causing key validation to fail. This env var bypasses the validation for tests.

---

## Test File Conventions

### Naming

- **Unit tests:** `lib/**/*.spec.ts` (co-located with source)
- **Integration tests:** Files containing `verification-reminders` in the path
- **Describe block naming:** Use `#integration -` prefix for integration tests

```typescript
// Unit test
describe('butil', () => { ... });

// Integration test
describe('#integration - lib/verification-reminders', () => { ... });
```

### Separating Unit vs Integration in CI

```bash
# Unit tests (exclude integration)
jest --testPathIgnorePatterns='verification-reminders'

# Integration tests only
jest --testPathPattern='verification-reminders'
```

---

## Assertion Conversion

### Quick Reference Table

| Mocha/Chai/Assert | Jest |
|-------------------|------|
| `assert.equal(a, b)` | `expect(a).toBe(b)` |
| `assert.deepEqual(a, b)` | `expect(a).toEqual(b)` |
| `assert.strictEqual(a, b)` | `expect(a).toBe(b)` |
| `assert.ok(x)` | `expect(x).toBeTruthy()` |
| `assert.isTrue(x)` | `expect(x).toBe(true)` |
| `assert.isFalse(x)` | `expect(x).toBe(false)` |
| `assert.isNull(x)` | `expect(x).toBeNull()` |
| `assert.isUndefined(x)` | `expect(x).toBeUndefined()` |
| `assert.isDefined(x)` | `expect(x).toBeDefined()` |
| `assert.throws(fn)` | `expect(fn).toThrow()` |
| `assert.throws(fn, Error)` | `expect(fn).toThrow(Error)` |
| `assert.rejects(promise)` | `await expect(promise).rejects.toThrow()` |
| `assert.lengthOf(arr, n)` | `expect(arr).toHaveLength(n)` |
| `assert.isAbove(a, b)` | `expect(a).toBeGreaterThan(b)` |
| `assert.isBelow(a, b)` | `expect(a).toBeLessThan(b)` |
| `assert.isAtLeast(a, b)` | `expect(a).toBeGreaterThanOrEqual(b)` |
| `assert.isAtMost(a, b)` | `expect(a).toBeLessThanOrEqual(b)` |
| `assert.isObject(x)` | `expect(typeof x).toBe('object')` |
| `assert.isFunction(x)` | `expect(typeof x).toBe('function')` |
| `assert.isArray(x)` | `expect(Array.isArray(x)).toBe(true)` |
| `assert.isString(x)` | `expect(typeof x).toBe('string')` |
| `assert.isNumber(x)` | `expect(typeof x).toBe('number')` |
| `assert.include(str, substr)` | `expect(str).toContain(substr)` |
| `assert.match(str, regex)` | `expect(str).toMatch(regex)` |
| `assert.property(obj, prop)` | `expect(obj).toHaveProperty(prop)` |
| `assert.hasAllKeys(obj, keys)` | `expect(Object.keys(obj)).toEqual(expect.arrayContaining(keys))` |
| `sinon.assert.calledOnce(spy)` | `expect(spy.callCount).toBe(1)` |
| `sinon.assert.calledWith(spy, arg)` | `expect(spy.calledWith(arg)).toBe(true)` |

### Async Test Patterns

```typescript
// Before (Mocha)
it('does async thing', function(done) {
  doThing().then(result => {
    assert.equal(result, expected);
    done();
  }).catch(done);
});

// After (Jest)
it('does async thing', async () => {
  const result = await doThing();
  expect(result).toBe(expected);
});
```

---

## Mocking Patterns

### Sinon with Jest

Jest's built-in mocks can be used, but sinon works well and maintains compatibility with shared mocks. Use sinon for:

- Spies: `sinon.spy()`
- Stubs: `sinon.stub().returns(value)` or `sinon.stub().resolves(value)`
- Fakes: Complex behavior simulation

```typescript
import sinon from 'sinon';

// Stub that resolves
const stub = sinon.stub().resolves({ data: 'value' });

// Stub with different returns per call
const stub = sinon.stub();
stub.onFirstCall().resolves('first');
stub.onSecondCall().resolves('second');

// Spy on existing method
const spy = sinon.spy(object, 'method');
```

### jest.mock() for Module Mocking

Use `jest.mock()` when you need to replace entire modules (replaces proxyquire).

```typescript
// At top of file, before imports
let hashResult = '0'.repeat(40);
const mockCrypto = {
  createHash: jest.fn(() => ({
    update: jest.fn(),
    digest: jest.fn(() => hashResult),
  })),
};

jest.mock('crypto', () => mockCrypto);

// Import module AFTER jest.mock
const features = require('./features');
```

**Important:** `jest.mock()` is hoisted, so the mock definition must not depend on variables defined after the mock call.

### Proxy Pattern for Late Binding

When mock values need to change between tests:

```typescript
const cryptoRef: { current: any } = { current: null };

jest.mock('crypto', () => {
  return new Proxy({}, {
    get: (target, prop) => cryptoRef.current?.[prop],
  });
});

beforeEach(() => {
  cryptoRef.current = {
    createHash: sinon.spy(() => hash),
  };
});
```

---

## Shared Mocks

Located in `test/mocks.js`. Import and use these instead of creating inline mocks.

### Available Mock Factories

```javascript
const mocks = require('../../test/mocks');

// Database mock
const db = mocks.mockDB({
  email: 'test@example.com',
  emailVerified: true,
  uid: 'abc123',
});

// Mailer mock (legacy mailer interface)
const mailer = mocks.mockMailer();

// FxaMailer mock (TypeDI-based, auto-registers in Container)
const fxaMailer = mocks.mockFxaMailer({
  canSend: sinon.stub().resolves(true)
});

// OAuth client info mock (auto-registers in Container)
mocks.mockOAuthClientInfo();

// Account events manager mock (auto-registers in Container)
mocks.mockAccountEventsManager();

// Other available mocks
const log = mocks.mockLog();
const customs = mocks.mockCustoms();
const push = mocks.mockPush();
const glean = mocks.mockGlean();
const statsd = mocks.mockStatsd();
const verificationReminders = mocks.mockVerificationReminders();
const cadReminders = mocks.mockCadReminders();
```

### Route Testing Helper

```javascript
const { getRoute } = require('../../test/routes_helpers');

const routes = makeRoutes({ db, mailer });
const route = getRoute(routes, '/account/login');
const response = await route.handler(request);
```

### mockRequest Limitation

**IMPORTANT:** The shared `mocks.mockRequest()` uses proxyquire with relative paths that **do not work** when tests are located in `lib/`. You must use an inline mockRequest for co-located tests.

```typescript
// Inline mockRequest for tests in lib/
function mockRequest(data: any) {
  const metricsContext = data.payload?.metricsContext || {};
  return {
    app: {
      acceptLanguage: 'en-US',
      clientAddress: '63.245.221.32',
      devices: Promise.resolve([]),
      features: new Set(),
      geo: {
        timeZone: 'America/Los_Angeles',
        location: {
          city: 'Mountain View',
          country: 'United States',
          countryCode: 'US',
          state: 'California',
          stateCode: 'CA',
        },
      },
      locale: 'en-US',
      metricsContext: Promise.resolve(metricsContext),
      ua: {
        browser: 'Firefox',
        browserVersion: '57.0',
        os: 'Mac OS X',
        osVersion: '10.13',
        deviceType: null,
        formFactor: null,
      },
      isMetricsEnabled: Promise.resolve(true),
    },
    auth: { credentials: data.credentials },
    clearMetricsContext: sinon.stub(),
    emitMetricsEvent: sinon.stub().resolves(),
    emitRouteFlowEvent: sinon.stub().resolves(),
    gatherMetricsContext: sinon.stub().callsFake((d) => Promise.resolve(d)),
    headers: { 'user-agent': 'test user-agent' },
    info: { received: Date.now() - 1, completed: 0 },
    params: {},
    path: data.path,
    payload: data.payload || {},
    propagateMetricsContext: sinon.stub().resolves(),
    query: data.query || {},
    setMetricsFlowCompleteSignal: sinon.stub(),
    stashMetricsContext: sinon.stub().resolves(),
    validateMetricsContext: sinon.stub().returns(true),
  };
}
```

---

## Known Issues & Workarounds

### 1. OAuth Key Validation Failure

**Symptom:** Tests fail with "No active key found" or similar OAuth key errors.

**Solution:** The `jest.setup.js` file sets `FXA_OPENID_UNSAFELY_ALLOW_MISSING_ACTIVE_KEY=true` before tests run.

### 2. Proxyquire Path Resolution

**Symptom:** `Cannot find module './amplitude'` when using shared mocks from `test/mocks.js`.

**Cause:** The shared `mockRequest` uses proxyquire with relative paths like `'../lib/metrics/events'` which resolve differently when called from `lib/` vs `test/`.

**Solution:** Use inline mockRequest function in tests located in `lib/`. Use all other shared mocks normally.

### 3. TypeScript Module Scope Errors

**Symptom:** `Cannot redeclare block-scoped variable` errors.

**Solution:** Add `export {}` at the end of test files to make them ES modules:

```typescript
// At end of file
export {};
```

### 4. Sinon Spy vs Stub Type Mismatch

**Symptom:** TypeScript errors when assigning `sinon.spy(() => value)` to mock objects.

**Solution:** Use `sinon.stub().returns(value)` instead of `sinon.spy(() => value)`:

```typescript
// Before (type error)
const mock = { method: sinon.spy(() => 'value') };

// After (correct)
const mock = { method: sinon.stub().returns('value') };
```

### 5. TypeDI Container Cleanup

**Symptom:** Tests interfere with each other due to shared Container state.

**Solution:** Reset Container in `afterAll`:

```typescript
afterAll(() => {
  Container.reset();
});
```

### 6. Jest Timeout for Integration Tests

**Symptom:** Integration tests timeout.

**Solution:** Increase timeout at test or describe level:

```typescript
jest.setTimeout(30000);

// Or per-test
it('slow test', async () => { ... }, 30000);
```

---

## CI Integration

### How Jest Tests Run in CI

The `scripts/test-ci.sh` script runs both Mocha and Jest tests based on `TEST_TYPE`:

```bash
# Unit tests (CI: Unit Test job)
TEST_TYPE=unit scripts/test-ci.sh
# Runs: Mocha unit tests + Jest unit tests

# Integration tests (CI: Integration Test - Servers - Auth job)
TEST_TYPE=integration scripts/test-ci.sh
# Runs: Mocha integration tests + Jest integration tests
```

### CI Artifact Naming

Test results are output to `artifacts/tests/fxa-auth-server/`:

- Mocha: `fxa-auth-server-mocha-{unit|integration}-{local|oauth|remote|scripts}-results.xml`
- Jest: `fxa-auth-server-jest-{unit|integration}-results.xml`

### Running Tests Locally

```bash
# All Jest tests
yarn test:jest

# Jest unit tests only
yarn test:jest:unit

# Jest integration tests only
yarn test:jest:integration

# Jest with coverage
yarn test:jest:coverage

# Watch mode
yarn test:jest:watch

# Specific test file
npx jest lib/crypto/butil.spec.ts
```

---

## Step-by-Step Migration Process

### 1. Identify the Mocha Test File

```
test/local/crypto/butil.js → lib/crypto/butil.spec.ts
test/local/error.js → lib/error.spec.ts
test/local/features.js → lib/features.spec.ts
```

### 2. Create the Jest Test File

Create a new `.spec.ts` file next to the source file being tested.

### 3. Convert Imports

```typescript
// Before (Mocha)
const assert = require('assert');
const sinon = require('sinon');
const butil = require('../../../lib/crypto/butil');

// After (Jest)
import sinon from 'sinon';
import * as butil from './butil';
```

### 4. Convert Test Structure

```typescript
// Before (Mocha)
describe('butil', function() {
  it('does something', function() {
    assert.equal(result, expected);
  });
});

// After (Jest)
describe('butil', () => {
  it('does something', () => {
    expect(result).toBe(expected);
  });
});
```

### 5. Convert Assertions

Use the [assertion conversion table](#assertion-conversion) above.

### 6. Handle Mocking

- For simple mocks: Use sinon stubs/spies
- For module replacement: Use jest.mock()
- For shared dependencies: Use mocks from `test/mocks.js`

### 7. Run and Verify

```bash
# Run specific test
npx jest lib/crypto/butil.spec.ts --no-coverage

# Verify TypeScript compiles
npx nx compile fxa-auth-server

# Run all Jest tests
yarn test:jest
```

### 8. Compare Coverage (Optional)

```bash
# Jest coverage for specific file
npx jest lib/crypto/butil.spec.ts --coverage --collectCoverageFrom='lib/crypto/butil.ts'

# Compare with Mocha coverage for same file
```

### 9. Delete Original Mocha Test

After verifying the Jest test works and has equivalent coverage, delete the original file from `test/local/`.

---

## Files Successfully Migrated

| Original Location | New Location | Notes |
|-------------------|--------------|-------|
| `test/local/crypto/butil.js` | `lib/crypto/butil.spec.ts` | Pure unit test |
| `test/local/crypto/hkdf.js` | `lib/crypto/hkdf.spec.ts` | Async tests |
| `test/local/crypto/pbkdf2.js` | `lib/crypto/pbkdf2.spec.ts` | Async tests |
| `test/local/crypto/random.js` | `lib/crypto/random.spec.ts` | Generator tests |
| `test/local/crypto/scrypt.js` | `lib/crypto/scrypt.spec.ts` | Factory DI pattern |
| `test/local/password.js` | `lib/crypto/password.spec.ts` | Factory DI pattern |
| `test/local/time.js` | `lib/time.spec.ts` | Date/time tests |
| `test/local/getRemoteAddressChain.js` | `lib/getRemoteAddressChain.spec.ts` | Request parsing |
| `test/local/error.js` | `lib/error.spec.ts` | Error class tests |
| `test/local/authMethods.js` | `lib/authMethods.spec.ts` | Inline mocks |
| `test/local/features.js` | `lib/features.spec.ts` | jest.mock() pattern |
| `test/local/geodb.js` | `lib/geodb.spec.ts` | jest.mock() pattern |
| `test/local/config/index.js` | `config/index.spec.ts` | Env var tests |
| `test/local/verification-reminders.js` | `lib/verification-reminders.spec.ts` | Integration, Redis |
| `test/local/ip_profiling.js` | `lib/routes/ip-profiling.spec.ts` | Route tests, TypeDI |

### Remote Tests Migrated

| Original Location | New Location | Notes |
|-------------------|--------------|-------|
| `test/remote/account_create_tests.js` | `test/remote/account_create.spec.ts` | Full server integration, 62 tests (31 V1 + 31 V2) |

---

## Remote/Integration Test Migration

This section covers learnings from migrating `test/remote/` tests (which test against a running auth server) to Jest.

### Integration Test Architecture

```
packages/fxa-auth-server/
├── jest.integration.config.js      # Integration-specific Jest config
├── test/
│   ├── remote/                     # Remote tests (Jest: *.spec.ts)
│   │   └── account_create.spec.ts  # Example migrated test
│   ├── integration/                # Integration tests (Jest: *.spec.ts)
│   └── support/
│       ├── jest-setup-env.ts       # Runs BEFORE test environment (env vars)
│       ├── jest-setup-integration.ts # Runs AFTER test environment (timeouts)
│       ├── jest-global-setup.ts    # Global setup (mail_helper, key generation)
│       ├── jest-global-teardown.ts # Global teardown (cleanup)
│       └── helpers/
│           ├── test-server.ts      # Auth server spawn helper
│           ├── mailbox.ts          # Email retrieval helper
│           └── profile-helper.ts   # Profile server mock
```

### Critical: setupFiles vs setupFilesAfterEnv

**This is the most important lesson from integration test migration.**

Jest has two setup file options with different timing:

| Option | When it runs | Use for |
|--------|--------------|---------|
| `setupFiles` | BEFORE test environment | Environment variables that affect module loading |
| `setupFilesAfterEnv` | AFTER test environment | Custom matchers, extended timeouts |

**The Problem:** The auth server's config module loads OAuth keys at import time based on `NODE_ENV`. If `NODE_ENV=dev` is not set BEFORE modules load, the wrong config is loaded and JWT signing fails.

**The Solution:**

```javascript
// jest.integration.config.js
module.exports = {
  // Setup env vars BEFORE test environment (affects module loading)
  setupFiles: [
    '<rootDir>/test/support/jest-setup-env.ts',
  ],
  // Setup file AFTER test environment (custom matchers, timeouts)
  setupFilesAfterEnv: [
    '<rootDir>/test/support/jest-setup-integration.ts',
  ],
};
```

```typescript
// test/support/jest-setup-env.ts
// Set NODE_ENV to dev to load dev config (including OAuth keys)
process.env.NODE_ENV = 'dev';

// Bypass OAuth key validation check in case keys don't exist yet
process.env.FXA_OPENID_UNSAFELY_ALLOW_MISSING_ACTIVE_KEY = 'true';
```

### Global Setup: Key Generation and mail_helper

Integration tests require:
1. **Auth signing keys** (public-key.json, secret-key.json)
2. **OAuth signing keys** (key.json, oldKey.json)
3. **mail_helper** running to capture emails

All these are set up ONCE in `jest-global-setup.ts`:

```typescript
// test/support/jest-global-setup.ts
import { spawn, execSync } from 'child_process';

function generateKeysIfNeeded(): void {
  const genKeysScript = path.join(AUTH_SERVER_ROOT, 'scripts', 'gen_keys.js');
  const oauthGenKeysScript = path.join(AUTH_SERVER_ROOT, 'scripts', 'oauth_gen_keys.js');

  // Generate auth keys
  try {
    execSync(`node -r esbuild-register ${genKeysScript}`, {
      cwd: AUTH_SERVER_ROOT,
      env: { ...process.env, NODE_ENV: 'dev' },
      stdio: 'inherit',
    });
  } catch (e) {
    // Script exits with error if keys already exist, which is fine
  }

  // Generate OAuth keys
  try {
    execSync(`node -r esbuild-register ${oauthGenKeysScript}`, {
      cwd: AUTH_SERVER_ROOT,
      env: {
        ...process.env,
        NODE_ENV: 'dev',
        FXA_OPENID_UNSAFELY_ALLOW_MISSING_ACTIVE_KEY: 'true',
      },
      stdio: 'inherit',
    });
  } catch (e) {
    // Script exits with error if keys already exist, which is fine
  }
}

export default async function globalSetup() {
  generateKeysIfNeeded();

  // Spawn mail_helper as detached process
  const mailHelperProcess = spawn(
    'node',
    ['-r', 'esbuild-register', 'test/mail_helper.js'],
    {
      cwd: AUTH_SERVER_ROOT,
      env: { ...process.env, NODE_ENV: 'dev', MAILER_HOST: '0.0.0.0' },
      stdio: 'ignore',
      detached: true,
    }
  );

  // Save PID for teardown
  fs.writeFileSync(PID_FILE, String(mailHelperProcess.pid));
  mailHelperProcess.unref();
}
```

### Test Server Configuration: Rate Limiting Bypass

**Problem:** Tests fail with "Client has sent too many requests" because the auth server's rate limiting kicks in.

**Solution:** Configure rate limiting bypass in test-server.ts:

```typescript
// test/support/helpers/test-server.ts
const fullOverrides = {
  ...configOverrides,
  // Disable customs service entirely
  customsUrl: 'none',
  // Disable rate limiting
  rateLimit: {
    ...baseConfig.rateLimit,
    checkAllEndpoints: false,
    ignoreIPs: ['127.0.0.1', '::1', 'localhost'],
  },
};
```

### Source Code Fixes Required

During migration, you may discover source code bugs that weren't exposed by Mocha tests:

#### 1. stripeHelper Undefined Check

When subscriptions are disabled, `stripeHelper` is undefined. The code must handle this:

```typescript
// lib/routes/utils/account.ts - BEFORE
const hasActiveSubscription = await stripeHelper.hasActiveSubscription(uid);

// lib/routes/utils/account.ts - AFTER
const hasActiveSubscription = stripeHelper
  ? await stripeHelper.hasActiveSubscription(uid)
  : false;
```

#### 2. CommonJS vs ES6 Module Imports

The jwt module uses CommonJS exports, not ES6 default exports:

```typescript
// WRONG - jwt is undefined
const jwt = require('../../lib/oauth/jwt').default;

// CORRECT
const jwt = require('../../lib/oauth/jwt');
```

### Understanding Config-Driven Test Behavior

**Lesson:** Always verify what the actual config values are, not what you assume they are.

Example: The test "cannot stub the same account twice" was failing because with `accountDestroy.onCreateIfUnverified: true` (the default), re-stubbing IS allowed.

**How to verify config values:**

```bash
NODE_ENV=dev node -r esbuild-register -e "
const { config } = require('./config');
console.log('onCreateIfUnverified:', config.get('accountDestroy.onCreateIfUnverified'));
"
```

**Fixing the test:**

```typescript
// BEFORE - Wrong expectation based on assumed behavior
it('cannot stub the same account twice', async () => {
  await expect(stub()).rejects.toThrow();
});

// AFTER - Correct expectation based on actual config
it('can re-stub an unverified account', async () => {
  const first = await stub();
  const second = await stub();
  expect(second.uid).not.toBe(first.uid);  // New UID is generated
});
```

### Comparing Mocha vs Jest Implementation

When a test behaves differently, compare the Mocha implementation:

1. Read the Mocha test file to understand expected behavior
2. Check if there are config differences between test environments
3. Verify the actual runtime behavior matches the test expectations
4. Update the Jest test to match correct behavior, not just copy the old test

### Running Integration Tests

```bash
# Run all integration tests
yarn test:jest:integration

# Run specific test file
npx jest --config jest.integration.config.js test/remote/account_create.spec.ts

# Enable mail_helper logs for debugging
MAIL_HELPER_LOGS=true yarn test:jest:integration

# Run with verbose output
yarn test:jest:integration --verbose
```

### Common Integration Test Issues

| Issue | Symptom | Solution |
|-------|---------|----------|
| JWT signing fails | "secretOrPrivateKey must have a value" | Ensure NODE_ENV=dev in setupFiles |
| Rate limiting | "Client has sent too many requests" | Add customsUrl: 'none' and rateLimit config |
| stripeHelper undefined | "Cannot read properties of undefined" | Add null checks in source code |
| Keys not found | "No active key found" | Run key generation in globalSetup |
| mail_helper not running | Email retrieval timeouts | Check globalSetup spawns mail_helper |
| Wrong test expectations | Tests fail but code is correct | Verify config values and expected behavior |

---

## Tips for AI Systems

1. **Always read the source file first** before converting its test
2. **Check for factory pattern DI** - many modules export a factory function that takes (log, config)
3. **Use shared mocks** from `test/mocks.js` except for mockRequest
4. **Keep inline mockRequest** for tests in `lib/` directory
5. **Add `export {}` at end** if you get module scope errors
6. **Use `sinon.stub()` not `sinon.spy()`** for mock return values
7. **Check for TypeDI usage** - may need Container setup/teardown
8. **Integration tests** should have `#integration -` in describe block
9. **Run TypeScript compile check** after creating tests: `npx nx compile fxa-auth-server`
10. **Compare coverage** to ensure test quality is maintained

### Additional Tips for Remote/Integration Tests

11. **Use `setupFiles` for early env vars** - NODE_ENV must be set before modules load
12. **Verify config values at runtime** - Don't assume, use `config.get()` to check actual values
13. **Disable rate limiting in tests** - Set `customsUrl: 'none'` and `rateLimit.ignoreIPs`
14. **Handle optional dependencies** - Check if `stripeHelper`, `pushbox`, etc. are undefined
15. **Compare with Mocha tests** - When behavior differs, read the original test to understand intent
16. **Check for CommonJS vs ES6 exports** - Use `require('module')` not `require('module').default` for CommonJS

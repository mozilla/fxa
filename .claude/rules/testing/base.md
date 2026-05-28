---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "**/*.spec.ts"
---

# FXA Testing Rules

Applies whenever you read or edit a Jest test file in FXA. These are the same rules the testing skills (`/fxa-test-draft`, `/fxa-test-repair`, `/fxa-test-independence`) and the review skills (`/fxa-review`, `/fxa-review-quick`) enforce — load them on every test-file touch so they apply to ad-hoc edits, not only skill-invoked workflows.

For React component tests (`*.test.tsx`), additional React-specific rules load from `.claude/rules/testing/react.md`.

**Shift-left is a golden goal**, not a hard rule. The full guidance — which layer to test at, when to extract business logic into a pure function or hook — lives in `CLAUDE.md` Section 8 and loads at session start. While editing a test file, the practical heuristic to keep in mind: when a route or component has more than ~3 tests differing only in input shape, flag the opportunity to extract the rule and unit-test it directly.

---

## Rules

Each rule includes the intent, a violation example, and the correct pattern.

---

### 1. Name tests for what they assert

Test names should make the assertion self-evident. Don't assert behavior outside the scope of the name. Don't bury multiple cases inside one `it()` body — each named test should describe exactly one observable behavior.

```ts
// Violation — vague name, over-reaching assertions
it('works', () => {
  const result = createSession(user);
  expect(result.uid).toBe(user.uid);
  expect(result.createdAt).toBeDefined();
  expect(db.createSession).toHaveBeenCalled();
});

// Correct — each test owns exactly one assertion surface
it('returns a session with the user uid', () => {
  const result = createSession(user);
  expect(result.uid).toBe(user.uid);
});

it('persists the session to the database', () => {
  createSession(user);
  expect(db.createSession).toHaveBeenCalledWith(
    expect.objectContaining({ uid: user.uid })
  );
});

// Violation — `forEach` inside one `it` hides which case fails; the first failure
// kills the loop, leaving later cases untested even after the bug is fixed
it('returns the right discount per tier', () => {
  [
    { tier: 'free', expected: 0.0 },
    { tier: 'pro', expected: 0.1 },
    { tier: 'enterprise', expected: 0.2 },
  ].forEach(({ tier, expected }) => {
    expect(getDiscount({ tier })).toBe(expected);
  });
});

// Correct — `it.each` produces one named test per case; each is independently reportable
it.each([
  { tier: 'free', expected: 0.0 },
  { tier: 'pro', expected: 0.1 },
  { tier: 'enterprise', expected: 0.2 },
])('returns a $expected discount for the $tier tier', ({ tier, expected }) => {
  expect(getDiscount({ tier })).toBe(expected);
});
```

---

### 2. Cover all paths

All happy paths and error cases require tests. Call out when testing is difficult due to code complexity or anti-patterns rather than skipping coverage.

**Don't only `mockResolvedValue`.** A common pattern is to stub every external dependency with success-only mocks and never exercise the rejection paths. Every dependency that can fail in production needs at least one `mockRejectedValue` test for the consumer's error-handling behavior — otherwise the catch/error-mapping/recovery code is silently uncovered.

```ts
// Happy path
it('returns the account when found', async () => {
  db.getAccountByEmail.mockResolvedValue(MOCK_ACCOUNT);
  const result = await getAccount('user@example.com');
  expect(result).toEqual(MOCK_ACCOUNT);
});

// Error case — null result
it('throws NotFound when the account does not exist', async () => {
  db.getAccountByEmail.mockResolvedValue(null);
  await expect(getAccount('missing@example.com')).rejects.toThrow(
    AppError.unknownAccount()
  );
});

// Error case — dependency rejection (often missed)
it('wraps a DB connection failure in AppError.backendServiceFailure', async () => {
  db.getAccountByEmail.mockRejectedValue(new Error('ECONNREFUSED'));
  await expect(getAccount('user@example.com')).rejects.toThrow(
    AppError.backendServiceFailure()
  );
});
```

---

### 3. Tests are first-class

A reader should be able to infer the intent and expected behavior from tests alone, without reading the implementation.

```ts
// Violation — requires reading the implementation to understand
it('handles the flag', async () => {
  const result = await processAccount(MOCK_ACCOUNT, true);
  expect(result.status).toBe(2);
});

// Correct — intent is self-evident
it('marks the account as verified when verifyEmail is true', async () => {
  const result = await processAccount(MOCK_ACCOUNT, { verifyEmail: true });
  expect(result.status).toBe(ACCOUNT_STATUS.VERIFIED);
});
```

---

### 4. Trust, but verify

Use tests to verify changes. When tests and implementation disagree, investigate — never assume one is automatically correct over the other. "Fixing" a test by changing the assertion to match a buggy implementation hides regressions.

```ts
// Implementation:
function getDiscount(plan: Plan): number {
  return plan.tier === 'enterprise' ? 0.2 : 0.1;
}

// Violation — assertion was edited to match the implementation without
// confirming which side was wrong
it('applies a 20% discount for enterprise plans', () => {
  expect(getDiscount({ tier: 'enterprise' })).toBe(0.1); // silently masks the bug
});

// Correct — assertion expresses the intended behavior; if it fails, the
// engineer investigates the implementation rather than mutating the test
it('applies a 20% discount for enterprise plans', () => {
  expect(getDiscount({ tier: 'enterprise' })).toBe(0.2);
});
```

---

### 5. Mock at system boundaries, not internals

Mock external dependencies (DB, Redis, email, external APIs). Use real implementations for internal helpers within the same package. Over-mocking produces tests that only verify mock wiring and obscures the behavior the test should be exercising — when in doubt, mock less.

**Tautological mocks are not tests.** A test that mocks a function to return `X` and then asserts the result is `X`, with no real logic between the mock and the assertion, just verifies the mock plumbing — not the unit under test. If everything in the call path is mocked, there is no behavior left to exercise.

```ts
// Violation — mocking an internal helper in the same package
jest.mock('./validation', () => ({
  validateEmail: jest.fn().mockReturnValue(true),
}));

// Correct — mocking at the DB boundary
const mockDB = { getAccountByEmail: jest.fn() };
jest.mock('../db', () => mockDB);

// Violation — tautological; the only logic exercised is mock plumbing
discountService.getDiscount.mockResolvedValue(0.2);
const result = await discountService.getDiscount('enterprise');
expect(result).toBe(0.2);

// Correct — the mock supplies an input; the unit under test still does real work
db.getPlan.mockResolvedValue({ tier: 'enterprise', baseRate: 100 });
const result = await calculateMonthlyRate('user-123');
expect(result).toBe(80); // baseRate - (baseRate * enterpriseDiscount)
```

---

### 6. Use real types in mocks

Type mocks against the real interface they replace. `any` is acceptable when the real type is too cumbersome to satisfy, but typed mocks couple the test to the unit under test — when the underlying interface changes, the test fails with a clear type error instead of silently passing on a stale shape.

```ts
// Violation — untyped, will not break when AccountsDb changes shape
const mockDb = {
  getAccountByEmail: jest.fn(),
};

// Correct — coupled to the real interface, breaks on contract drift
import type { AccountsDb } from '../db';
const mockDb: jest.Mocked<Pick<AccountsDb, 'getAccountByEmail'>> = {
  getAccountByEmail: jest.fn(),
};
```

---

### 7. Tests must be independent and order-agnostic

No shared mutable state between tests. Each test owns its setup; use `beforeEach` for resets.

`jest.clearAllMocks()` in `beforeEach` is redundant **only** when the package's Jest config sets `clearMocks: true`. At time of writing, only `fxa-auth-server` and `fxa-profile-server` set this; the root Jest preset does not. Before flagging it as redundant, check the relevant package's `jest.config.*` — removing it from a package without that setting will silently leak mock state between tests.

**Mid-test mock resets are a smell.** Calling `mockClear()`, `mockReset()`, `jest.clearAllMocks()`, or `jest.resetAllMocks()` inside an `it()` body is almost always a band-aid hiding state leakage from a prior test or from shared setup — fix the leak (scope the mock per-test, move it into `beforeEach`, stop sharing module-level mocks across describes) instead of clearing inline. The narrow legitimate case is asserting "no further calls happened after this point" in a multi-phase test; in that case, leave a comment explaining why.

**TypeDI Container cleanup is conditional**, not mechanical. Pair `Container.set()` with cleanup *when leakage could change another test's observable behavior*:

- **`afterEach` reset required** when the consumer resolves from Container at test execution time — most unit tests, route handlers tested directly, and lazy `mocks.js`-style factory helpers. A leaked set in test A is observable in test B.
- **`afterAll` cleanup sufficient** when the consumer captures deps at construction (server-boot integration tests). The running server holds its own captured references; per-test reset has no effect on its behavior. File-level cleanup still matters for cross-file isolation.
- **Cleanup optional** for empty-stub "satisfy DI" sets (`Container.set(Token, {})`) and intentionally global tokens (file-wide loggers, configs) — both lack test-observable meaning to leak. Prefer fixing the consumer to tolerate the absent dep over leaving the unpaired set.

When in doubt, default to `afterEach` + `Container.reset()` — cheap, complete, and catches tokens you'd otherwise forget.

**Container reference identity matters across `jest.resetModules()`.** A fresh `require('typedi')` after a module reset hands back a different Container; calling `remove()` on it silently no-ops because the entry was set on the prior instance. Capture `const { Container } = require('typedi')` at module or describe scope so both hooks reference the same instance.

```ts
// Violation — shared mutable state, order-dependent
let account: Account;
beforeAll(() => { account = createAccount(); });
it('can update email', () => { account.email = 'new@example.com'; });
it('has the original email', () => {
  expect(account.email).toBe('original@example.com'); // fails if prior test ran first
});

// Correct — each test resets to a known state
let account: Account;
beforeEach(() => { account = { ...MOCK_ACCOUNT }; });

// Violation — band-aid mid-test reset hides state leaking in from another test
it('sends one email per signup', () => {
  jest.clearAllMocks(); // why is this needed here? root cause is elsewhere
  signup(MOCK_ACCOUNT);
  expect(mailer.send).toHaveBeenCalledTimes(1);
});

// Correct — mock state is reset uniformly via beforeEach (or clearMocks: true)
beforeEach(() => { jest.clearAllMocks(); });
it('sends one email per signup', () => {
  signup(MOCK_ACCOUNT);
  expect(mailer.send).toHaveBeenCalledTimes(1);
});
```

---

### 8. Assert explicitly

Prefer exact values and shapes over loose matchers. Vague assertions hide regressions.

**Soft matchers are a smell.** `expect.anything()`, `expect.any(Object)`, and broad `expect.objectContaining({})` with one trivial key are usually a way to make a flaky or evolving test pass without committing to a contract. They don't catch regressions in the un-asserted fields. Use specific values; reach for `expect.any(<Type>)` only on fields that are genuinely non-deterministic (timestamps, randomly generated IDs) and use `objectContaining` only when you intentionally want to ignore unrelated fields — name the assertion accordingly.

```ts
// Violation — passes for almost any object shape, hides regressions
expect(result).toBeTruthy();
expect(error).toBeDefined();
expect(result).toEqual(expect.objectContaining({ uid: expect.anything() }));
expect(mailer.send).toHaveBeenCalledWith(expect.any(Object));

// Correct — exact shape; `expect.any(...)` only on truly non-deterministic fields
expect(result).toEqual({
  uid: MOCK_UID,
  email: 'user@example.com',
  createdAt: expect.any(Number),
});
expect(error).toBeInstanceOf(AppError);
expect(error.errno).toBe(102);
expect(mailer.send).toHaveBeenCalledWith({
  to: 'user@example.com',
  subject: 'Verify your email',
  templateValues: { code: MOCK_VERIFICATION_CODE },
});
```

---

### 9. Test behavior, not implementation

Test through public interfaces. Avoid asserting on private state or calling private methods.

```ts
// Violation — couples test to internal structure
expect((authService as any)._tokenCache.size).toBe(1);

// Correct — tests observable behavior through the public API
const token = await authService.createToken(user);
await expect(authService.validateToken(token)).resolves.toEqual(
  expect.objectContaining({ uid: user.uid })
);
```

---

### 10. Test async code correctly

Always `await` async operations. Use `jest.useFakeTimers()` + `jest.setSystemTime()` over real timers or `setTimeout` hacks. Un-awaited assertions pass vacuously.

**Manually bumped timeouts are a bug indicator.** `it('...', async () => {...}, 30_000)` or `jest.setTimeout(30_000)` for a single file usually means the test is using a real timer, hitting an unmocked I/O dependency, or polling for state. Fix the underlying issue — fake the timer, mock the dependency, or rewrite the wait — instead of bumping the timeout. Long-running integration tests that genuinely need a higher ceiling should be in an integration suite, not unit tests.

```ts
const MOCK_NOW = 1_700_000_000_000;

// Violation — missing await, passes vacuously
it('rejects on invalid input', () => {
  expect(validateToken('')).rejects.toThrow();
});

// Violation — real timer, slow and flaky
it('expires after 1 hour', (done) => {
  setTimeout(() => { expect(token.isExpired()).toBe(true); done(); }, 3_600_000);
});

// Correct
it('rejects on invalid input', async () => {
  await expect(validateToken('')).rejects.toThrow(AppError.invalidToken());
});

it('expires after 1 hour', () => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date(MOCK_NOW + 3_600_000));
  expect(token.isExpired()).toBe(true);
  jest.useRealTimers();
});
```

---

### 11. Prefer deterministic test values

Use hardcoded or factory-generated constants for UIDs, tokens, timestamps, and identifiers. Avoid `Math.random()`, `uuid()`, `Date.now()` in test setup — reserve randomness for tests that explicitly exercise randomness-dependent behavior.

```ts
// Violation
const uid = uuid();
const token = crypto.randomBytes(32).toString('hex');
const createdAt = Date.now();

// Correct
const MOCK_UID = 'f9416ce3703e4916a4cd6b1e665a3f1a';
const MOCK_SESSION_TOKEN = 'a'.repeat(64);
const MOCK_CREATED_AT = 1_700_000_000_000;
```

---

### 12. Leave things better than you found them

When adding tests to an existing file, write new tests to these standards. Don't blindly copy existing patterns that violate these rules. Note violations in existing tests and suggest `/fxa-test-repair` — but don't rewrite them wholesale unless that's explicitly in scope.

---

### 13. No focused tests in commits; skipped tests need a reason

**Focused tests must never be committed.** `it.only`, `describe.only`, `fit`, and `fdescribe` cause Jest to silently skip everything else in the file or suite, shrinking the safety net to a single test. A passing CI run on one focused test gives false confidence. These are debugging tools — strip them before commit.

**Skipped tests are acceptable when justified.** `it.skip`, `xit`, `xdescribe`, and `it.todo` are fine in committed code *only* when accompanied by a comment explaining **why** the test is skipped. Prefer a follow-up reference (Jira ticket, GitHub issue) so the skip is trackable; at minimum, a short rationale that lets a future reader decide whether the skip is still warranted. An unjustified `.skip` rots into permanent dead weight — if there's no plan to re-enable it and no reason worth recording, delete the test instead. Suggest creating a ticket to track the work if there is no existing one.

```ts
// Violation — focused tests, never commit
it.only('returns the user', () => {...});
fit('throws on missing email', () => {...});

// Violation — disabled with no explanation; will never be re-enabled
it.skip('throws on missing email', () => {...});
xit('throws on missing email', () => {...});

// Violation — placeholder with no reason or owner
it.todo('throws on missing email');

// Correct — skip is justified and trackable
// Skipped pending FXA-12345: rate-limiter mock collides with the global timer reset.
it.skip('throttles after 3 attempts', () => {...});

// Also correct — short rationale for an unfixable-here skip
// Disabled in CI: depends on a real Stripe sandbox the runner cannot reach.
// Run locally with STRIPE_SANDBOX=1.
it.skip('processes a live Stripe webhook', () => {...});

// Correct — placeholder paired with a tracking reference
// FXA-13700: implement once the new email-template renderer lands.
it.todo('renders the verification email in French');
```

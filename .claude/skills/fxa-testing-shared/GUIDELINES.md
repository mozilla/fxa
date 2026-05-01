# FXA Testing Guidelines

Shared reference for `fxa-test-draft`, `fxa-test-repair`, and `fxa-test-independence`. Each rule includes the intent, a violation example, and the correct pattern.

---

### 1. Name tests for what they assert

Test names should make the assertion self-evident. Don't assert behavior outside the scope of the name.

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
```

---

### 2. Cover all paths

All happy paths and error cases require tests. Call out when testing is difficult due to code complexity or anti-patterns rather than skipping coverage.

```ts
// Happy path
it('returns the account when found', async () => {
  db.getAccountByEmail.mockResolvedValue(MOCK_ACCOUNT);
  const result = await getAccount('user@example.com');
  expect(result).toEqual(MOCK_ACCOUNT);
});

// Error case
it('throws NotFound when the account does not exist', async () => {
  db.getAccountByEmail.mockResolvedValue(null);
  await expect(getAccount('missing@example.com')).rejects.toThrow(
    AppError.unknownAccount()
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

### 4. Mock at system boundaries, not internals

Mock external dependencies (DB, Redis, email, external APIs). Use real implementations for internal helpers within the same package. Over-mocking produces tests that only verify mock wiring.

```ts
// Violation — mocking an internal helper in the same package
jest.mock('./validation', () => ({
  validateEmail: jest.fn().mockReturnValue(true),
}));

// Correct — mocking at the DB boundary
const mockDB = { getAccountByEmail: jest.fn() };
jest.mock('../db', () => mockDB);
```

---

### 5. Tests must be independent and order-agnostic

No shared mutable state between tests. Each test owns its setup; use `beforeEach` for resets. `jest.clearAllMocks()` in `beforeEach` is redundant — `clearMocks: true` is set globally.

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
```

---

### 6. Assert explicitly

Prefer exact values and shapes over loose matchers. Vague assertions hide regressions.

```ts
// Violation
expect(result).toBeTruthy();
expect(error).toBeDefined();

// Correct
expect(result).toEqual({ uid: MOCK_UID, email: 'user@example.com' });
expect(error).toBeInstanceOf(AppError);
expect(error.errno).toBe(102);
```

---

### 7. Test behavior, not implementation

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

### 8. Test async code correctly

Always `await` async operations. Use `jest.useFakeTimers()` + `jest.setSystemTime()` over real timers or `setTimeout` hacks. Un-awaited assertions pass vacuously.

```ts
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
  jest.setSystemTime(Date.now() + 3_600_000);
  expect(token.isExpired()).toBe(true);
  jest.useRealTimers();
});
```

---

### 9. Prefer deterministic test values

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

### 10. Leave things better than you found them

When adding tests to an existing file, write new tests to these standards. Don't blindly copy existing patterns that violate these rules. Note violations in existing tests and suggest `/fxa-test-repair` — but don't rewrite them wholesale unless that's explicitly in scope.

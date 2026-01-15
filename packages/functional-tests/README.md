# Firefox Accounts - functional test suite

## Playwright Test

The suite uses [Playwright Test](https://playwright.dev/docs/intro). Also check out the [API reference](https://playwright.dev/docs/api/class-test).

## Target environments

The environments that this suite may run against are:

- local
- stage
- production

Each has its own named script in [package.json](./package.json) or you can use `--project` when running `playwright test` manually. They are implemented in `lib/targets`.

### Running the tests

If this is your first time running the tests, run `npx playwright install --with-deps` to install the browsers. Then:

- `yarn test` will run the tests against your localhost using the default configuration.
- `yarn playwright test` will let you set any of the [cli options](https://playwright.dev/docs/test-cli#reference)
- You can also add cli options after any of the npm scripts

For example, to run a specific test against stage:

```
yarn test --project=stage --grep="errors on xss redirect_to parameter"
```

### Specifying a target in tests

Some tests only work with certain targets. The content-server mocha tests for example will only work on `local`. Use [annotations](https://playwright.dev/docs/test-annotations#annotations) and [TestInfo](https://playwright.dev/docs/api/class-testinfo) to determine when a test should run.

Example:

```ts
test('mocha tests', async ({ target, page }, info) => {
  test.skip(info.project.name !== 'local', 'mocha tests are local only');
  //...
});
```

## Creating new tests

`codegen` is a convenient way to start with when creating a new test. Using the codegen command runs the test generator followed by the URL of the website you want to generate tests for. It opens up two windows, a browser window where you interact with the website you wish to test and the Playwright Inspector window where you can record your tests and then copy them into your editor. More info on `codegen` and other options to start with a new test can be found [here](https://playwright.dev/docs/codegen#generate-tests-with-the-playwright-inspector)

Example:

```ts
npx playwright codegen localhost:3030
```

## Fixtures

We have a standard [fixture](https://playwright.dev/docs/test-fixtures) module for the most common functions needed in tests.

Its job is to make the following functionalities available:

- target: connect to the target environment
- pages & syncBrowserPages: create the POMs
- testAccountTracker: create and destroy accounts with automatic TOTP cleanup

Make these fixtures available in test files by declaring the following:

```ts
import { test } from '../lib/fixtures/standard';
```

Other fixtures may be added as needed.

## Account Cleanup and TOTP

The `testAccountTracker` fixture automatically handles account cleanup after tests complete, including accounts with Two-Factor Authentication (TOTP) enabled.

### Automatic TOTP Cleanup & Fail-Fast Error Handling

All tests, regardless of success of failure will be cleaned up using `TestAccountTracer.destroyAllAccounts()`

This naively does the following:

1. Fetches a new session token
2. Uses `/session/status` to determine if the token meets minimum AAL for the account
3. Elevates the token if necessary
4. Checks if 2FA is enabled
5. Disconnects 2FA if enabled
6. Destroys the account

The cleanup automatically handles session verification and token refresh if needed.

**Tests FAIL immediately** if any account cleanup fails, and the error message includes the account so it can be destroyed in Admin Panel.

### Best Practices

- **Handle blocked accounts manually** in tests that create them (accounts with `blocked` email prefix)
- **Use `disconnectTotp()` explicitly** in tests for cases where a flow is testing behavior after disconnect.
- **Always use `totp` page** functions to setup 2FA. These functions require `Credentials` object and attach the secret for cleanup later.

Example:

```ts
test('totp test with proper cleanup', async ({
  pages: { settings, totp },
  testAccountTracker,
}) => {
  const credentials = await testAccountTracker.signUp();

  // Set up TOTP
  await settings.totp.addButton.click();
  await totp.setUpTwoStepAuthWithQrCodeNoRecoveryChoice(credentials); //<- pass in `Credentials`

  // Test TOTP functionality...
});
// `testAccountTracker` cleanup will use secret attached to Credentials to destroy the account
```

### MFA Guard

To support increased security, there are multiple locations that have an MFA Guard wrapping them within settings. If your test needs to interact with or bypass this, there are two options.

Option 1: `settings.confirmMfaGuard()`

- This will perform the manual actions to fetch the sent code from the mail client, input the code, and click confirm.

Use this option when you want or need to test that the guard is at the right point, and can continue onto the next page or action after confirmation. This is similar to the user performing the actual action with the guard.

Example:

```ts
test('My test 2', async ({
  target,
  pages: { page, settings },
  testAccountTracker,
}) => {
  const credentials = await testAccountTracker.signUp();
  // perform other actions to the point where a guard is expected, then call confirmMfaGuard
  await settings.confirmMfaGuard();
});
```

Option 2: `testAccountTracker.signUpAndPrimeMfa({...})`

- This performs a few actions, setting up the test account and getting MFA tokens ready. Use this in place of the standard `testAccountTracker.signUp()`. By using this, you can fetch multiple MFA tokens with different scopes, which are then set in the MFA localStorage cache.

Use this if you want to have the tokens taken care of and not worry about the MFA Guard. This is similar to a user having already confirmed the guard and then returning to perform an action.

Example:

```ts
test('My test 1', async ({
  target,
  pages: { page, settings },
  testAccountTracker,
}) => {
  const credentials = await testAccountTracker.signUpAndPrimeMfa({
    scopes: 'email', // scopes can be single or array
  });
  // Rest of test can proceed as normal without the guard showing
});
```

### Clearing JWT Cache

If you have a need to clear the cache mid-test, you can use this:

```typescript
test('My test 1', async ({
  target,
  pages: { page, settings },
  testAccountTracker,
}) => {
  // setup, other steps of test
  // now, clear JWT cache for specific token
  await testAccountTracker.clearJwtCache('email');
  /*
  alternatively, clear for multiple tokens...
  await testAccountTracker.clearJwtCache(['email', '2fa']);

  or clear all tokens...
  await testAccountTracker.clearJwtCache();

  Rest of test can proceed as normal without the guard showing
  */
});
```

## Page Object Models (POMs)

To keep the tests readable and high-level we use the [page object model](https://playwright.dev/docs/test-pom) pattern. Pages are organized by url "route" when possible in the `pages` directory, and made available to tests in the fixture as `pages`.

Example:

```ts
test('signup web', async ({ pages: { signup } }) => {
  // signup is a POM at pages/signup.ts
  await signup.goto();
  //...
});
```

For guidance on writing POMs there's [pages/README.md](./pages/README.md)

## Group by severity

Test cases are grouped by [severity](https://wiki.mozilla.org/BMO/UserGuide/BugFields#bug_severity) (1-4) so that it's easy to identify the impact of a failure.

Use `test.describe('severity-#', ...)` to designate the severity for a group of tests. For example:

```ts
test.describe('severity-1', () => {
  test('create an account', async ({ pages: { login } }) => {
    //...
  });
});
```

Avoid adding extra steps or assertions to a test for lower severity issues. For example, checking the placement of a tooltip for a validation error on the change password form should be a separate lower severity test from the S1 test that ensures the password can be changed at all. It's tempting to check all the functionality for a component in one test, since we're already there, but it makes high severity tests run slower and harder to determine the actual severity when a test fails. Grouping related assertions at the same severity level within a single test is ok. We want to be able to run S1 tests and not have them fail for an S4 assertion.

If you're unsure about which severity to group a test in use `severity-na` and we'll triage those periodically.

### Running tests by severity

To run only the tests from a particular severity use the `--grep` cli option.

Examples:

- Just S1
  - `--grep=severity-1`
- S1 and S2
  - `--grep="severity-(1|2)"`
- All except NA
  - `--grep-invert=severity-na`

## Debugging

Playwright Test offers great debugging features.

### --debug option

Add the `--debug` option when you run the tests an it will run with the [Playwright Inspector](https://playwright.dev/docs/inspector), letting you step through the tests and show interactions in the browser.

### VSCode debugging

There's a `Functional Tests` launch target in the root `.vscode/launch.json`. Set any breakpoints in your tests and run them from the Debug panel. The browser will run in "headed" mode and you can step through the test.

### Traces

We record traces for failed tests locally and in CI. On CircleCI they are in the test artifacts. For more read the [Trace Viewer docs](https://playwright.dev/docs/trace-viewer).

#### Trace URLs in CI

When tests fail in CircleCI, the CI reporter automatically generates clickable trace URLs using [fxtrace](https://fxtrace.vercel.app). These URLs appear:

1. **Inline** - Immediately after each test failure
2. **Summary** - At the end of the test run with all failed test traces grouped together

Example output:
```
[26/35] ❌ tests/settings/avatar.spec.ts: open and close avatar drop-down menu (19s)
Error: Timed out 10000ms waiting for expect(locator).toBeVisible()
...
📊 View trace: https://fxtrace.vercel.app/?url=https://output.circle-artifacts.com/output/job/.../trace.zip
```

The summary at the end groups traces by test (including retries):
```
📊 Failed test traces:
  tests/settings/avatar.spec.ts: open and close avatar drop-down menu
    https://fxtrace.vercel.app/?url=.../trace.zip
    https://fxtrace.vercel.app/?url=.../retry1/trace.zip
```

The reporter also tracks:
- **Progress**: `[5/35]` shows completed tests out of total
- **Retries**: Total retry count and which attempt `(retry #1)`
- **Flaky tests**: Tests that failed initially but passed on retry
- **Duration**: Total test suite run time

Sync signin tests start a new browser instance and this causes problems with the recorded trace being blank; the second browsers trace is overwritten.

Here's what's happening with tracing order of operations

```
Playwright instance start
          |
          |
    Browser Start(a)      <-- first browser starts
          |
          |
    Trace start(a)        <-- first browser starts tracing
          |
          |
    Browser start(b)      <-- second browser starts
          |
          |
    Trace start(b)        <-- second browser starts it's own tracing
          |
          |
        Test
          |
          |
    Tracing stop(b)       <-- second browser stops trace and saves to a pre-defined path like `/artifacts/functional/{testname}/trace.zip
          |
          |
    Browser Stop(b)       <-- second browser shuts down
          |
          |
    Tracing stop(a)       <-- first browser stops trace and writes to same path, overwriting the trace that's there
          |
          |
    Browser Stop(a)       <-- first browser shuts down and test finishes
          |
          |
          v
```

Because we have to start the second browser, and the traces are overwritten, we explicitly save the second browsers trace to a unique location if a test has `failed`, `retried` **and** `failed` again. These traces are currently saved to a similar path as default: `/artifacts/functional/{testName}/syncTrace.zip`. One limitation of this setup is that it does _not_ stop the original trace from being saved as well, so we end with two traces. The next limitation is that the unique trace do not include `setup`, `teardown` and other steps that happen outside their scope, so viewing both traces to troubleshoot failures may be necessary.

Note that `testName` in the path is similar but not exactly the same to how Playwright handles it, and the file is always `syncTrace.zip` instead of just `trace.zip`.

Unique traces are also saved to `Artifacts` in CircleCI.

## Avoiding Race condition while writing tests

See related [Ecosystem Docs](https://mozilla.github.io/ecosystem-platform/reference/functional-testing#avoiding-race-condition-while-writing-tests)

## Configuration for Recovery Phone testing

Recovery phone testing presents a special challenge. Typically when testing locally, or in the CI, we can simply look at redis to validate the state of the messages we send. i.e. If we want to provide the code sent to the end user, we just look at redis. This approach is also convenient because it works with twilio magic test numbers and twilio client testing credentials, which incur no messaging fees. Unfortunately, this approach does not work during smoke testing for stage & production. In this scenario, we don't (and shouldn't) have access to the redis instance. Furthermore, we aren't using test credentials in stage/prod, we are using real credentials, which means we cannot send messages to 'magic' test numbers. Our solution for smoke testing prod/stage case is to ask Twilio for the last message which was just sent out, for our testing user's phone number, which is actually a twilio number we have procured just for testing purposes.

TL;DR, There are two ways to configure functional tests, we can either use twilio test numbers, and peek at outgoing codes via the redis client, or we can have real phone numbers and peak at outgoing codes via the twilio api.

For day to day local/CI pipeline testing, we can just use the redis with magic test number approach. This incurs no cost and requires no extra configuration.

For smoke testing scenarios, or validating this works with a real phone number, we can use the twilio client with a real test phone number approach. To enable this approach, simply add the following environment variables. This will allow us to use the twilio client to peek at codes, and to use a twilio test number to receive messages.

```
FUNCTIONAL_TESTS__TWILIO__ACCOUNT_SID=XXX
FUNCTIONAL_TESTS__TWILIO__API_KEY=XXX
FUNCTIONAL_TESTS__TWILIO__API_SECRET=XXX
FUNCTIONAL_TESTS__TWILIO__TEST_NUMBER=XXX
```

One final note about CI configuration. It might be necessary to have different settings per testing environment. For example we might want to use different credentials for stage smoke tests typical CI pipeline tests. Or perhaps stage, and production need different api keys. In either case, you can override the default env values by appending an environment name.

For example, let’s say we wanted stage and production to use unique API keys, and have production use a unique test phone number. Apply the following configuration to our CI environment should do the trick:

```
FUNCTIONAL_TESTS__TWILIO__ACCOUNT_SID=XXX
FUNCTIONAL_TESTS__TWILIO__API_KEY=XXX
FUNCTIONAL_TESTS__TWILIO__API_SECRET=XXX
FUNCTIONAL_TESTS__TWILIO__TEST_NUMBER=XXX

FUNCTIONAL_TESTS__TWILIO__API_KEY__STAGE=XXX
FUNCTIONAL_TESTS__TWILIO__API_SECRET__STAGE=XXX

FUNCTIONAL_TESTS__TWILIO__API_KEY__PRODUCTION=XXX
FUNCTIONAL_TESTS__TWILIO__API_SECRET__PRODUCTION=XXX
FUNCTIONAL_TESTS__TWILIO__TEST_NUMBER__PRODUCTION=XXX
```

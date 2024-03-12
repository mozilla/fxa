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

`yarn record` is a convenient script to start with when creating a new test. It starts playwright in debug mode and runs the `tests/stub.spec.ts` test which creates a new account and prints the credentials to the terminal. From there you can use the Playwright inspector to record your test and copy the command output to your test file.

## Fixtures

We have a standard [fixture](https://playwright.dev/docs/test-fixtures) for the most common kind of tests.

Its job is to:

- Connect to the target environment
- Create and verify an account for each test
- Create the POMs
- Destroy the account after each test

Use this fixture in test files like so:

```ts
// tests/example.spec.ts
import { test } from '../lib/fixtures/standard';
```

Other fixtures may be added as needed.

## Page Object Models (POMs)

To keep the tests readable and high-level we use the [page object model](https://playwright.dev/docs/test-pom) pattern. Pages are organized by url "route" when possible in the `pages` directory, and made available to tests in the fixture as `pages`.

Example:

```ts
test('create an account', async ({ pages: { login } }) => {
  // login is a POM at pages/login.ts
  await login.goto();
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

There's a `Functional Tests` launch target in the root `.vscode/launch.json`. Set any breakpoints in you tests and run them from the Debug panel. The browser will run in "headed" mode and you can step through the test.

### Traces

We record traces for failed tests locally and in CI. On CircleCI they are in the test artifacts. For more read the [Trace Viewer docs](https://playwright.dev/docs/trace-viewer).

## Avoiding Race condition while writing tests

1. Use `waitFor` functions: Playwright provides `waitFor` functions to wait for specific conditions to be met, such as an element to appear or be visible, or an attribute to change. Use these functions instead of hard-coding time delays in your tests.

Example:

```ts
async showError() {
  const error = this.page.locator('#error');
  await error.waitFor({ state: 'visible' });
  return error.isVisible();
}
```

2. Use `waitForUrl` and/or `waitForNavigation`: Use the `waitForUrl` or `waitForNavigation` function to wait for page navigation to complete before continuing with the test.

Example:

```ts
async clickForgotPassword() {
  await this.page.locator(selectors.LINK_RESET_PASSWORD).click();
  await this.page.waitForURL(/reset_password/);
}
```

```ts
async performNavigation() {
  const waitForNavigation = this.page.waitForNavigation();
  await this.page.locator('button[id=navigate]').click();
  return waitForNavigation;
}
```

3. Use unique selectors: Use unique selectors to identify elements on the page to avoid confusion or ambiguity in selecting the correct element.

Example:

```ts
this.page.getByRole('link', { name: 'name1' });
```

```ts
this.page.locator('[data-testid="change"]');
```

```ts
this.page.locator('#id');
```

```ts
this.page.locator('.class');
```

4. Use `locator().action()` : Use `page.locator().click()` to wait for an element to appear before interacting with it.

Example:

```ts
performClick() {
  return this.page.locator('button[id=Save]').click();
}
```

5. Use `Promise.all`: Use `Promise.all` to execute multiple asynchronous tasks simultaneously and wait for them to complete before continuing with the test.

Example:

```ts
async signOut() {
  await Promise.all([
    this.page.locator('#logout').click(),
    this.page.waitForResponse(/\/api\/logout/),
  ]);
}
```

6. Use `fixtures` to set up and tear down the test environment or run a test in a particular environment etc.

7. Use `test.slow()` to mark the test as slow and triple the test timeout.

8. When writing tests that use Firefox Sync, use the `syncBrowserPages` fixture. This fixture creates a new browser and a new browser context to avoid any Sync data being shared between tests. After your test is complete, the fixture will ensure that the browser is closed to free up memory.

By following these best practices, you can minimize the likelihood of race conditions in your Playwright tests and ensure more reliable and consistent test results.

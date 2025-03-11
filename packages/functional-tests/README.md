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
- testAccountTracker: create and destroy accounts

Make these fixtures available in test files by declaring the following:

```ts
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

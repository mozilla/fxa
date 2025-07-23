/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Project } from '@playwright/test';
import { PlaywrightTestConfig, defineConfig } from '@playwright/test';
import * as path from 'path';
import { TestOptions, WorkerOptions } from './lib/fixtures/standard';
import { TargetNames } from './lib/targets';
import { getFirefoxUserPrefs } from './lib/targets/firefoxUserPrefs';

const CI = !!process.env.CI;

// If using the CircleCI parallelism feature, assure that the JUNIT XML report
// has a unique name
const JUNIT_OUTPUT_NAME = process.env.CIRCLE_NODE_INDEX
  ? `functional-tests-playwright-results-${process.env.CIRCLE_NODE_INDEX}.xml`
  : 'functional-tests-playwright-results.xml';

// The DEBUG env is used to debug without the playwright inspector, like in vscode
// see .vscode/launch.json
const DEBUG = !!process.env.DEBUG;
const SLOWMO = parseInt(process.env.PLAYWRIGHT_SLOWMO || '0');
const NUM_WORKERS = parseInt(process.env.PLAYWRIGHT_WORKERS || '4');
const FAIL_FAST = !!process.env.PLAYWRIGHT_FAIL_FAST || true;

let workers = NUM_WORKERS || 2;
let maxFailures = 0;

if (CI) {
  // Overall maxFailures is dependent on the number of workers
  workers = 2;
  maxFailures = FAIL_FAST ? workers * 2 : 0;
}

export default defineConfig<PlaywrightTestConfig<TestOptions, WorkerOptions>>({
  outputDir: path.resolve(__dirname, '../../artifacts/functional'),

  // Look for test files in the "tests" directory, relative to this configuration file.
  testDir: 'tests',

  // Run all tests in parallel.
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: CI,

  // Retry on CI only.
  retries: CI ? 1 : 0,

  // Total allowable time spent for the test function, fixtures, beforeEach and afterEach hooks. Defaults to 30 seconds.
  timeout: 60000, // 1 minute

  // Total allowable time spent for each assertion. Defaults to 5 seconds.
  // Increased timeout locally vs CI because putting strain on local machine
  // can cause services/network calls to take longer to respond.
  expect: CI ? { timeout: 10000 } : { timeout: 15000 }, // 10 seconds on CI, 15 seconds locally

  // Report slow tests, but only the top 10 slowest tests.
  reportSlowTests: {
    max: 10, // Report the top 10 slowest test files
    threshold: 15000, // Threshold in milliseconds
  },


  use: {
    viewport: { width: 1920, height: 1080 },
  },
  projects: [
    ...TargetNames.map(
      (name) =>
        ({
          name,
          use: {
            browserName: 'firefox',
            targetName: name,
            bypassCSP: true,
            launchOptions: {
              args: DEBUG ? ['-start-debugger-server', '--disable-web-security'] : undefined,
              firefoxUserPrefs: getFirefoxUserPrefs(name, DEBUG),
              headless: !DEBUG,
              slowMo: SLOWMO,
            },
            trace: 'retain-on-failure',
          },
        }) as Project
    ),
  ],
  reporter: CI
    ? [
        ['./lib/ci-reporter.ts'],
        ['dot'],
        [
          'junit',
          {
            outputFile: path.resolve(
              __dirname,
              `../../artifacts/tests/${JUNIT_OUTPUT_NAME}`
            ),
          },
        ],
      ]
    : 'list',
  workers,
  maxFailures,
});

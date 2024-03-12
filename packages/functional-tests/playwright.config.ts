import { PlaywrightTestConfig, Project } from '@playwright/test';
import * as path from 'path';
import { TargetNames } from './lib/targets';
import { TestOptions, WorkerOptions } from './lib/fixtures/standard';
import { getFirefoxUserPrefs } from './lib/targets/firefoxUserPrefs';

const CI = !!process.env.CI;

// The DEBUG env is used to debug without the playwright inspector, like in vscode
// see .vscode/launch.json
const DEBUG = !!process.env.DEBUG;
const SLOWMO = parseInt(process.env.PLAYWRIGHT_SLOWMO || '0');
const NUM_WORKERS = parseInt(process.env.PLAYWRIGHT_WORKERS || '16');

let retries = 0,
  workers = NUM_WORKERS || 2,
  maxFailures = 0;
if (CI) {
  // Overall maxFailures is now dependent on the number of retries, workers
  retries = 3;
  workers = 2;
  maxFailures = retries * workers * 2;
}

const config: PlaywrightTestConfig<TestOptions, WorkerOptions> = {
  outputDir: path.resolve(__dirname, '../../artifacts/functional'),
  forbidOnly: CI,
  retries,
  testDir: 'tests',
  use: {
    viewport: { width: 1280, height: 720 },
  },
  projects: [
    ...TargetNames.map(
      (name) =>
        ({
          name,
          testIgnore: 'stub.spec.ts',
          use: {
            browserName: 'firefox',
            targetName: name,
            launchOptions: {
              args: DEBUG ? ['-start-debugger-server'] : undefined,
              firefoxUserPrefs: getFirefoxUserPrefs(name, DEBUG),
              headless: !DEBUG,
              slowMo: SLOWMO,
            },
            trace: CI ? 'on-first-retry' : 'retain-on-failure',
          },
        } as Project)
    ),
    {
      name: 'stub',
      testMatch: 'stub.spec.ts',
      use: {
        browserName: 'firefox',
        targetName: 'local',
        launchOptions: {
          args: DEBUG ? ['-start-debugger-server'] : undefined,
          firefoxUserPrefs: getFirefoxUserPrefs('local', DEBUG),
          headless: !DEBUG,
        },
      },
    },
  ],
  reporter: CI
    ? [
        ['./lib/ci-reporter.ts'],
        [
          'junit',
          {
            outputFile: path.resolve(
              __dirname,
              '../../artifacts/tests/test-results.xml'
            ),
          },
        ],
      ]
    : 'list',
  workers,
  maxFailures,
};

export default config;

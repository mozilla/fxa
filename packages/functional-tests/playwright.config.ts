import { PlaywrightTestConfig } from '@playwright/test';
import path from 'path';
import { TargetNames } from './lib/targets';
import { TestOptions, WorkerOptions } from './lib/fixtures/standard';
import { getFirefoxUserPrefs } from './lib/targets/firefoxUserPrefs';

const CI = !!process.env.CI;

// The DEBUG env is used to debug without the playwright inspector, like in vscode
// see .vscode/launch.json
const DEBUG = !!process.env.DEBUG;

const config: PlaywrightTestConfig<TestOptions, WorkerOptions> = {
  outputDir: path.resolve(__dirname, '../../artifacts/functional'),
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  testDir: 'tests',
  use: {
    viewport: { width: 1280, height: 720 },
  },
  projects: TargetNames.map((name) => ({
    name,
    use: {
      browserName: 'firefox',
      targetName: name,
      launchOptions: {
        args: DEBUG ? ['-start-debugger-server'] : undefined,
        firefoxUserPrefs: getFirefoxUserPrefs(name, DEBUG),
        headless: !DEBUG,
      },
      trace: CI ? 'on-first-retry' : 'retain-on-failure',
    },
  })),
  reporter: CI
    ? [
        ['line'],
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
  workers: CI ? 1 : undefined,
};

export default config;

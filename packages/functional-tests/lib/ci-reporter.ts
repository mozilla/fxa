/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import path from 'node:path';
import {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestError,
  TestResult,
} from '@playwright/test/reporter';

/**
 * Converts milliseconds to human-readable format
 * If the time is less than 1 second, it shows milliseconds
 * If the time is less than 1 minute, it shows seconds
 * And if over 1 minute, it shows minutes and seconds
 * @param ms
 */
const formatTime = (ms: number) => {
  // protect against bad input so we don't crash the reporter
  if (ms === undefined || ms === null || isNaN(ms) || ms < 0) {
    return 'unknown';
  }
  if (ms < 1000) {
    return `${ms}ms`;
  }
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m${seconds % 60}s`;
};

class CIReporter implements Reporter {
  private fixmeCount = 0;
  private passCount = 0;
  private skipCount = 0;
  private total = 0;

  onBegin(config: FullConfig, suite: Suite) {
    this.total = suite.allTests().length;
    console.log(`Running ${this.total} tests using ${config.workers} workers`);
  }

  onTestEnd(test: TestCase, result: TestResult) {
    let status = '❌';
    switch (result.status) {
      case 'passed':
        status = '✅';
        this.passCount++;
        break;
      case 'skipped':
        status = '↩️';
        this.skipCount++;
        if (test.annotations.some((a) => a.type === 'fixme')) {
          this.fixmeCount++;
        }
        break;
      case 'timedOut':
        status = '⌛️';
        break;
      default:
        break;
    }

    console.log(
      `${status} ${path.relative(process.cwd(), test.location.file)}: ${
        test.title
      } (${formatTime(result.duration)})`
    );
    if (test.outcome() === 'unexpected') {
      console.log(result.error?.stack);
      console.log(result.error?.message);
    }
  }

  onEnd(result: FullResult) {
    const failCount = this.total - (this.passCount + this.skipCount);

    console.log(
      `Test suite: ${result.status} (` +
        `Passed: ${this.passCount} ` +
        `Failed: ${failCount} ` +
        `Skipped: ${this.skipCount} (Fixme: ${this.fixmeCount}))`
    );
  }

  onError(error: TestError) {
    console.log(error.message);
  }
}
export default CIReporter;

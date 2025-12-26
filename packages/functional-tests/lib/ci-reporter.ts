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

/**
 * Generates a trace.playwright.dev URL for a trace file in CircleCI
 * @param tracePath The path to the trace file (can be absolute or relative)
 * @returns The trace.playwright.dev URL or null if not in CircleCI
 */
function generateTraceUrl(tracePath: string): string | null {
  // Only generate URLs in CircleCI
  if (!process.env.CI || !process.env.CIRCLECI) {
    return null;
  }

  const workflowJobId = process.env.CIRCLE_WORKFLOW_JOB_ID;
  const nodeIndex = process.env.CIRCLE_NODE_INDEX || '0';

  if (!workflowJobId) {
    return null;
  }

  const projectRoot = process.cwd();
  let relativePath: string;

  if (path.isAbsolute(tracePath)) {
    relativePath = path.relative(projectRoot, tracePath);
  } else {
    relativePath = tracePath;
  }

  relativePath = relativePath.replace(/\\/g, '/');

  // Construct the CircleCI artifact URL
  // Format: https://output.circle-artifacts.com/output/job/${CIRCLE_WORKFLOW_JOB_ID}/artifacts/${CIRCLE_NODE_INDEX}/<path>
  const artifactUrl = `https://output.circle-artifacts.com/output/job/${workflowJobId}/artifacts/${nodeIndex}/${relativePath}`;

  // Generate the trace.playwright.dev URL
  return `https://trace.playwright.dev/?trace=${encodeURIComponent(artifactUrl)}`;
}

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

    // Check for trace attachments and generate trace.playwright.dev URLs
    if (result.attachments) {
      for (const attachment of result.attachments) {
        if (attachment.name === 'trace' && attachment.path) {
          const traceUrl = generateTraceUrl(attachment.path);
          if (traceUrl) {
            console.log(`\n📊 View trace: ${traceUrl}`);
          }
        }
      }
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

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import path from 'node:path';
import { existsSync, readFileSync } from 'fs';
import {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestError,
  TestResult,
} from '@playwright/test/reporter';

const FXTRACE_BASE_URL = 'https://fxtrace.vercel.app';
const CIRCLECI_ARTIFACTS_BASE_URL = 'https://output.circle-artifacts.com/output/job';

const STATUS_ICONS: Record<string, string> = {
  passed: '✅',
  skipped: '↩️',
  timedOut: '⌛️',
  failed: '❌',
  interrupted: '❌',
};

/**
 * Converts milliseconds to human-readable format (e.g., "5s", "2m30s")
 */
const formatTime = (ms: number): string => {
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
 * Walks up the directory tree looking for a package.json with `"name": "fxa"`.
 */
function findRootPackageJson(startDir: string = __dirname): string {
  let currentDir = startDir;
  let parentDir = '';

  while (currentDir !== parentDir) {
    const packageJsonPath = path.join(currentDir, 'package.json');

    if (existsSync(packageJsonPath)) {
      try {
        const json = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
        if (json.name === 'fxa') {
          return currentDir;
        }
      } catch {
        // Invalid JSON, continue searching
      }
    }

    parentDir = currentDir;
    currentDir = path.dirname(currentDir);
  }

  throw new Error('Could not find root package.json');
}

/**
 * Generates an fxtrace URL for a trace file in CircleCI
 */
function generateTraceUrl(tracePath: string): string | null {
  if (!process.env.CI || !process.env.CIRCLECI) {
    return null;
  }

  const workflowJobId = process.env.CIRCLE_WORKFLOW_JOB_ID;
  const nodeIndex = process.env.CIRCLE_NODE_INDEX || '0';

  if (!workflowJobId) {
    return null;
  }

  const projectRoot = findRootPackageJson();
  const absolutePath = path.resolve(process.cwd(), tracePath);
  const relativePath = path
    .relative(projectRoot, absolutePath)
    .replace(/\\/g, '/');

  const artifactUrl = `${CIRCLECI_ARTIFACTS_BASE_URL}/${workflowJobId}/artifacts/${nodeIndex}/${relativePath}`;
  return `${FXTRACE_BASE_URL}/?url=${artifactUrl}`;
}

interface FailedTestTrace {
  testTitle: string;
  testFile: string;
  traceUrls: string[];
}

class CIReporter implements Reporter {
  private fixmeCount = 0;
  private passCount = 0;
  private skipCount = 0;
  private total = 0;
  private completedCount = 0;
  private retryCount = 0;
  private flakyTests = new Set<string>();
  private failedTestTraces = new Map<string, FailedTestTrace>();

  onBegin(config: FullConfig, suite: Suite) {
    this.total = suite.allTests().length;
    console.log(`Running ${this.total} tests using ${config.workers} workers`);
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const testFile = path.relative(process.cwd(), test.location.file);
    const testKey = `${testFile}:${test.title}`;
    const isRetry = result.retry > 0;

    if (isRetry) {
      this.retryCount++;
    } else {
      this.completedCount++;
    }

    const status = STATUS_ICONS[result.status] || '❌';

    if (result.status === 'passed') {
      this.passCount++;
      if (isRetry) {
        this.flakyTests.add(testKey);
      }
    } else if (result.status === 'skipped') {
      this.skipCount++;
      if (test.annotations.some((a) => a.type === 'fixme')) {
        this.fixmeCount++;
      }
    }

    const progress = `[${this.completedCount}/${this.total}]`;
    const retryLabel = isRetry ? ` (retry #${result.retry})` : '';
    console.log(
      `${progress} ${status} ${testFile}: ${test.title}${retryLabel} (${formatTime(result.duration)})`
    );

    if (test.outcome() === 'unexpected') {
      console.log(result.error?.stack);
      console.log(result.error?.message);
    }

    this.collectTraceUrl(test, result, testKey, testFile);
  }

  private collectTraceUrl(
    test: TestCase,
    result: TestResult,
    testKey: string,
    testFile: string
  ) {
    if (result.status === 'passed') return;

    const traceAttachment = result.attachments?.find(
      (a) => a.name === 'trace' && a.path
    );
    if (!traceAttachment?.path) return;

    const traceUrl = generateTraceUrl(traceAttachment.path);
    if (!traceUrl) return;

    console.log(`\n📊 View trace: ${traceUrl}`);

    const existing = this.failedTestTraces.get(testKey);
    if (existing) {
      existing.traceUrls.push(traceUrl);
    } else {
      this.failedTestTraces.set(testKey, {
        testTitle: test.title,
        testFile,
        traceUrls: [traceUrl],
      });
    }
  }

  onEnd(result: FullResult) {
    const failCount = this.total - (this.passCount + this.skipCount);

    console.log(
      `\nTest suite: ${result.status} (` +
        `Passed: ${this.passCount} ` +
        `Failed: ${failCount} ` +
        `Skipped: ${this.skipCount} (Fixme: ${this.fixmeCount}) ` +
        `Retries: ${this.retryCount}) ` +
        `in ${formatTime(result.duration)}`
    );

    if (this.flakyTests.size > 0) {
      console.log(`\n⚠️ Flaky tests (${this.flakyTests.size}):`);
      for (const testKey of this.flakyTests) {
        console.log(`  ${testKey}`);
      }
    }

    if (this.failedTestTraces.size > 0) {
      const traces = this.failedTestTraces;
      process.on('exit', () => {
        console.log('\n📊 Failed test traces:');
        for (const trace of traces.values()) {
          console.log(`  ${trace.testFile}: ${trace.testTitle}`);
          for (const url of trace.traceUrls) {
            console.log(`    ${url}`);
          }
        }
      });
    }
  }

  onError(error: TestError) {
    console.log(error.message);
  }
}

export default CIReporter;

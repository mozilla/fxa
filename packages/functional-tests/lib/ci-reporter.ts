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

class CIReporter implements Reporter {
  onBegin(config: FullConfig<{}, {}>, suite: Suite) {
    console.log(
      `Running ${suite.allTests().length} tests using ${config.workers} workers`
    );
  }

  onTestEnd(test: TestCase, result: TestResult) {
    let status = '❌';
    switch (result.status) {
      case 'passed':
        status = '✅';
        break;
      case 'skipped':
        status = '↩️';
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
      }`
    );
    if (test.outcome() === 'unexpected') {
      console.log(result.error.stack);
      console.log(result.error.message);
    }
  }

  onEnd(result: FullResult) {
    console.log(`Test suite: ${result.status}`);
  }

  onError(error: TestError) {
    console.log(error.message);
  }
}
export default CIReporter;

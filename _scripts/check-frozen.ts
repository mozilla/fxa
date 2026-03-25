/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Inspired by: https://github.com/Lisba/prevent-file-changes

import { execSync } from 'child_process';

// Maintain List of frozen files here!
const frozen: Array<{ pattern: string; reason: string }> = [
  {
    pattern: 'packages/fxa-auth-server/lib/senders/email.js',
    reason: 'Files moved to libs/accounts/email-sender',
  },
  {
    pattern: 'packages/fxa-auth-server/lib/senders/(emails|renderer)/.*',
    reason: 'Files moved to libs/accounts/email-renderer',
  },
  {
    pattern: 'packages/fxa-auth-server/test/local/.*\\.(js|ts)$',
    reason:
      'Mocha unit tests are frozen. Add new tests as co-located Jest specs (lib/**/*.spec.ts)',
  },
  {
    pattern: 'packages/fxa-auth-server/test/remote/.*_tests\\.js$',
    reason:
      'Mocha integration tests are frozen. Add new tests as Jest specs (test/remote/*.in.spec.ts)',
  },
  {
    pattern: 'packages/fxa-auth-server/test/oauth/.*\\.(js|ts)$',
    reason:
      'Mocha OAuth tests are frozen. Add new tests as Jest specs (lib/oauth/*.spec.ts)',
  },
];

export const getChangedFiles = () => {
  const referenceToCompare = execSync(
    'git rev-parse --verify HEAD >/dev/null 2>&1 && echo HEAD || echo 4b825dc642cb6eb9a060e54bf8d69288fbee4904'
  );
  return execSync(`git diff --cached --name-only ${referenceToCompare}`)
    .toString()
    .trim()
    .split('\n');
};

try {
  let violations = false;
  for (const x of frozen) {
    const re = new RegExp(x.pattern);
    const changedFiles = getChangedFiles();
    for (const file of changedFiles) {
      if (re.test(file)) {
        console.error(
          `🚫 Error: Cannot modify frozen file: ${file}\n   Reason: ${x.reason}.\n`
        );
        violations = true;
      }
    }
  }

  if (violations) {
    process.exit(1);
  } else {
    console.log('✨ Successful Execution!');
    process.exit(0);
  }
} catch (error: any) {
  console.error('🚫 Execution Error:', error.message);
  process.exit(1);
}

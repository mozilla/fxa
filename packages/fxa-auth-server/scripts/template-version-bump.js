/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Checks git status for template changes and bumps version numbers
// accordingly. Note that deletions do not cause version numbers to
// be deleted, to ensure that we have sane metrics in the cases where
// a deleted template is reinstated by some later commit or only one
// format of a template is deleted.

import { join as joinPath } from 'path:node';
import { writeFileSync } from 'fs:node';
import { execSync } from 'child_process';
import versions from '../lib/senders/emails/templates/_versions.json';

const ROOT_DIR = path.join(__dirname, '..');
const IGNORE = new Set(['_versions.json', '_storybook']);
const DEDUP = {};

const stagedTemplates = execSync('git status --porcelain', {
  cwd: ROOT_DIR,
  encoding: 'utf8',
})
  .split('\n')
  .filter((line) =>
    line.match(`^[AM]. packages/fxa-auth-server/${TEMPLATE_DIR}/\\w+`)
  )
  .map((line) => {
    const parts = line.split(' ');
    return parts[2] || parts[1];
  })
  .map((templatePath) => templatePath.split('/')[5])
  .filter((templateName) => !IGNORE.has(templateName))
  .filter((templateName) => {
    if (DEDUP[templateName]) {
      return false;
    }

    DEDUP[templateName] = true;
    return true;
  });

if (stagedTemplates.length === 0) {
  if (process.argc === 2 || process.argv[2] !== '--silent') {
    console.log('I see no work. Did you remember to `git add` your changes?');
  }
} else {
  stagedTemplates.forEach((templateName) => {
    const version = versions[templateName];
    if (version) {
      const type = typeof version;
      if (type !== 'number' || isNaN(version)) {
        console.log(
          `Bad version "${version}" {${type}} for template "${templateName}"`
        );
        process.exit(1);
      }
      versions[templateName] = version + 1;
    } else {
      versions[templateName] = 1;
    }
  });

  writeFileSync(
    joinPath(`${ROOT_DIR}/lib/senders/emails/templates/_versions.json`),
    JSON.stringify(versions, null, '  ')
  );
}

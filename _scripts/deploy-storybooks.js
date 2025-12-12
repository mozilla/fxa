/* ThisSource Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const deployDir = process.env.DEPLOY_DIR;
if (!deployDir) {
  console.error('Error: DEPLOY_DIR environment variable is required');
  process.exit(1);
}

const deployPath = path.join('deploy', deployDir);

fs.mkdirSync(deployPath, { recursive: true });

function getCommitMetadata() {
  try {
    // Use GitHub Actions environment variables if available
    const commit =
      process.env.GITHUB_SHA ||
      execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();

    let summary, description;

    if (process.env.COMMIT_MESSAGE) {
      const message = process.env.COMMIT_MESSAGE;
      const lines = message.split('\n');
      summary = lines[0];
      description = lines.slice(1).join('\n').trim();
    } else {
      summary = execSync('git log -1 --pretty=format:%s', {
        encoding: 'utf-8',
      }).trim();
      description = execSync('git log -1 --pretty=format:%b', {
        encoding: 'utf-8',
      }).trim();
    }

    const datestamp =
      process.env.COMMIT_TIMESTAMP ||
      execSync('git log -1 --pretty=format:%cI', { encoding: 'utf-8' }).trim();

    return { commit, summary, description, datestamp };
  } catch (error) {
    console.error('Failed to get commit metadata:', error.message);
    return {
      commit: 'unknown',
      summary: '',
      description: '',
      datestamp: new Date().toISOString(),
    };
  }
}

const commitMetadata = getCommitMetadata();

function findStorybookDirs(dir, results = []) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    if (item === 'storybook-static' && fs.statSync(fullPath).isDirectory()) {
      results.push(fullPath);
    } else if (
      fs.statSync(fullPath).isDirectory() &&
      item !== 'node_modules' &&
      item !== 'deploy'
    ) {
      findStorybookDirs(fullPath, results);
    }
  }
  return results;
}

const storybookDirs = findStorybookDirs('.');

for (const storybookDir of storybookDirs) {
  const packageName = path.basename(path.dirname(storybookDir));
  const targetDir = path.join(deployPath, packageName);

  console.log(`Copying ${packageName} storybook...`);
  fs.cpSync(storybookDir, targetDir, { recursive: true });
}

const storybooks = fs
  .readdirSync(deployPath)
  .filter((item) => fs.statSync(path.join(deployPath, item)).isDirectory())
  .sort();

const title = `Storybooks for commit ${commitMetadata.commit}`;
const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
</head>
<body>
  <h1>${title}</h1>
  <ul>
    ${storybooks.map((name) => `<li><a href="./${name}/index.html">${name}</a></li>`).join('\n    ')}
  </ul>
  <dl>
    <dt>Date</dt>
    <dd>${new Date(commitMetadata.datestamp).toISOString()}</dd>
    <dt>Summary</dt>
    <dd><pre>${commitMetadata.summary}</pre></dd>
    <dt>Description</dt>
    <dd><pre>${commitMetadata.description}</pre></dd>
  </dl>
</body>
</html>`;

fs.writeFileSync(path.join(deployPath, 'index.html'), html);
console.log(`Created index.html with ${storybooks.length} storybooks`);

console.log('\nDeployment structure:');
console.log(storybooks.join('\n'));

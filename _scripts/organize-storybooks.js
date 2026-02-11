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

fs.mkdirSync(deployDir, { recursive: true });

function getCommitMetadata() {
  try {
    const commit = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
    const summary = execSync('git log -1 --pretty=format:%s', {
      encoding: 'utf-8',
    }).trim();
    const description = execSync('git log -1 --pretty=format:%b', {
      encoding: 'utf-8',
    }).trim();
    const timestamp = execSync('git log -1 --pretty=format:%ct', {
      encoding: 'utf-8',
    }).trim();

    return {
      commit,
      summary,
      description,
      timestamp: parseInt(timestamp, 10) * 1000, // Convert to milliseconds
    };
  } catch (error) {
    console.error('Failed to get commit metadata:', error.message);
    return {
      commit: 'unknown',
      summary: '',
      description: '',
      timestamp: Date.now(),
    };
  }
}

const commitMetadata = getCommitMetadata();

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

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
  const targetDir = path.join(deployDir, packageName);

  console.log(`Copying ${packageName} storybook...`);
  fs.cpSync(storybookDir, targetDir, { recursive: true });
}

const storybooks = fs
  .readdirSync(deployDir)
  .filter((item) => fs.statSync(path.join(deployDir, item)).isDirectory())
  .sort();

const title = `Storybooks for commit ${escapeHtml(commitMetadata.commit)}`;
const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 900px;
      margin: 2rem auto;
      padding: 0 1rem;
      line-height: 1.6;
    }
    h1 { font-size: 1.5rem; }
    ul { list-style: none; padding: 0; }
    li { margin: 0.75rem 0; }
    a { color: #0969da; text-decoration: none; }
    a:hover { text-decoration: underline; }
    dl { margin-top: 2rem; }
    dt { font-weight: 600; margin-top: 1rem; color: #333; }
    dd { margin: 0.25rem 0 0 0; color: #666; }
    pre { margin: 0; white-space: pre-wrap; font-family: inherit; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <ul>
    ${storybooks.map((name) => `<li><a href="./${encodeURIComponent(name)}/">${escapeHtml(name)}</a></li>`).join('\n')}
  </ul>
  <dl>
    <dt>Date</dt>
    <dd>${escapeHtml(new Date(commitMetadata.timestamp).toLocaleString('en-US', { timeZoneName: 'short' }))}</dd>
    <dt>Summary</dt>
    <dd><pre>${escapeHtml(commitMetadata.summary)}</pre></dd>${
      commitMetadata.description
        ? `
    <dt>Description</dt>
    <dd><pre>${escapeHtml(commitMetadata.description)}</pre></dd>`
        : ''
    }
  </dl>
</body>
</html>`;

fs.writeFileSync(path.join(deployDir, 'index.html'), html);

// Write metadata as JSON for easier consumption by site index
const metadata = {
  ...commitMetadata,
  storybooks,
  deployDir,
};
fs.writeFileSync(
  path.join(deployDir, 'metadata.json'),
  JSON.stringify(metadata, null, 2)
);

console.log(
  `Created index.html and metadata.json with ${storybooks.length} storybooks`
);

console.log('\nDeployment structure:');
console.log(storybooks.join('\n'));

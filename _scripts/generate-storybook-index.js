/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const fs = require('fs');
const path = require('path');

const ghPagesDir = process.env.GH_PAGES_DIR || 'gh-pages';
const repoName = process.env.REPO_NAME;
const repoOwner = process.env.REPO_OWNER;

if (!repoName || !repoOwner) {
  console.error(
    'Error: REPO_NAME and REPO_OWNER environment variables are required'
  );
  process.exit(1);
}

const storybookDir = path.join(ghPagesDir, 'storybook');

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getDirectories(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs
    .readdirSync(dir)
    .filter((item) => fs.statSync(path.join(dir, item)).isDirectory())
    .sort();
}

function getMetadata(dir) {
  const metadataPath = path.join(dir, 'metadata.json');
  if (!fs.existsSync(metadataPath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(metadataPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(
      `Failed to parse metadata from ${metadataPath}:`,
      error.message
    );
    return null;
  }
}

function generatePrItem(pr) {
  const title = `#${escapeHtml(pr.number)}${pr.metadata?.summary ? ` ${escapeHtml(pr.metadata.summary)}` : ''}`;
  const meta = pr.metadata
    ? `<div class="meta">${escapeHtml(pr.metadata.commit.substring(0, 7))} • ${pr.metadata.timestamp ? new Date(pr.metadata.timestamp).toLocaleString('en-US', { timeZoneName: 'short' }) : ''} • <a href="https://github.com/${escapeHtml(repoOwner)}/${escapeHtml(repoName)}/pull/${escapeHtml(pr.number)}" target="_blank">View PR</a></div>`
    : '';

  return `
    <li>
      <a href="./${escapeHtml(pr.dir)}/index.html">${title}</a>
      ${meta}
    </li>
    `;
}

const directories = getDirectories(storybookDir);
const prs = directories
  .filter((dir) => dir.startsWith('pr-'))
  .map((dir) => {
    const prNumber = dir.replace('pr-', '');
    const metadata = getMetadata(path.join(storybookDir, dir));
    return {
      number: prNumber,
      dir,
      metadata,
    };
  })
  .sort((a, b) => parseInt(b.number) - parseInt(a.number));

const mainMetadata = getMetadata(path.join(storybookDir, 'main'));

const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Storybooks for ${escapeHtml(repoName)}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 900px;
      margin: 2rem auto;
      padding: 0 1rem;
      line-height: 1.6;
    }
    h1 { font-size: 1.5rem; }
    h2 { font-size: 1.2rem; margin-top: 2rem; }
    ul { list-style: none; padding: 0; }
    li { margin: 0.75rem 0; }
    a { color: #0969da; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .meta { color: #666; font-size: 0.875rem; }
  </style>
</head>
<body>
  <h1>Storybooks for ${escapeHtml(repoName)}</h1>

  <h2>Latest Main Branch</h2>
  <ul>
    <li>
      <a href="./main/index.html">${mainMetadata?.summary ? escapeHtml(mainMetadata.summary) : 'Main Branch Storybooks'}</a>
      ${mainMetadata ? `<div class="meta">${escapeHtml(mainMetadata.commit.substring(0, 7))} • ${mainMetadata.timestamp ? new Date(mainMetadata.timestamp).toLocaleString('en-US', { timeZoneName: 'short' }) : ''}</div>` : ''}
    </li>
  </ul>

  ${
    prs.length > 0
      ? `
  <h2>Pull Requests (${prs.length})</h2>
  <ul>
    ${prs.map(generatePrItem).join('\n')}
  </ul>
  `
      : '<p style="color: #666;">No open pull requests with storybooks deployments.</p>'
  }
</body>
</html>`;

const outputPath = path.join(storybookDir, 'index.html');
fs.writeFileSync(outputPath, html);
console.log(`Generated storybook/index.html with main + ${prs.length} PRs`);

#!/usr/bin/env node
/* eslint no-use-before-define: 0 */
const fs = require("fs");
const path = require("path");

function main() {
  const [, , PUBLISH_ROOT] = process.argv;

  const commitsPath = path.join(PUBLISH_ROOT, "commits");
  const pullsPath = path.join(PUBLISH_ROOT, "pulls");

  const pullDirs = lsDirs(pullsPath);
  const commitDirs = lsDirs(commitsPath);

  // Create an index for all pull requests
  writeIndex(
    pullsPath,
    htmlDirIndex({
      title: "Storybooks for Recent Pull Requests",
      items: pullDirs
    })
  );

  // Create an index for each pull request
  for (const item of pullDirs) {
    writeIndex(item.path, htmlPullRedirect(item));
  }

  // Create an index for all commmits
  writeIndex(
    commitsPath,
    htmlDirIndex({
      title: "Storybooks for Recent Commits",
      items: commitDirs
    })
  );

  // Create an index for each commit
  for (const item of commitDirs) {
    writeIndex(
      item.path,
      htmlDirIndex({
        omitDates: true,
        title: `Storybooks for ${item.fn}`,
        description: item.description,
        items: lsDirs(item.path)
      })
    );
  }

  // Create an index for the whole static site
  writeIndex(
    PUBLISH_ROOT,
    htmlIndex({
      pulls: pullDirs.slice(0, 7),
      commits: commitDirs.slice(0, 7)
    })
  );
}

const lsDirs = root =>
  fs
    .readdirSync(root)
    .map(fn => ({
      fn,
      path: path.join(root, fn)
    }))
    .map(item => ({
      ...item,
      ...maybeReadText(item.path, "commit", "summary", "description"),
      stat: fs.statSync(item.path)
    }))
    .filter(({ fn, stat }) => !fn.startsWith(".") && stat.isDirectory())
    .sort((a, b) => b.stat.mtimeMs - a.stat.mtimeMs);

const maybeReadText = (basePath, ...fns) => {
  const out = {};
  for (const fn of fns) {
    try {
      out[fn] = fs
        .readFileSync(path.join(basePath, `${fn}.txt`))
        .toString()
        .trim();
    } catch (err) {
      // no-op
    }
  }
  return out;
};

const writeIndex = (indexPath, content) =>
  fs.writeFileSync(path.join(indexPath, "index.html"), content);

const htmlIndex = ({
  title = "Storybooks for Firefox Accounts",
  pulls,
  commits
}) =>
  htmlPage(
    { title },
    html`
      <h2>Pull Requests</h2>
      <ul>
        ${pulls.map(item => htmlDirItem({ basePath: "./pulls", ...item }))}
      </ul>
      <h2>Commits</h2>
      <ul>
        ${commits.map(item => htmlDirItem({ basePath: "./commits", ...item }))}
      </ul>
    `
  );

const htmlPullRedirect = ({ fn, commit }) =>
  htmlPage(
    {
      title: `Storybook for Pull Request ${fn}`,
      head: html`
        <meta
          http-equiv="refresh"
          content="0;URL='../../commits/${commit}/index.html'"
        />
      `
    },
    html`
      <p>
        <a href="../../commits/${commit}/index.html"
          >Commit ${commit} for Pull Request ${fn}</a
        >
      </p>
    `
  );

const htmlDirIndex = ({ omitDates = false, title, description, items = [] }) =>
  htmlPage(
    { title },
    html`
      <ul>
        ${items.map(item => htmlDirItem({ omitDates, ...item }))}
      </ul>
      ${description &&
        html`
          <h2>Description</h2>
          <pre>${description}</pre>
        `}
    `
  );

const htmlDirItem = ({ omitDates, basePath = ".", fn, stat, summary }) => html`
  <li>
    <a href="${basePath}/${fn}/index.html">${fn}</a>
    ${!omitDates &&
      html`
        <span class="date">
          (${new Date(stat.mtimeMs).toISOString()})
        </span>
      `}
    ${summary &&
      html`
        <p>${summary}</p>
      `}
  </li>
`;

const htmlPage = ({ title = "", head = "" }, body) => html`
  <!DOCTYPE html>
  <html>
    <head>
      <title>${title}</title>
      ${head}
    </head>
    <body>
      <h1>${title}</h1>
      ${body}
    </body>
  </html>
`;

// Simple html tagged template utility. Could do more, but it helps a bit with
// using the lit-html extension in VSCode to keep markup in strings formatted.
const html = (strings, ...values) =>
  strings
    .reduce(
      (result, string, i) =>
        result +
        string +
        (values[i]
          ? Array.isArray(values[i])
            ? values[i].join("")
            : values[i]
          : ""),
      ""
    )
    .trim();

main();

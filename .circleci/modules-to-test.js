const parseDiff = require('diffparser');
const fetch = require('node-fetch');
const { moduleDependencies } = require('../package.json').fxa;
const fs = require('fs');
const path = require('path');

process.on('unhandledRejection', (e) => {
  console.error(e);
  process.exit(1);
});

const testable = fs
  .readdirSync(path.resolve(__dirname, '..', 'packages'), {
    withFileTypes: true,
  })
  .filter((de) => de.isDirectory())
  .map((de) => de.name);

const IS_BUILD_SCRIPT = /^\.circleci\//;

function moduleName(path) {
  const parts = path.split('/');
  return parts.length > 2 && testable.includes(parts[1]) ? parts[1] : 'root';
}

async function getModules(org, repo, prNumber) {
  try {
    const response = await fetch(
      `https://patch-diff.githubusercontent.com/raw/${org}/${repo}/pull/${prNumber}.diff`
    );
    const diff = parseDiff(await response.text());
    const modules = new Set();
    for (const { to, from } of diff) {
      if (IS_BUILD_SCRIPT.test(to) || IS_BUILD_SCRIPT.test(from)) {
        modules.add('all');
      }

      [to, from]
        .filter((n) => n !== '/dev/null')
        .forEach((n) => modules.add(moduleName(n)));
    }
    return modules;
  } catch (e) {
    console.error(e);
    return new Set(['all']);
  }
}

async function modulesToSkip(org, repo, prNumber, branch) {
  try {
    const labelRes = await fetch(
      `https://api.github.com/repos/${org}/${repo}/issues/${prNumber}/labels`
    );
    const labels = await labelRes.json();
    const skipModules = branch.startsWith('email-service')
      ? []
      : ['fxa-email-service'];
    if (Array.isArray(labels) && labels.find((l) => l.name === '🙈 skip ci')) {
      const skipLabels = labels
        .filter((l) => l.name.startsWith('fxa-'))
        .map((l) => l.name);
      if (skipLabels.length === 0) {
        return ['all'];
      }
      skipModules.push(...skipLabels);
    }
    return skipModules;
  } catch (e) {
    console.error(e);
    return [];
  }
}

function modulesToTest(changed) {
  const toTest = new Set(changed);
  let size;
  do {
    size = toTest.size;
    for (const [mod, deps] of Object.entries(moduleDependencies)) {
      for (const m of toTest) {
        if (deps.includes(m)) {
          toTest.add(mod);
        }
      }
    }
  } while (size < toTest.size);
  return toTest;
}

async function main() {
  const env = process.env;
  const branch = env.CIRCLE_BRANCH;
  const org = env.CIRCLE_PROJECT_USERNAME;
  const repo = env.CIRCLE_PROJECT_REPONAME;
  const pr = env.CIRCLE_PULL_REQUEST;

  if (pr) {
    const prNumber = /\d+$/.exec(pr)[0];
    const skipModules = await modulesToSkip(org, repo, prNumber, branch);
    if (skipModules.includes('all')) {
      return;
    }
    const toTest = Array.from(
      modulesToTest(await getModules(org, repo, prNumber))
    ).filter((m) => m !== 'root');
    const toRun = (toTest.includes('all') ? testable : toTest).filter(
      (m) => !skipModules.includes(m)
    );
    for (const mod of toRun) {
      console.log(mod);
    }
  } else if (branch === 'master') {
    console.log('all');
  } else {
    //TODO diff master..branch
    console.log('all');
  }
}

main();

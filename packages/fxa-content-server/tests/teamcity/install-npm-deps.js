
/**
 * Install local versions of dependencies specified
 * in the project's package.json file.
 *
 * Usage:
 * node install-npm-deps.js helmet httpparser2 xmlhttprequest
 */

const path = require('path');
const spawn = require('child_process').spawn;

const packageJSONPath = path.join(__dirname, '..', '..', 'package.json');
const packageJSON = require(packageJSONPath);
const dependencies = packageJSON.dependencies;
const devDependencies = packageJSON.devDependencies;

const GITHUB_DEP_URL = /^(git|https):\/\/github\.com\//;

const deps = process.argv.reduce((accumulator, depName, index) => {
  // index 0 is the name of this script
  if (index > 1) {
    const version = dependencies[depName] || devDependencies[depName];
    if (! version) {
      throw new Error('depName does not have an associated version');
    }

    if (GITHUB_DEP_URL.test(version)) {
      // cleanup github URLs to only specify username/repo#version
      accumulator.push(version.replace(GITHUB_DEP_URL, ''));
    } else {
      accumulator.push(`${depName}@${version}`);
    }
  }

  return accumulator;
}, []);

console.log('installing', deps.join(' '));

const installProcess = spawn('npm', ['install'].concat(deps));

installProcess.stdout.on('data', (data) => {
  console.log(data.toString());
});

installProcess.stderr.on('data', (data) => {
  console.error(data.toString());
});

installProcess.on('close', (code) => {
  console.log(`exiting with ${code}`);
  process.exit(code);
});

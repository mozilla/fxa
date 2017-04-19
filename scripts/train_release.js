/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Script to tag a train across all the repos that need it.

'use strict'

const cp = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')

function err(msg) {
  console.error()
  console.error(String(msg))
  console.error()
  process.exit(1)
}

function usage() {
  err([
    'Usage: node train_release.js <train version>',
    '',
    'Options:',
    '  --push     Push the tags to the remote repos',
    '  --verbose  Turn on all stdio'
  ].join('\n'))
}

function tempDir(name) {
  const baseName = `${name}-${Date.now()}-${process.pid}`
  const dir = path.join(os.tmpdir(), baseName)
  fs.mkdirSync(dir)
  return dir
}

function releaseRepos(repos, version, opts) {
  const push = !!opts.push
  const stdio = opts.verbose ? 'inherit' : ['ignore', 'ignore', process.stderr]
  const tmp = tempDir(`fxa-train-${version}`)
  console.log(`Temporary dir: ${tmp}`)
  repos.forEach(repo => {
    console.log(`Checking ${repo} for ${version}...`)
    const dir = path.join(tmp, repo)
    cp.execSync(`git clone git@github.com:mozilla/${repo}`, {
      cwd: tmp,
      stdiot: stdio
    })
    const cpOpts = {
      cwd: dir,
      stdio: stdio
    }
    try {
      cp.execSync(`git checkout ${version}`, {
        cwd: dir,
        stdio: 'ignore'
      })
      console.log(`Train ${version} already exists for ${repo}, skipping...`)

      // cwd differs from 'run'
      console.log(`rm -rf ${repo}`)
      cp.execSync(`rm -rf ${repo}`, {
        cwd: tmp,
        stdio: stdio
      })
      return
    } catch (e) {
      // tag doesn't exist, creating
      console.log(`No exising train ${version}, releasing...`)
    }

    function run(cmd) {
      console.log(cmd)
      cp.execSync(cmd, cpOpts)
    }

    run('npm run shrinkwrap')
    // slice off the v, since grunt version adds it
    run(`grunt version --setversion=${version.slice(1)}`)

    if (push) {
      run(`git push origin ${version}`)
      run('git push origin master')

      // cwd differs from 'run'
      console.log(`rm -rf ${repo}`)
      cp.execSync(`rm -rf ${repo}`, {
        cwd: tmp,
        stdio: stdio
      })
    }
  })
}

function getTrainVersion(val) {
  if (!val) {
    return null
  }
  if (!/^[0-9]+$/g.test(val)) {
    err(`Invalid train version: ${val}`)
    return null
  }
  return `v1.${val}.0`
}

function main() {
  const REPOS = [
    'fxa-auth-db-mysql',
    'fxa-auth-mailer',
    // db and mailer must go before auth
    'fxa-auth-server',
    'fxa-content-server',
    'fxa-oauth-server',
    'fxa-profile-server'
  ]
  const version = getTrainVersion(process.argv[2])
  if (!version) {
    usage()
    return
  }
  const args = process.argv.slice(3)
  const opts = {}
  opts.push = args.indexOf('--push') !== -1
  opts.verbose = args.indexOf('--verbose') !== -1
  console.log('options = ', opts)

  try {
    releaseRepos(REPOS, version, opts)
  } catch (e) {
    err(e)
  }
}


main()

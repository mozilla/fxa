#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var commandLineOptions = require('commander')
var fs = require('fs')
var P = require('../lib/promise')
var path = require('path')

commandLineOptions
  .option('-b, --batchsize [size]', 'Number of emails to send in a batch. Defaults to 500', parseInt)
  .option('-i, --input <filename>', 'JSON input file')
  .option('-o, --output <directory>', 'Directory batch files should be stored.')
  .parse(process.argv)

var BATCH_SIZE = commandLineOptions.batchsize || 500

var requiredOptions = [
  'input',
  'output'
]

requiredOptions.forEach(checkRequiredOption)

P.resolve()
  .then(readRecords)
  .then(createBatches)
  .then(writeBatches)
  .then(function (batches) {
    var msg = batches.length + ' batch' + (batches.length === 1 ? '' : 'es') + ' created'
    console.log(msg)
    process.exit(0)
  })


function checkRequiredOption(optionName) {
  if (! commandLineOptions[optionName]) {
    console.error('--' + optionName + ' required')
    process.exit(1)
  }
}

function readRecords() {
  var inputFileName = path.resolve(commandLineOptions.input)
  var fsStats
  try {
    fsStats = fs.statSync(inputFileName)
  } catch (e) {
    console.error(inputFileName, 'invalid filename')
    process.exit(1)
  }

  if (! fsStats.isFile()) {
    console.error(inputFileName, 'is not a file')
    process.exit(1)
  }

  var records = []
  try {
    records = require(inputFileName)
  } catch(e) {
    console.error(inputFileName, 'does not contain JSON')
    process.exit(1)
  }

  if (! records.length) {
    console.error('uh oh, no records found')
    process.exit(1)
  }

  return records
}

function createBatches(records) {
  var batches = []

  while (records.length) {
    var batch = records.splice(0, BATCH_SIZE)
    batches.push(batch)
  }

  return batches
}

function writeBatches(batches) {
  var outputDirectory = path.resolve(commandLineOptions.output)
  ensureOutputDirExists(outputDirectory)

  batches.forEach(function (batch, index) {
    var outputPath = path.join(outputDirectory, index + '.json')
    fs.writeFileSync(outputPath, JSON.stringify(batch, null, 2))
  })

  return batches
}

function ensureOutputDirExists(outputDir) {
  var dirStats
  try {
    dirStats = fs.statSync(outputDir)
  } catch (e) {
    fs.mkdirSync(outputDir)
    return
  }

  if (! dirStats.isDirectory()) {
    console.error(outputDir + ' is not a directory')
    process.exit(1)
  }
}

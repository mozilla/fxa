/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const fs = require('fs')

const marketing = require('../marketing')

if (process.argv.length !== 3) {
  console.error(`Usage: ${process.argv[1]} file`)
  process.exit(1)
}

main()

async function main () {
  const local_file_stream = fs.createReadStream(process.argv[2])

  await marketing.processStream(local_file_stream)
}

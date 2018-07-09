'use strict'

const fs = require('fs')

const marketing = require('../marketing')

if (process.argv.length !== 3) {
  console.error(`Usage: ${process.argv[1]} file`)
  process.exit(1)
}

const main = async () => {
  const local_file_stream = fs.createReadStream(process.argv[2])

  await marketing.processStream(local_file_stream)
}

main()

/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

var test = require('tap').test
var fs = require('fs')
var jshint = require('jshint').JSHINT
var path = require('path')
var walk = require('walk')
var util = require('util')

var jshintrc
var filesToLint = []

test(
  'jshint is setup',
  function (t) {
    jshintrc = JSON.parse(fs.readFileSync(path.join(__dirname, '../.jshintrc')).toString())

    t.type(jshintrc, 'object', '.jshintrc is readable')

    var walker = walk.walk(path.join(__dirname, '..'), { filters: ['node_modules'] })
    walker.on('file', function(root, fStat, next) {
      var f = path.join(root, fStat.name)
      if (/\.js$/.test(f)) {
        filesToLint.push(f)
      }
      next()
    })
    walker.on('end', function () {
      t.equal(filesToLint.length > 4, true, 'files to lint can be found')
      t.end()
    })
  }
)

test(
  'linting produces no errors',
  function (t) {
    var errors = []
    var unreadableFiles = []

    function checkNext() {
      if (!filesToLint.length) {
        var buf = ''
        if (errors.length) {
          buf = util.format('\n        %d errors:\n* ', errors.length)
          buf += errors.join('\n* ')
        }

        t.equal(unreadableFiles.join('\n'), '', 'all files can be read')
        t.equal(buf, '', 'no errors have been found')
        t.end()
        return
      }

      var f = filesToLint.shift()
      fs.readFile(f.toString(), function (err, data) {
        if (err) {
          unreadableFiles.push(f)
        } else {
          f = path.relative(process.cwd(), f)
          if (!jshint(data.toString(), jshintrc)) {
            jshint.errors.forEach(function(e) {
              if (e) {
                errors.push(util.format('%s %s:%d - %s', e.id, f, e.line, e.reason))
              }
            })
          }
          checkNext()
        }
      })
    }
    checkNext()
  }
)

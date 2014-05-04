var test = require('tap').test
var emailRecord = require('../email_record')

test(
  'isBlocked works',
  function (t) {
    function now() {
      return 1000 // old school
    }
    var er = new (emailRecord(500, 2, now))

    t.equal(er.isBlocked(), false, 'record has never been blocked')
    er.bk = 499
    t.equal(er.isBlocked(), false, 'blockedAt is older than block interval')
    er.bk = 501
    t.equal(er.isBlocked(), true, 'blockedAt is within the block interval')
    t.end()
  }
)

test('trimHits')

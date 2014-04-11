/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('../ptaptest')
var P = require('../../promise')
var bounceHandler = require('../../bounces/handler')
var log = {
  info: function () {},
  error: function () {}
}

test(
  'deletes account when bounce is permanent and email is not verified',
  function (t) {
    var foo = 'foo@restmail.net'
    var uid = '123'
    var db = {
      deleteAccount: function (record) {
        t.equal(record.uid, uid, 'deleted uid')
        t.end()
        return P()
      },
      emailRecord: function (email) {
        t.equal(email, foo, 'get record')
        return P({
          uid: uid,
          emailVerified: false
        })
      }
    }
    var message = {
      bounce: {
        bounceType: 'Permanent',
        bouncedRecipients: [
          {
            emailAddress: foo
          }
        ]
      }
    }
    bounceHandler(db, log)(message)
  }
)

test(
  'does not delete account when bounce is permanent and email is verified',
  function (t) {
    var foo = 'foo@restmail.net'
    var uid = '123'
    var db = {
      deleteAccount: function (record) {
        t.fail('should not delete account')
      },
      emailRecord: function (email) {
        t.equal(email, foo, 'get record')
        setImmediate(t.end.bind(t))
        return P({
          uid: uid,
          emailVerified: true
        })
      }
    }
    var message = {
      bounce: {
        bounceType: 'Permanent',
        bouncedRecipients: [
          {
            emailAddress: foo
          }
        ]
      }
    }
    bounceHandler(db, log)(message)
  }
)

test(
  'does nothing when bounce is not permanent',
  function (t) {
    var foo = 'foo@restmail.net'
    var db = {
      deleteAccount: function (record) {
        t.fail('should not delete account')
      },
      emailRecord: function (email) {
        t.fail('why did you do that?')
      }
    }
    var message = {
      bounce: {
        bounceType: 'Transient',
        bouncedRecipients: [
          {
            emailAddress: foo
          }
        ]
      }
    }
    setImmediate(t.end.bind(t))
    bounceHandler(db, log)(message)
    t.ok(true, 'handled transient bounce')
  }
)

test(
  'deletes account when complaint is abuse and email is not verified',
  function (t) {
    var foo = 'foo@restmail.net'
    var uid = '123'
    var db = {
      deleteAccount: function (record) {
        t.equal(record.uid, uid, 'deleted uid')
        t.end()
        return P()
      },
      emailRecord: function (email) {
        t.equal(email, foo, 'get record')
        return P({
          uid: uid,
          emailVerified: false
        })
      }
    }
    var message = {
      complaint: {
        complaintFeedbackType: 'abuse',
        complaintRecipients: [
          {
            emailAddress: foo
          }
        ]
      }
    }
    bounceHandler(db, log)(message)
  }
)

test(
  'does not delete account when complaint is abuse and email is verified',
  function (t) {
    var foo = 'foo@restmail.net'
    var uid = '123'
    var db = {
      deleteAccount: function (record) {
        t.fail('should not delete account')
      },
      emailRecord: function (email) {
        t.equal(email, foo, 'get record')
        setImmediate(t.end.bind(t))
        return P({
          uid: uid,
          emailVerified: true
        })
      }
    }
    var message = {
      complaint: {
        complaintFeedbackType: 'abuse',
        complaintRecipients: [
          {
            emailAddress: foo
          }
        ]
      }
    }
    bounceHandler(db, log)(message)
  }
)

test(
  'does nothing when complaint is not abuse',
  function (t) {
    var foo = 'foo@restmail.net'
    var db = {
      deleteAccount: function (record) {
        t.fail('should not delete account')
      },
      emailRecord: function (email) {
        t.fail('why did you do that?')
      }
    }
    var message = {
      complaint: {
        complaintFeedbackType: 'not-spam',
        complaintRecipients: [
          {
            emailAddress: foo
          }
        ]
      }
    }
    setImmediate(t.end.bind(t))
    bounceHandler(db, log)(message)
    t.ok(true, 'handled complaint')
  }
)

test(
  'handles unknown accounts',
  function (t) {
    var foo = 'foo@restmail.net'
    var log = {
      info: function () {},
      error: function (msg) {
        t.equal(msg.email, foo, 'email ok')
        t.equal(msg.err.message, 'test', 'error is ok')
        t.end()
      }
    }
    var db = {
      deleteAccount: function (record) {
        t.fail('should not delete account')
      },
      emailRecord: function (email) {
        t.equal(email, foo, 'email ok')
        return P.reject(new Error('test'))
      }
    }
    var message = {
      bounce: {
        bounceType: 'Permanent',
        bouncedRecipients: [
          {
            emailAddress: foo
          }
        ]
      }
    }
    bounceHandler(db, log)(message)
    t.ok(true, 'handled transient bounce')
  }
)

test(
  'handles db delete errors',
  function (t) {
    var foo = 'foo@restmail.net'
    var uid = '123'
    var log = {
      info: function () {},
      error: function (msg) {
        t.equal(msg.email, foo, 'email ok')
        t.equal(msg.err.message, 'test', 'error is ok')
        t.end()
      }
    }
    var db = {
      deleteAccount: function (record) {
        return P.reject(new Error('test'))
      },
      emailRecord: function (email) {
        t.equal(email, foo, 'email ok')
        return P({
          uid: uid,
          email: email,
          emailVerified: false
        })
      }
    }
    var message = {
      bounce: {
        bounceType: 'Permanent',
        bouncedRecipients: [
          {
            emailAddress: foo
          }
        ]
      }
    }
    bounceHandler(db, log)(message)
  }
)

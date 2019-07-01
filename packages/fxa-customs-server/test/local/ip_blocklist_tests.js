/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

var fs = require('fs');
var os = require('os');
var path = require('path');
var Promise = require('bluebird');
var test = require('tap').test;

var log = {
  info: function() {},
  error: function() {},
  trace: function() {},
};

var config = {
  ipBlocklist: {
    updatePollInterval: 1, // 1 Second
    logOnlyLists: ['./test/mocks/logOnlyList.netset'],
  },
};

var IPBlocklist = require('../../lib/ip_blocklist')(log, config);
var IPBlocklistManager = require('../../lib/ip_blocklist_manager')(log, config);

var lists = [
  './test/mocks/firehol_level1.netset',
  './test/mocks/simple.netset',
];

var commonTestCases = [
  {
    name: 'IPBlocklist',
    blocklistClass: IPBlocklist,
    list: lists[0],
  },
  {
    name: 'IPBlocklistManager',
    blocklistClass: IPBlocklistManager,
    list: lists,
  },
];

commonTestCases.forEach(function(testCase) {
  var BlocklistClass = testCase.blocklistClass;
  var filePath = testCase.list;
  var name = testCase.name;

  test(name + ', calling contains without loading csv return false', function(
    t
  ) {
    var ipBlocklist = new BlocklistClass();
    var result = ipBlocklist.contains('0.0.0.0');
    t.equal(result, false, 'should not have found ip');
    t.end();
  });

  test(name + ', load ip blocklist', function(t) {
    var ipBlocklist = new BlocklistClass();

    ipBlocklist
      .load(filePath)
      .then(function() {
        t.end();
      })
      .catch(function() {
        t.fail('Failed to load csv');
        t.end();
      });
  });

  test(name + ', throw for empty ip', function(t) {
    var ipBlocklist = new BlocklistClass();

    ipBlocklist.load(filePath).then(function() {
      t.throws(function() {
        ipBlocklist.contains();
      });
      t.end();
    });
  });

  test(name + ', throw for invalid ip', function(t) {
    var ipBlocklist = new BlocklistClass();

    ipBlocklist.load(filePath).then(function() {
      t.throws(function() {
        ipBlocklist.contains('notanip');
      });
      t.end();
    });
  });

  test(name + ', returns true for ip in blocklist', function(t) {
    var ipBlocklist = new BlocklistClass();

    ipBlocklist.load(filePath).then(function() {
      var result = ipBlocklist.contains('1.93.0.224');
      t.equal(result, true, 'return true for found ip');
      t.end();
    });
  });

  test(name + ', returns true for ip in blocklist range', function(t) {
    var ipBlocklist = new BlocklistClass();

    ipBlocklist.load(filePath).then(function() {
      var result = ipBlocklist.contains('0.0.0.1');
      t.equal(result, true, 'return true for found ip');
      t.end();
    });
  });

  test(name + ', returns false for ip not in blocklist', function(t) {
    var ipBlocklist = new BlocklistClass();

    ipBlocklist.load(filePath).then(function() {
      var result = ipBlocklist.contains('12.34.32.1');
      t.equal(result, false, 'return false for not found ip');
      t.end();
    });
  });

  test(name + ', returns false for ip not in blocklist range', function(t) {
    var ipBlocklist = new BlocklistClass();

    ipBlocklist.load(filePath).then(function() {
      var result = ipBlocklist.contains('3.0.0.0');
      t.equal(result, false, 'return true for found ip');
      t.end();
    });
  });
});

// Clear and Refresh test cases are not similar for IPBlocklist
// and IPBlocklistManager
test('IPBlocklist, clear blocklist', function(t) {
  var ipBlocklist = new IPBlocklist();

  ipBlocklist.load(lists[0]).then(function() {
    ipBlocklist.clear();
    t.deepEqual(
      ipBlocklist.ipsByPrefixLength,
      {},
      'empty ipsByPrefixLength object'
    );
    t.equal(ipBlocklist.prefixLengths.length, 0, 'empty ip prefix');
    t.end();
  });
});

test('IPBlocklist, refresh blocklist', function(t) {
  var ipBlocklist = new IPBlocklist();

  ipBlocklist
    .load(lists[0])
    .then(function() {
      return ipBlocklist.refresh();
    })
    .then(function() {
      t.end();
    })
    .catch(function(err) {
      t.fail(err);
      t.end();
    });
});

test('IPBlocklistManager, clear blocklist', function(t) {
  var ipBlocklist = new IPBlocklistManager();

  ipBlocklist.load(lists).then(function() {
    ipBlocklist.clear();
    t.equal(ipBlocklist.ipBlocklists.length, 0, 'empty blocklist');
    t.end();
  });
});

test('IPBlocklistManager, logOnly', function(t) {
  var ipBlocklist = new IPBlocklistManager();

  ipBlocklist.load(lists, config.ipBlocklist.logOnlyLists).then(function() {
    var result = ipBlocklist.contains('86.75.30.9');
    t.equal(result, false, 'return false for not found ip');
    t.end();
  });
});

test('IPBlocklistManager, load fails on non array', function(t) {
  var ipBlocklist = new IPBlocklistManager();

  ipBlocklist
    .load('./somepath')
    .then(function() {
      t.fail('Failed to load csv');
      t.end();
    })
    .catch(function(err) {
      t.assert('lists must be an array', err.message);
      t.end();
    });
});

test('IPBlocklistManager, reloads file correctly', function(t) {
  var tmpFilename = path.join(
    os.tmpdir(),
    'fxa-customs-ipblocklist-' + Date.now() + '.netset'
  );
  var tmpFileContents = '87.87.87.87';
  var tmpFileContents2 = '87.87.87.86';

  var ipBlocklist = new IPBlocklistManager();

  fs.writeFileSync(tmpFilename, tmpFileContents, {});

  ipBlocklist
    .load([tmpFilename])
    .then(function() {
      ipBlocklist.pollForUpdates();

      var result = ipBlocklist.contains(tmpFileContents);
      t.equal(result, true, 'should contain ip');

      result = ipBlocklist.contains(tmpFileContents2);
      t.equal(result, false, 'should not contain ip');

      // Delay a little to ensure file timestamp changes
      // from first file write
      return Promise.delay(1000);
    })
    .then(function() {
      fs.writeFileSync(tmpFilename, tmpFileContents2, {});

      // Delay again to ensure that list gets reloaded
      return Promise.delay(1100);
    })
    .then(function() {
      var result = ipBlocklist.contains(tmpFileContents);
      t.equal(result, false, 'should not contain ip');

      result = ipBlocklist.contains(tmpFileContents2);
      t.equal(result, true, 'should contain ip');

      ipBlocklist.stopPolling();

      // Write original file to ensure that stopPolling works
      fs.writeFileSync(tmpFilename, tmpFileContents, {});

      return Promise.delay(1000);
    })
    .then(function() {
      var result = ipBlocklist.contains(tmpFileContents);
      t.equal(result, false, 'should not contain ip');

      result = ipBlocklist.contains(tmpFileContents2);
      t.equal(result, true, 'should contain ip');

      t.end();
    })
    .finally(function() {
      // Try to clean up after ourselves
      try {
        fs.unlinkSync(tmpFilename);
      } catch (err) {}
    });
});

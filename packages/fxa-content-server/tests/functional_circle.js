/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Select which tests to run on circleci.
 *
 * If CIRCLE_NODE_TOTAL and CIRCLE_NODE_INDEX environment vars are defined,
 * tests are parallelized into CIRCLE_NODE_TOTAL runners. The suites are not
 * exactly the same size and will take a different amount of time to run,
 * but this is a good place to start.
 */
function selectCircleTests(allTests) {
  var testsToRun = allTests;

  if (process.env.CIRCLE_NODE_TOTAL) {
    console.log('CIRCLE_NODE_INDEX', process.env.CIRCLE_NODE_INDEX);
    console.log('CIRCLE_NODE_TOTAL', process.env.CIRCLE_NODE_TOTAL);

    var circleTotal = parseInt(process.env.CIRCLE_NODE_TOTAL, 10);
    var circleIndex = parseInt(process.env.CIRCLE_NODE_INDEX, 10);

    testsToRun = allTests.filter((test, index) => {
      var passes = index % circleTotal === circleIndex;
      return passes;
    });
  }

  return testsToRun;
}

module.exports = selectCircleTests(require('./functional'));

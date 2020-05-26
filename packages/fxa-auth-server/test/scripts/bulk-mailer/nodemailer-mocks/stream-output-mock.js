/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const sinon = require('sinon');
const StreamOutputMock = require('../../../../scripts/bulk-mailer/nodemailer-mocks/stream-output-mock');

describe('stdout-mock', () => {
  let stdoutMock;
  let streamMock;

  before(() => {
    streamMock = {
      write: sinon.spy(),
    };

    stdoutMock = new StreamOutputMock({
      failureRate: 0,
      stream: streamMock,
    });
  });

  it('writes to the stream', (done) => {
    stdoutMock.sendMail(
      {
        to: 'testuser@testuser.com',
      },
      (err, result) => {
        try {
          assert.isNull(err);
          assert.ok(result);

          // don't really care how many times it's called.
          assert.isTrue(streamMock.write.called);

          done();
        } catch (err) {
          done(err);
        }
      }
    );
  });
});

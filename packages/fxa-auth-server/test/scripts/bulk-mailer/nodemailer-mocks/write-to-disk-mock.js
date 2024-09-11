/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

import { assert } from 'chai';
import fs from 'fs';
import path from 'path';
import rimraf from 'rimraf';
import WriteToDiskMock from '../../../../scripts/bulk-mailer/nodemailer-mocks/write-to-disk-mock';

const OUTPUT_DIR = path.resolve(__dirname, 'test_output');

describe('stdout-mock', () => {
  let writeToDiskMock;

  before(() => {
    rimraf.sync(OUTPUT_DIR);
    writeToDiskMock = new WriteToDiskMock({
      failureRate: 0,
      outputDir: OUTPUT_DIR,
    });
  });

  after(() => {
    rimraf.sync(OUTPUT_DIR);
  });

  it('writes to the output directory', (done) => {
    writeToDiskMock.sendMail(
      {
        cc: [],
        to: 'testuser@testuser.com',
        text: 'ok',
        html: '<p>ok</p>',
        headers: {},
      },
      (err, result) => {
        try {
          assert.isNull(err);
          assert.ok(result);

          assert.ok(
            fs.readFileSync(path.join(OUTPUT_DIR, 'testuser@testuser.com.txt'))
          );
          assert.ok(
            fs.readFileSync(path.join(OUTPUT_DIR, 'testuser@testuser.com.html'))
          );
          assert.ok(
            fs.readFileSync(
              path.join(OUTPUT_DIR, 'testuser@testuser.com.headers')
            )
          );

          done();
        } catch (err) {
          done(err);
        }
      }
    );
  });
});

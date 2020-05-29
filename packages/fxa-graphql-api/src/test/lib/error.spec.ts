/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import 'mocha';

import { ApolloError } from 'apollo-server';
import { assert } from 'chai';
import sinon from 'ts-sinon';

import { CatchGatewayError, PROFILE_INFO_URL } from '../../lib/error';

const sandbox = sinon.createSandbox();
const exploder = sandbox.stub();

class Test {
  @CatchGatewayError
  public async boom() {
    return exploder();
  }
}

describe('CatchGatewayError', () => {
  let test: Test;

  beforeEach(() => {
    test = new Test();
  });

  afterEach(() => {
    sandbox.reset();
  });

  it('rethrows auth server error', async () => {
    const authError: any = new Error('Invalid');
    authError.code = 400;
    authError.errno = 999;
    authError.info = 'fxaurl';
    exploder.rejects(authError);
    try {
      await test.boom();
      assert.fail('boom should explode');
    } catch (err) {
      assert.instanceOf(err, ApolloError);
      const aerr = err as ApolloError;
      assert.deepEqual(aerr.extensions, {
        code: 400,
        errno: 999,
        info: 'fxaurl',
      });
    }
  });

  it('rethrows profile server error', async () => {
    const profileError: any = new Error('Invalid');
    profileError.status = 400;
    profileError.stack = 'frames';
    profileError.response = {
      body: {
        errno: 999,
      },
    };
    exploder.rejects(profileError);
    try {
      await test.boom();
      assert.fail('boom should explode');
    } catch (err) {
      assert.instanceOf(err, ApolloError);
      const aerr = err as ApolloError;
      assert.deepEqual(aerr.extensions, {
        code: 400,
        errno: 999,
        info: PROFILE_INFO_URL,
      });
    }
  });

  it('rethrows any other error', async () => {
    exploder.rejects(new Error('boom'));
    try {
      await test.boom();
      assert.fail('boom should explode');
    } catch (err) {
      assert.equal(err.message, 'boom');
    }
  });
});

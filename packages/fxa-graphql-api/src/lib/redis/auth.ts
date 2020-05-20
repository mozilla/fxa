/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import Redis from 'ioredis';
import { Service, Container } from 'typedi';

import { authRedisConfig } from '../constants';

function createAuthRedis() {
  return new AuthRedis(Container.get(authRedisConfig));
}

@Service({ factory: createAuthRedis })
export class AuthRedis extends Redis {}

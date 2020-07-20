/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Token } from 'typedi';
import { AppConfig } from '../config';
import { Logger } from 'mozlog';
import { RedisConfig } from '../config';
import AuthClient from 'fxa-auth-client';

export const configContainerToken = new Token<AppConfig>();
export const loggerContainerToken = new Token<Logger>();

export const fxAccountClientToken = new Token<AuthClient>();
export const authRedisConfig = new Token<RedisConfig>();

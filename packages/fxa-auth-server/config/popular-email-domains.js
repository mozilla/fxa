/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

// This is a list of popular email domains based on FxA users
// Ref: https://bugzilla.mozilla.org/show_bug.cgi?id=1337932
const domains = new Set([
  'gmail.com',
  'hotmail.com',
  'yahoo.com',
  'mail.ru',
  'outlook.com',
  'aol.com',
  'qq.com',
  'web.de',
  'yandex.ru',
  'gmx.de',
  'live.com',
  'comcast.net',
  't-online.de',
  'hotmail.fr',
  'msn.com',
  'yahoo.fr',
  'orange.fr',
  '163.com',
  'icloud.com',
  'hotmail.co.uk'
])

module.exports = domains

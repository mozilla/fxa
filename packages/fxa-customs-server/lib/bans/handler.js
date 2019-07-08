/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function(fetchRecords, setRecord, log) {
  async function blockIp(ip) {
    const { ipRecord } = await fetchRecords({ ip });
    log.info({ op: 'handleBan.blockIp', ip: ip });
    ipRecord.block();
    return setRecord(ipRecord);
  }

  async function blockEmail(email) {
    const { emailRecord } = await fetchRecords({ email });
    log.info({ op: 'handleBan.blockEmail', email: email });
    emailRecord.block();
    return setRecord(emailRecord);
  }

  async function handleBan(message) {
    if (message.ban && message.ban.ip) {
      return blockIp(message.ban.ip);
    } else if (message.ban && message.ban.email) {
      return blockEmail(message.ban.email);
    }

    log.error({ op: 'handleBan', ban: !!message.ban });
    return Promise.reject('invalid message');
  }

  return handleBan;
};

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Runs the pairing v2 message exchange between two real fxa-pairing-channel
 * peers on ResumableWebSocket, through a TCP proxy that can delay or cut either
 * peer, against a local channelserver. Prints what each scenario ends in.
 *
 *   PAIR_PORT=8765 PAIR_STATSD_HOST= ../../../channelserver/target/debug/channelserver &
 *   node --experimental-transform-types scripts/pairing-netsim.mjs [ws://localhost:8765]
 */
import net from 'node:net';
import { createRequire } from 'node:module';

globalThis.window = globalThis;
globalThis.document = {
  visibilityState: 'visible',
  addEventListener() {},
  removeEventListener() {},
};
const { PairingChannel } = createRequire(import.meta.url)(
  'fxa-pairing-channel/dist/FxAccountsPairingChannel.babel.umd.js'
);
const { ResumableWebSocket } = await import(
  '../src/lib/channels/resumable-websocket.ts'
);

const upstream = new URL(process.argv[2] || 'ws://localhost:8765');
const NativeWebSocket = globalThis.WebSocket;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** TCP proxy for one peer. `delay` is per direction; `cut` kills its sockets. */
function proxy({ delay = 0 } = {}) {
  const live = new Set();
  const pipe = (from, to) =>
    from.on('data', (d) =>
      setTimeout(() => !to.destroyed && to.write(d), p.delay)
    );
  const server = net.createServer((client) => {
    const server = net.connect(upstream.port, upstream.hostname);
    live.add(client).add(server);
    pipe(client, server);
    pipe(server, client);
    for (const [a, b] of [
      [client, server],
      [server, client],
    ]) {
      a.on('error', () => {});
      a.on('close', () =>
        setTimeout(() => !b.blackholed && b.destroy(), p.delay)
      );
    }
  });
  const p = {
    delay,
    /**
     * rst: the server sees the drop. blackhole: it does not, only the peer does.
     * silent: neither end is told; bytes just stop, and new connections work.
     */
    cut(mode) {
      for (const s of live) {
        if (mode === 'silent') {
          s.blackholed = true;
          s.removeAllListeners('data');
          s.pause();
          continue;
        }
        if (mode === 'blackhole' && s.remotePort === Number(upstream.port)) {
          s.blackholed = true;
          s.removeAllListeners('data');
          s.pause();
          continue;
        }
        s.resetAndDestroy();
      }
      live.clear();
    },
    listen: () =>
      new Promise((r) =>
        server.listen(0, () => r(`ws://localhost:${server.address().port}`))
      ),
    close: () => server.close(),
  };
  return p;
}

/** Same swap pairing-channel.ts does, so the peer runs on ResumableWebSocket. */
function withResumable(start) {
  let socket;
  globalThis.WebSocket = class extends ResumableWebSocket {
    constructor(url) {
      super(url, NativeWebSocket);
      socket = this;
    }
  };
  try {
    return { result: start(), socket: () => socket };
  } finally {
    globalThis.WebSocket = NativeWebSocket;
  }
}

function watch(name, channel, log) {
  const got = [];
  const waiters = [];
  channel.addEventListener('message', (e) => {
    got.push(e.detail.data.message);
    waiters.splice(0).forEach((w) => w());
  });
  channel.addEventListener('error', (e) =>
    log.push(`${name} error: ${e.detail?.error?.message}`)
  );
  channel.addEventListener('close', () => log.push(`${name} close`));
  return async (message, timeoutMs = 60_000) => {
    const stop = Date.now() + timeoutMs;
    while (!got.includes(message)) {
      if (Date.now() > stop) throw new Error(`${name} never got ${message}`);
      await Promise.race([new Promise((r) => waiters.push(r)), sleep(250)]);
    }
  };
}

async function scenario(title, { authDelay = 0, suppDelay = 0, fault } = {}) {
  const log = [];
  const authProxy = proxy({ delay: authDelay });
  const suppProxy = proxy({ delay: suppDelay });
  const started = Date.now();
  let outcome;
  let suppSocket;
  try {
    const authUrl = await authProxy.listen();
    const suppUrl = await suppProxy.listen();

    const a = withResumable(() => PairingChannel.create(authUrl));
    const auth = await a.result;
    const authGot = watch('authority', auth, log);

    const s = withResumable(() =>
      PairingChannel.connect(suppUrl, auth.channelId, auth.channelKey)
    );
    const supp = await s.result;
    suppSocket = s.socket();
    for (const [name, socket] of [
      ['authority', a.socket()],
      ['supplicant', suppSocket],
    ]) {
      socket.addEventListener('resumed', () => log.push(`${name} resumed`));
    }
    const suppGot = watch('supplicant', supp, log);

    await supp.send({ message: 'pair:supp:request', data: {} });
    await authGot('pair:supp:request');
    await auth.send({ message: 'pair:auth:metadata', data: {} });
    await suppGot('pair:auth:metadata');

    await fault?.('before-supp-authorize', { authProxy, suppProxy });
    await supp.send({ message: 'pair:supp:authorize', data: {} });
    await fault?.('after-supp-authorize', { authProxy, suppProxy });
    await authGot('pair:supp:authorize');

    await auth.send({ message: 'pair:auth:authorize', data: {} });
    await suppGot('pair:auth:authorize');
    outcome = 'PAIRED';
  } catch (err) {
    outcome = `FAILED (${err.message})`;
  }
  const reason = suppSocket?.closeReason;
  console.log(
    `${title.padEnd(58)} ${outcome} in ${((Date.now() - started) / 1000).toFixed(1)}s` +
      (reason ? ` [supplicant socket: ${reason}]` : '') +
      (log.length ? `\n    ${log.join('\n    ')}` : '')
  );
  authProxy.cut();
  suppProxy.cut();
  authProxy.close();
  suppProxy.close();
}

await scenario('clean network');
await scenario('slow phone, 1.5 s each way', { suppDelay: 1500 });
await scenario('slow phone and desktop, 3 s each way', {
  suppDelay: 3000,
  authDelay: 3000,
});
await scenario('phone socket reset while waiting to approve', {
  fault: (at, { suppProxy }) =>
    at === 'before-supp-authorize' && suppProxy.cut('rst'),
});
await scenario('phone socket reset right after it approves', {
  fault: (at, { suppProxy }) =>
    at === 'after-supp-authorize' && suppProxy.cut('rst'),
});
await scenario('desktop socket reset right after the phone approves', {
  fault: (at, { authProxy }) =>
    at === 'after-supp-authorize' && authProxy.cut('rst'),
});
await scenario('phone drops, server does not see it (wifi to cell)', {
  fault: (at, { suppProxy }) =>
    at === 'before-supp-authorize' && suppProxy.cut('blackhole'),
});
await scenario('phone resets, resumes, then drops unseen', {
  fault: async (at, { suppProxy }) => {
    if (at !== 'before-supp-authorize') return;
    suppProxy.cut('rst');
    await sleep(1000);
    suppProxy.cut('blackhole');
  },
});
await scenario('phone link dies with no close event on either end', {
  fault: (at, { suppProxy }) =>
    at === 'before-supp-authorize' && suppProxy.cut('silent'),
});
process.exit(0);

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  RESUME_RETRY_MS,
  RESUME_WINDOW_MS,
  ResumableWebSocket,
} from './resumable-websocket';

class FakeSocket extends EventTarget {
  static instances: FakeSocket[] = [];
  readyState = 0;
  bufferedAmount = 0;
  sent: string[] = [];
  constructor(public url: string) {
    super();
    FakeSocket.instances.push(this);
  }
  send(data: string) {
    this.sent.push(data);
  }
  close() {
    this.drop();
  }
  open() {
    this.readyState = 1;
    this.dispatchEvent(new Event('open'));
  }
  receive(data: string) {
    this.dispatchEvent(new MessageEvent('message', { data }));
  }
  drop() {
    if (this.readyState === 3) return;
    this.readyState = 3;
    this.dispatchEvent(new Event('close'));
  }
}

const GREETING = JSON.stringify({
  channelid: 'abc',
  resume: 'f'.repeat(32),
});

function connect() {
  const socket = new ResumableWebSocket(
    'wss://channel.example.com/v1/ws/abc',
    FakeSocket as unknown as typeof WebSocket
  );
  const received: string[] = [];
  const closed = jest.fn();
  socket.addEventListener('message', (e) =>
    received.push((e as MessageEvent).data)
  );
  socket.addEventListener('close', closed);
  const first = FakeSocket.instances[0];
  first.open();
  first.receive(GREETING);
  return { socket, first, received, closed };
}

describe('ResumableWebSocket', () => {
  beforeEach(() => {
    FakeSocket.instances = [];
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('passes the greeting and messages through', () => {
    const { first, received } = connect();
    first.receive('{"message":"one"}');
    expect(received).toEqual([GREETING, '{"message":"one"}']);
  });

  it('resumes after a drop and replays what it missed, in order', () => {
    const { socket, first, received, closed } = connect();
    first.drop();
    socket.send('queued');

    const second = FakeSocket.instances[1];
    expect(second.url).toBe(
      `wss://channel.example.com/v1/ws/abc?resume=${'f'.repeat(32)}`
    );
    expect(socket.readyState).toBe(1);

    second.open();
    second.receive(GREETING);
    second.receive('{"message":"missed"}');

    expect(received).toEqual([GREETING, '{"message":"missed"}']);
    expect(second.sent).toEqual(['queued']);
    expect(closed).not.toHaveBeenCalled();
  });

  it('keeps retrying until the resume window runs out, then closes', () => {
    const { first, closed } = connect();
    first.drop();
    FakeSocket.instances[1].drop();
    jest.advanceTimersByTime(RESUME_RETRY_MS);
    expect(FakeSocket.instances).toHaveLength(3);

    jest.setSystemTime(Date.now() + RESUME_WINDOW_MS + 1);
    FakeSocket.instances[2].drop();
    jest.advanceTimersByTime(RESUME_RETRY_MS);
    expect(closed).toHaveBeenCalledTimes(1);
  });

  it('closes on a drop when the server sent no resume token', () => {
    const socket = new ResumableWebSocket(
      'wss://channel.example.com/v1/ws/abc',
      FakeSocket as unknown as typeof WebSocket
    );
    const closed = jest.fn();
    socket.addEventListener('close', closed);
    const first = FakeSocket.instances[0];
    first.open();
    first.receive(JSON.stringify({ channelid: 'abc' }));
    first.drop();
    expect(closed).toHaveBeenCalledTimes(1);
    expect(FakeSocket.instances).toHaveLength(1);
  });

  it('does not resume after its own close', () => {
    const { socket, closed } = connect();
    socket.close();
    expect(closed).toHaveBeenCalledTimes(1);
    expect(FakeSocket.instances).toHaveLength(1);
  });
});

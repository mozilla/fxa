/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  CHANNEL_CLOSED_CODE,
  RESUME_RETRY_MS,
  RESUME_WINDOW_MS,
  ResumableWebSocket,
} from './resumable-websocket';

class FakeSocket extends EventTarget {
  static instances: FakeSocket[] = [];
  readyState = 0;
  bufferedAmount = 0;
  sent: string[] = [];
  constructor(
    public url: string,
    public protocols?: string[]
  ) {
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
  drop(code = 1006) {
    if (this.readyState === 3) return;
    this.readyState = 3;
    this.dispatchEvent(new CloseEvent('close', { code }));
  }
}

const GREETING = JSON.stringify({
  channelid: 'abc',
  resume: 'f'.repeat(32),
});

let sockets: ResumableWebSocket[] = [];

function connect() {
  const socket = new ResumableWebSocket(
    'wss://channel.example.com/v1/ws/abc',
    FakeSocket as unknown as typeof WebSocket
  );
  sockets.push(socket);
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
    // A socket left resuming keeps its visibilitychange listener on document.
    sockets.forEach((socket) => socket.close());
    sockets = [];
    jest.useRealTimers();
  });

  it('asks the channel server for resume on the first connect', () => {
    const { first } = connect();
    expect(first.url).toBe('wss://channel.example.com/v1/ws/abc?resume=1');
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
    expect(second.url).toBe('wss://channel.example.com/v1/ws/abc');
    expect(second.protocols).toEqual([`resume.${'f'.repeat(32)}`]);
    expect(socket.readyState).toBe(1);

    second.open();
    second.receive(GREETING);
    second.receive('{"message":"missed"}');

    expect(received).toEqual([GREETING, '{"message":"missed"}']);
    expect(second.sent).toEqual(['queued']);
    expect(closed).not.toHaveBeenCalled();
  });

  it('resumes the next drop with the token the server rotated to', () => {
    const { first } = connect();
    first.drop();
    const second = FakeSocket.instances[1];
    second.open();
    second.receive(
      JSON.stringify({ channelid: 'abc', resume: 'e'.repeat(32) })
    );

    second.drop();

    expect(FakeSocket.instances[2].protocols).toEqual([
      `resume.${'e'.repeat(32)}`,
    ]);
  });

  it('keeps retrying until the resume window runs out, then closes', () => {
    const { first, closed } = connect();
    first.drop();
    FakeSocket.instances[1].drop();
    jest.advanceTimersByTime(RESUME_RETRY_MS - 1);
    expect(FakeSocket.instances).toHaveLength(2);
    jest.advanceTimersByTime(1);
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

  it('closes without a resume when the server ends the channel', () => {
    const { first, closed } = connect();

    first.drop(CHANNEL_CLOSED_CODE);

    expect(closed).toHaveBeenCalledTimes(1);
    expect(FakeSocket.instances).toHaveLength(1);
  });

  it('closes when the server ends the channel during a resume', () => {
    const { first, closed } = connect();
    first.drop();
    FakeSocket.instances[1].drop(CHANNEL_CLOSED_CODE);

    jest.advanceTimersByTime(RESUME_RETRY_MS);

    expect(closed).toHaveBeenCalledTimes(1);
    expect(FakeSocket.instances).toHaveLength(2);
  });

  it('does not resume after its own close', () => {
    const { socket, closed } = connect();
    socket.close();
    expect(closed).toHaveBeenCalledTimes(1);
    expect(FakeSocket.instances).toHaveLength(1);
  });

  describe('when the page becomes visible', () => {
    let visibility: DocumentVisibilityState;

    beforeEach(() => {
      visibility = 'hidden';
      jest
        .spyOn(document, 'visibilityState', 'get')
        .mockImplementation(() => visibility);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    function becomeVisible() {
      visibility = 'visible';
      document.dispatchEvent(new Event('visibilitychange'));
    }

    it('retries at once between resume attempts', () => {
      const { first } = connect();
      first.drop();
      FakeSocket.instances[1].drop();

      becomeVisible();

      expect(FakeSocket.instances).toHaveLength(3);
    });

    it('keeps a resume attempt that is still connecting', () => {
      const { first } = connect();
      first.drop();

      becomeVisible();

      expect(FakeSocket.instances).toHaveLength(2);
      expect(FakeSocket.instances[1].readyState).toBe(0);
    });

    it('does nothing after the socket resumed', () => {
      const { first } = connect();
      first.drop();
      const second = FakeSocket.instances[1];
      second.open();
      second.receive(GREETING);

      becomeVisible();

      expect(FakeSocket.instances).toHaveLength(2);
    });
  });

  it('ignores a resume token that is not a string', () => {
    const socket = new ResumableWebSocket(
      'wss://channel.example.com/v1/ws/abc',
      FakeSocket as unknown as typeof WebSocket
    );
    const closed = jest.fn();
    socket.addEventListener('close', closed);
    const first = FakeSocket.instances[0];
    first.open();
    first.receive(JSON.stringify({ channelid: 'abc', resume: 42 }));

    first.drop();

    expect(closed).toHaveBeenCalledTimes(1);
    expect(FakeSocket.instances).toHaveLength(1);
  });

  it('closes, and stops retrying, when closed between resume attempts', () => {
    const { socket, first, closed } = connect();
    first.drop();
    FakeSocket.instances[1].drop();

    socket.close();
    jest.advanceTimersByTime(RESUME_RETRY_MS);

    expect(closed).toHaveBeenCalledTimes(1);
    expect(socket.readyState).toBe(3);
    expect(FakeSocket.instances).toHaveLength(2);
  });
});

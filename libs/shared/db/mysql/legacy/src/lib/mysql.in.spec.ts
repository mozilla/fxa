import { StatsD } from 'hot-shots';
import { Connection } from 'mysql';
import { IMysqlStoreSharedEvents, MysqlStoreShared } from './mysql';
import { defaultOpts, testDatabaseSetup } from './testing/helpers';

const dbOpts = Object.assign({}, defaultOpts.testDbConfig, {
  connectionLimit: 20,
  idleLimitMs: 1000,
});

type TestStats = {
  pool: {
    connection: number;
    release: number;
    aquire: number;
    enqueue: number;
    threadIds: Record<string, number>;
  };
  connection: {
    connection: number;
    initialize: number;
    initializeError: number;
  };
};

const statsdStub = { increment: jest.fn() };

class MysqlStoreTestEvents implements IMysqlStoreSharedEvents {
  /**
   * Collect some basic counts for events that are occurring.
   */
  public stats: TestStats = {
    pool: {
      connection: 0,
      release: 0,
      aquire: 0,
      enqueue: 0,
      threadIds: {},
    },
    connection: {
      connection: 0,
      initialize: 0,
      initializeError: 0,
    },
  };

  public ErrorOnInit = false;

  onPoolConnection(connection: any): void {
    this.stats.pool.connection++;
    this.stats.pool.threadIds[connection.threadId] =
      (this.stats.pool.threadIds[connection.threadId] || 0) + 1;
  }
  onPoolAquired(connection: any): void {
    this.stats.pool.aquire++;
  }
  onPoolRelease(connection: any): void {
    this.stats.pool.release++;
  }
  onPoolEnqueue(): void {
    this.stats.pool.enqueue++;
  }
  onConnection(connection: any, err: any) {
    this.stats.connection.connection++;
  }
  onInitialize(connected: any) {
    this.stats.connection.initialize++;
    if (this.ErrorOnInit) {
      throw new Error('Testing init error');
    }
  }
  onInitializeError(err: any) {
    this.stats.connection.initializeError++;
  }
}

/**
 * Test class that keeps tabs on connection pool and other events
 * for tracking creation management of connections.
 */
class MySqlStoreTest extends MysqlStoreShared {
  constructor(
    options = dbOpts,
    events: IMysqlStoreSharedEvents = new MysqlStoreTestEvents(),
    log = undefined,
    metrics = statsdStub
  ) {
    super(options, events, undefined, metrics as unknown as StatsD);
  }

  getConnection() {
    return super._getConnection();
  }

  query(sql: any, params: any) {
    return this._query(sql, params);
  }
}

jest.setTimeout(60000);

describe('mysql', () => {
  let events: MysqlStoreTestEvents;
  let mysql: MySqlStoreTest;
  let mysql2: MySqlStoreTest;

  beforeAll(async () => {
    const knex = await testDatabaseSetup(defaultOpts);
    await knex.destroy();
    events = new MysqlStoreTestEvents();
    mysql = new MySqlStoreTest(dbOpts, events);
    mysql2 = new MySqlStoreTest(dbOpts, events);
  });

  afterAll(async () => {
    await mysql.close();
    await mysql2.close();
  });

  beforeEach(() => {
    statsdStub.increment.mockReset();
  });

  it('releases connections ', async () => {
    const promises = [];
    for (let i = 0; i < 2000; i++) {
      promises.push(mysql.query('show tables;', {}));
    }
    await Promise.all(promises);
    expect(events.stats.pool.aquire).toBe(events.stats.pool.release);
    expect(events.stats.pool.connection).toBe(dbOpts.connectionLimit);
  });

  it('detects closes connection on error ', async () => {
    for (let i = 0; i < 1000; i++) {
      try {
        await mysql.query('show foo;', {});
      } catch (_err) {}
    }
    expect(events.stats.pool.aquire).toBe(events.stats.pool.release);
    expect(events.stats.pool.aquire).toBe(events.stats.pool.release);
    expect(events.stats.pool.connection).toBe(dbOpts.connectionLimit);
  });

  it('shares pools accross instances', async () => {
    const promises = [];
    for (let i = 0; i < 1000; i++) {
      promises.push(mysql.query('show tables;', {}));
      promises.push(mysql2.query('show tables;', {}));
    }
    await Promise.all(promises);

    expect(events.stats.pool.aquire).toBe(events.stats.pool.release);
    expect(events.stats.pool.connection).toBe(dbOpts.connectionLimit * 2);
    expect(Object.keys(events.stats.pool.threadIds).length).toBe(
      dbOpts.connectionLimit * 2
    );
  });

  it('closes connections after idling', async () => {
    // pass a lower idle limit config value
    mysql = new MySqlStoreTest({ ...dbOpts, idleLimitMs: 10 });
    const conn1 = await mysql.getConnection();
    const conn2 = await mysql.getConnection();
    expect((conn1 as Connection).state).not.toBe('disconnected');
    expect((conn2 as Connection).state).not.toBe('disconnected');

    await new Promise((resolve) => {
      setTimeout(resolve, 50);
    });
    const closeConnCount = statsdStub.increment.mock.calls.filter(
      (x) => x[0] === 'mysql.close_idle_connection'
    ).length;
    expect(closeConnCount).toBe(2);
    expect((conn1 as Connection).state).toBe('disconnected');
    expect((conn2 as Connection).state).toBe('disconnected');
  });
});

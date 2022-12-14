import { assert } from 'chai';
import { StatsD } from 'hot-shots';
import { Connection } from 'mysql';
import sinon from 'sinon';
import { IMysqlStoreSharedEvents, MysqlStoreShared } from '../../db/mysql';
import { defaultOpts, testDatabaseSetup } from './helpers';

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

const sandbox = sinon.createSandbox();
const statsdStub = { increment: sandbox.stub() };

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

describe('mysql', function () {
  this.timeout(-1);
  let events: MysqlStoreTestEvents;
  let mysql: MySqlStoreTest;
  let mysql2: MySqlStoreTest;

  before(async () => {
    const knex = await testDatabaseSetup(defaultOpts);
    await knex.destroy();
    events = new MysqlStoreTestEvents();
    mysql = new MySqlStoreTest(dbOpts, events);
    mysql2 = new MySqlStoreTest(dbOpts, events);
  });

  after(async () => {
    await mysql.close();
    await mysql2.close();
  });

  beforeEach(() => {
    sandbox.reset();
  });

  it('releases connections ', async () => {
    const promises = [];
    for (let i = 0; i < 2000; i++) {
      promises.push(mysql.query('show tables;', {}));
    }
    await Promise.all(promises);
    assert.equal(events.stats.pool.aquire, events.stats.pool.release);
    assert.equal(events.stats.pool.connection, dbOpts.connectionLimit);
  });

  it('detects closes connection on error ', async () => {
    for (let i = 0; i < 1000; i++) {
      try {
        await mysql.query('show foo;', {});
      } catch (_err) {}
    }
    assert.equal(events.stats.pool.aquire, events.stats.pool.release);
    assert.equal(events.stats.pool.aquire, events.stats.pool.release);
    assert.equal(events.stats.pool.connection, dbOpts.connectionLimit);
  });

  it('shares pools accross instances', async () => {
    const promises = [];
    for (let i = 0; i < 1000; i++) {
      promises.push(mysql.query('show tables;', {}));
      promises.push(mysql2.query('show tables;', {}));
    }
    await Promise.all(promises);

    assert.equal(events.stats.pool.aquire, events.stats.pool.release);
    assert.equal(events.stats.pool.connection, dbOpts.connectionLimit * 2);
    assert.equal(
      Object.keys(events.stats.pool.threadIds).length,
      dbOpts.connectionLimit * 2
    );
  });

  it('closes connections after idling', async () => {
    // pass a lower idle limit config value
    mysql = new MySqlStoreTest({ ...dbOpts, idleLimitMs: 10 });
    const conn1 = await mysql.getConnection();
    const conn2 = await mysql.getConnection();
    assert.notEqual((conn1 as Connection).state, 'disconnected');
    assert.notEqual((conn2 as Connection).state, 'disconnected');

    await new Promise((resolve) => {
      setTimeout(resolve, 50);
    });
    const closeConnCount = statsdStub.increment.args.filter(
      (x) => x[0] === 'mysql.close_idle_connection'
    ).length;
    assert.equal(closeConnCount, 2);
    assert.equal((conn1 as Connection).state, 'disconnected');
    assert.equal((conn2 as Connection).state, 'disconnected');
  });
});

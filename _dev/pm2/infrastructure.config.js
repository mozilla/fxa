module.exports = {
  apps: [
    {
      name: 'mysql',
      script: '_scripts/mysql.sh',
      max_restarts: '1',
      min_uptime: '2m',
      kill_timeout: 20000,
    },
    {
      name: 'redis',
      script: '_scripts/redis.sh',
      env: {
        PORT: '6379',
      },
      max_restarts: '1',
      min_uptime: '2m',
      kill_timeout: 20000,
    },
    {
      name: 'memcache',
      script: '_scripts/memcached.sh',
      max_restarts: '1',
      min_uptime: '2m',
      kill_timeout: 20000,
    },
    {
      name: 'sns',
      script: '_scripts/goaws.sh',
      max_restarts: '1',
      min_uptime: '2m',
      autorestart: false,
      kill_timeout: 20000,
    },
    {
      name: 'firestore',
      script: '_scripts/firestore.sh',
      max_restarts: '1',
      min_uptime: '2m',
      kill_timeout: 20000,
    },
    {
      name: 'sync',
      script: '_scripts/syncserver.sh',
      max_restarts: '1',
      min_uptime: '2m',
      autorestart: false,
      kill_timeout: 20000,
    },

    {
      name: 'jaeger',
      script: '_scripts/jaeger.sh',
      autorestart: false,
      kill_timeout: 20000,
    },

    {
      name: 'otel-collector',
      script: '_scripts/otel-collector.sh',
      autorestart: false,
      kill_timeout: 20000,
    },

    // TODO FIXME?? this has been broken for-ev-er, do we even want it?
    // {
    //   name: 'pushbox',
    //   script: '_scripts/pushbox.sh',
    //   max_restarts: '1',
    //   min_uptime: '2m',
    //   args: '3306 root@mydb:3306',
    //   kill_timeout: 20000,
    // },
  ],
};

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
    {
      name: 'cloud-tasks-emulator',
      script: '_scripts/cloud-tasks-emulator.sh',
      autorestart: false,
      kill_timeout: 20000,
    },
    {
      name: 'cirrus',
      script: '_scripts/cirrus.sh',
      autorestart: false,
      kill_timeout: 20000,
    },
  ],
};

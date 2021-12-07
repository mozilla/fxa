module.exports = {
  scripts: {
    default: 'nps help',
    start: {
      default: `_dev/pm2/start.sh && _scripts/pm2-all.sh start && pm2 restart sync && echo "Use 'yarn stop' to stop all the servers"`,
      infrastructure: `_dev/pm2/start.sh`,
      services: `_scripts/pm2-all.sh start`,
      firefox: './packages/fxa-dev-launcher/bin/fxa-dev-launcher.mjs &',
    },
    stop: {
      default: 'pm2 kill',
      infrastructure: `pm2 stop _dev/pm2/infrastructure.config.js`,
      services: `_scripts/pm2-all.sh stop`,
    },
    restart: {
      default: 'pm2 restart all',
      infrastructure: `pm2 restart _dev/pm2/infrastructure.config.js`,
      services: `_scripts/pm2-all.sh restart`,
    },
    delete: {
      default: 'pm2 kill',
      services: '_scripts/pm2-all.sh delete',
    },
  },
};

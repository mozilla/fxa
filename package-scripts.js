module.exports = {
  scripts: {
    default: "nps help",
    start: {
      default: `pm2 start _dev/pm2/infrastructure.config.js && _scripts/pm2-all.sh start && echo "Use 'npm stop' to stop all the servers"`,
      infrastructure: `pm2 start _dev/pm2/infrastructure.config.js`,
      services: `_scripts/pm2-all.sh start`,
      firefox: "./packages/fxa-dev-launcher/bin/fxa-dev-launcher &"
    },
    stop: {
      default: "pm2 kill",
      infrastructure: `pm2 stop _dev/pm2/infrastructure.config.js`,
      services: `_scripts/pm2-all.sh stop`
    },
    restart: {
      default: "pm2 restart all",
      infrastructure: `pm2 restart _dev/pm2/infrastructure.config.js`,
      services: `_scripts/pm2-all.sh restart`
    }
  }
};

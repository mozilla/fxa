module.exports = {
  scripts: {
    default: "nps help",
    start: {
      default:
        "pm2 start _dev/pm2/infrastructure.json _dev/pm2/services.json && echo \"Use 'npm stop' to stop all the servers\"",
      infrastructure: "pm2 start _dev/pm2/infrastructure.json",
      services: "pm2 start _dev/pm2/services.json",
      firefox: "./packages/fxa-dev-launcher/bin/fxa-dev-launcher &"
    },
    stop: {
      default: "pm2 kill",
      services: "pm2 stop _dev/pm2/services.json"
    },
    restart: {
      default: "pm2 restart all",
      services: "pm2 restart _dev/pm2/services.json"
    }
  }
};

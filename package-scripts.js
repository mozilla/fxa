/**
 * These are Nx tags used to identify which services to start up
 * when executing the various partial startup scripts.
 */
const mzaProjects = 'tag:type:core,tag:type:demo';
const sp2Projects = 'tag:type:core,tag:type:demo,tag:type:sp2';
const sp3Projects = 'tag:type:core,tag:type:demo,tag:type:sp3';

module.exports = {
  scripts: {
    default: 'nps help',
    start: {
      default: {
        script: `_dev/pm2/start.sh && _scripts/pm2-all.sh start && pm2 restart sync && echo "Use 'yarn stop' to stop all the servers"`,
        description: 'Start the entire stack, i.e. all infrastructure and services.'
      },
      infrastructure: {
        script: `_dev/pm2/start.sh`,
        description: 'Start all infrastructure only.',
      },
      services: {
        script: `_scripts/pm2-all.sh start`,
        description: 'Start all Services only.'
      },
      firefox: './packages/fxa-dev-launcher/bin/fxa-dev-launcher.mjs &',
      mza: {
        script: `_dev/pm2/start.sh && _scripts/pm2-all.sh start ${mzaProjects} && pm2 restart sync && echo "Use 'yarn stop' to stop all the servers"`,
        description: 'Start infrastructure and only required Mozilla Accounts services',
      },
      sp2: {
        script: `_dev/pm2/start.sh && _scripts/pm2-all.sh start ${sp2Projects} && pm2 restart sync && echo "Use 'yarn stop' to stop all the servers"`,
        description: 'Start infrastructure and only required SubPlat 2.0 services.'
      },
      sp3: {
        script: `_dev/pm2/start.sh && _scripts/pm2-all.sh start ${sp3Projects} && pm2 restart sync && echo "Use 'yarn stop' to stop all the servers"`,
        description: 'Start infrastructure and only required SubPlat 3.0 services.'
      },
    },
    stop: {
      default: {
          script: 'pm2 kill',
        description: 'Stop all infrastructure and services.',
      },
      infrastructure: {
        script: `pm2 stop _dev/pm2/infrastructure.config.js`,
        description: 'Stop all infrastructure, only.',
      },
      services: {
        script: `_scripts/pm2-all.sh stop`,
        description: 'Stop all services, only.',
      },
      mza: {
        script: `_scripts/pm2-all.sh stop ${mzaProjects}`,
        description: 'Stop required Mozilla Accounts services.',
      },
      sp2: {
        script: `_scripts/pm2-all.sh stop ${sp2Projects}`,
        description: 'Stop required SubPlat 2.0 services.',
      },
      sp3: {
        script: `_scripts/pm2-all.sh stop ${sp3Projects}`,
        description: 'Stop required SubPlat 3.0 services.',
      },
    },
    restart: {
      default: {
        script: 'pm2 restart all',
        description: 'Restart all infrastructure and services.',
      },
      infrastructure: {
        script: `pm2 restart _dev/pm2/infrastructure.config.js`,
        description: 'Restart all infrastructure, only.',
      },
      services: {
        script: `_scripts/pm2-all.sh restart`,
        description: 'Restart all services, only.',
      },
      mza: {
        script: `_scripts/pm2-all.sh restart ${mzaProjects}`,
        description: 'Restart required Mozilla Accounts services.',
      },
      sp2: {
        script: `_scripts/pm2-all.sh restart ${sp2Projects}`,
        description: 'Restart required SubPlat 2.0 services.',
      },
      sp3: {
        script: `_scripts/pm2-all.sh restart ${sp3Projects}`,
        description: 'Restart required SubPlat 3.0 services.',
      },
    },
    delete: {
      default: {
        script: 'pm2 kill',
        description: 'Delete all infrastructure and services.',
      },
      services: {
        script: '_scripts/pm2-all.sh delete',
        description: 'Delete all services, only.',
      },
      mza: {
        script: `_scripts/pm2-all.sh delete ${mzaProjects}`,
        description: 'Delete required Mozilla Accounts services.',
      },
      sp2: {
        script: `_scripts/pm2-all.sh delete ${sp2Projects}`,
        description: 'Delete required SubPlat 2.0 services.',
      },
      sp3: {
        script: `_scripts/pm2-all.sh delete ${sp3Projects}`,
        description: 'Delete required SubPlat 3.0 services.',
      },
    },
  },
};

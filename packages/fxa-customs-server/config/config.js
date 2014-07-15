/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (fs, path, url, convict) {

  var conf = convict({
    env: {
      doc: 'The current node.js environment',
      default: 'prod',
      format: [ 'dev', 'test', 'stage', 'prod' ],
      env: 'NODE_ENV'
    },
    log: {
      level: {
        default: 'trace',
        env: 'LOG_LEVEL'
      }
    },
    publicUrl: {
      format: 'url',
      // the real url is set by awsbox
      default: 'http://127.0.0.1:7000',
      env: 'PUBLIC_URL'
    },
    listen: {
      host: {
        doc: 'The ip address the server should bind',
        default: '127.0.0.1',
        format: 'ipaddress',
        env: 'IP_ADDRESS'
      },
      port: {
        doc: 'The port the server should bind',
        default: 7000,
        format: 'port',
        env: 'PORT'
      }
    },
    limits: {
      blockIntervalSeconds: {
        doc: 'Duration of a manual ban',
        default: 60 * 60 * 24,
        format: 'nat'
      },
      rateLimitIntervalSeconds: {
        doc: 'Duration of automatic throttling',
        default: 60 * 15,
        format: 'nat'
      },
      maxEmails: {
        doc: 'Number of emails sent within rateLimitIntervalSeconds before throttling',
        default: 3,
        format: 'nat'
      },
      maxBadLogins: {
        doc: 'Number failed login attempts within rateLimitIntervalSeconds before throttling',
        default: 2,
        format: 'nat'
      }
    },
    memcache: {
      host: {
        doc: 'Hostname / IP of the memcache server',
        default: '127.0.0.1',
        env: 'MEMCACHE_HOST'
      },
      port: {
        doc: 'Port of the memcache server',
        default: '11211',
        format: 'port',
        env: 'MEMCACHE_PORT'
      },
      recordLifetimeSeconds: {
        doc: 'Memcache record expiry',
        default: 900,
        format: 'nat'
      }
    },
    bans: {
      region: {
        doc: 'The region where the queues live, most likely the same region we are sending email e.g. us-east-1, us-west-2, ap-southeast-2',
        format: String,
        default: '',
        env: 'BANS_REGION'
      },
      queueUrl: {
        doc: 'The bounce queue URL to use (should include https://sqs.<region>.amazonaws.com/<account-id>/<queue-name>)',
        format: String,
        default: '',
        env: 'BANS_QUEUE_URL'
      }
    }
  })

  // handle configuration files.  you can specify a CSV list of configuration
  // files to process, which will be overlayed in order, in the CONFIG_FILES
  // environment variable. By default, the ./config/<env>.json file is loaded.

  var envConfig = path.join(__dirname, conf.get('env') + '.json')
  var files = (envConfig + ',' + process.env.CONFIG_FILES)
                .split(',').filter(fs.existsSync)
  conf.loadFile(files)
  conf.validate()

  return conf
}

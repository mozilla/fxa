#!/bin/sh
#
# Build a webhead node for picl-idp.
#
# This script builds a custom machine setup for running the picl-idp nodejs
# application.  It's running on top of a stack more familiar to the services
# team than the black-box of the awsbox AMI.

set -e

UDO="sudo -u mozsvc"

YUM="yum --assumeyes --enablerepo=epel"
$YUM install nodejs npm gmp gmp-devel

# Grab and build the latest master of picl-idp.

cd /home/mozsvc
$UDO git clone https://github.com/mozilla/picl-idp
cd picl-idp
git checkout {"Ref": "AWSBoxenCommit"}
$UDO npm install

cat >> config/awsboxen.json << EOF
{
  "kvstore": {
    "cache": "memcached",
    "backend": "cassandra"
  },
  "smtp": {
    "host": "localhost",
    "port": 25,
    "secure": false
  },
  "secretKeyFile": "/home/mozsvc/picl-idp/config/secret-key.json",
  "publicKeyFile": "/home/mozsvc/picl-idp/config/public-key.json",
  "bridge": {
    "url": "http://accounts.{"Ref":"DNSPrefix"}.lcip.org"
  },
  "dev": {
    "verified": true
  }
}
EOF

# Generate signing keys.
# These need to be shared by all webheads, so we bake them into the AMI.
# XXX TODO: they'll need to be much better managed than this in production!
$UDO node ./scripts/gen_keys.js

# Write a circus config file to run the app with nodejs.

cd ../
cat >> circus.ini << EOF
[watcher:keyserver]
working_dir=/home/mozsvc/picl-idp
cmd=node bin/key_server.js
numprocesses = 1
stdout_stream.class = FileStream
stdout_stream.filename = /home/mozsvc/picl-idp/circus.log
stdout_stream.refresh_time = 0.5
stdout_stream.max_bytes = 1073741824
stdout_stream.backup_count = 3
stderr_stream.class = StdoutStream

[env:keyserver]
PORT=8000
CONFIG_FILES=/home/mozsvc/picl-idp/config/awsboxen.json,/home/mozsvc/picl-idp/config/cloud_formation.json
EOF


# Setup nginx as proxy for local webserver process.

set -e

YUM="yum --assumeyes --enablerepo=epel"

$YUM install nginx

cat << EOF > /etc/nginx/nginx.conf
user  nginx;
worker_processes  1;
events {
    worker_connections  20480;
}
http {
    include       mime.types;
    default_type  application/octet-stream;
    log_format xff '\$remote_addr - \$remote_user [\$time_local] "\$request" '
                   '\$status \$body_bytes_sent "\$http_referer" '
                   '"\$http_user_agent" XFF="\$http_x_forwarded_for" '
                   'TIME=\$request_time ';
    access_log /var/log/nginx/access.log xff;
    server {
        listen       80 default;
        location / {
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header Host \$http_host;
            proxy_redirect off;
            proxy_pass http://localhost:8000;
        }
    }
}
EOF

/sbin/chkconfig nginx on
/sbin/service nginx start


# Slurp the nginx access log into heka.
# For now this gets run as the mozsvc user.
# That's not awesome.  Do something smarter longer term.

chmod +r /var/log/nginx
chmod +x /var/log/nginx
chmod +r /var/log/nginx/access.log

cat >> /home/mozsvc/hekad/hekad.toml << EOF
[nginx-access-log]
type = "LogfileInput"
logfile = "/var/log/nginx/access.log"
decoders = ["nginx-log-decoder"]

[nginx-log-decoder]
type = "PayloadRegexDecoder"
timestamp_layout = "02/Jan/2006:15:04:05 -0700"
match_regex = '^(?P<RemoteIP>\S+) \S+ \S+ \[(?P<Timestamp>[^\]]+)\] "((?P<Method>[A-Z\-]+) )?(?P<Url>[^\s]+)[^"]*" (?P<StatusCode>\d+) (?P<RequestSize>\d+) "(?P<Referer>[^"]*)" "(?P<Browser>[^"]*)" XFF="(?P<XFF>[^"]+)" TIME=(?P<Time>\S+)'

[nginx-log-decoder.message_fields]
Type = "logfile"
Logger = "nginx"
Url|uri = "%Url%"
Method = "%Method%"
Status = "%StatusCode%"
RequestSize|B = "%RequestSize%"
Referer = "%Referer%"
Browser = "%Browser%"
RequestTime = "%Time%"
XForwardedFor = "%XFF%"

EOF


# Slurp the picl-idp server log into heka.

cat >> /home/mozsvc/hekad/hekad.toml << EOF
[picl-idp-log]
type = "LogfileInput"
logfile = "/home/mozsvc/picl-idp/server.log"
logger = "picl-idp"

EOF

# Configure heka to forward logs to the logbox
# XXX TODO: set logging URL at deploy time, rather than baking into AMI.

cat >> /home/mozsvc/hekad/hekad.toml << EOF

[aggregator-output]
type = "AMQPOutput"
message_matcher = "Logger == 'nginx' || Logger == 'picl-idp'"
url = "amqp://guest:guest@logs.{"Ref":"DNSPrefix"}.lcip.org:5672/"
exchange = "heka"
exchangeType = "fanout"

EOF

# Configure postfix to send emails via parametereized SMTP relay.
# The default SMTPRelay is blank, meaning it sends email direct from the box.
# But you can use CloudFormation parameters to point it at e.g. Amazon SES.

$YUM install postfix
alternatives --set mta /usr/sbin/sendmail.postfix

cat >> /etc/postfix/main.cf << EOF
relayhost = {"Ref":"SMTPRelay"}
smtp_sasl_auth_enable = yes
smtp_sasl_security_options = noanonymous
smtp_sasl_password_maps = hash:/etc/postfix/sasl_passwd
smtp_use_tls = yes
smtp_tls_security_level = encrypt
smtp_tls_note_starttls_offer = yes
EOF

# Create placeholder for the SES relay credentials.
cat >> /etc/postfix/sasl_passwd << EOF
email-smtp.us-east-1.amazonaws.com:25 {"Ref":"SMTPUsername"}:{"Ref":"SMTPPassword"}
EOF
/usr/sbin/postmap /etc/postfix/sasl_passwd

service sendmail stop
chkconfig sendmail off

service postfix start
chkconfig postfix on

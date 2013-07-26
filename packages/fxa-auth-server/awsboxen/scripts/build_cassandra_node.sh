#!/bin/sh
#
# Build a cassandra-based storage node for picl-idp.
#
# This script builds a custom machine setup that will act as part of
# a cassandra cluster.
#
# XXX TODO:  erm, security anyone??
# We can do it at the network level, but sheesh...

set -e

YUM="yum --assumeyes --enablerepo=epel"

$YUM update
$YUM install java-1.7.0-openjdk-devel

useradd cassandra
USERDO="sudo -u cassandra"

# Grab cassandra beta release.
# For now we just unpack the binary tarball.
# Obviously we will need an RPM for production deployment.

mkdir -p /opt
cd /opt
wget http://www.us.apache.org/dist/cassandra/2.0.0/apache-cassandra-2.0.0-beta2-bin.tar.gz
DIGEST=`sha1sum apache-cassandra-2.0.0-beta2-bin | cut -d ' ' -f 1`
if [ $DIGEST != "bf54f4fe34d49c7d212227d44c245868" ]; then
  echo "BAD DIGEST; ABORTING!"
  exit 1
fi
tar -xzvf apache-cassandra-2.0.0-beta2-bin.tar.gz
rm -f apache-cassandra-2.0.0-beta2-bin.tar.gz
mv apache-cassandra-2.0.0-beta2 cassandra

mkdir -p /var/log/cassandra
chown -R cassandra /var/log/cassandra
mkdir -p /var/lib/cassandra
chown -R cassandra /var/lib/cassandra


# Hack default config to work with OpenJDK.
# It needs a bigger stack size, or it segfaults.
#
#   https://issues.apache.org/jira/browse/CASSANDRA-2441
perl -pi -e 's/Xss180k/Xss280k/g' /opt/cassandra/conf/cassandra-env.sh

# Configure cassandra to listen on the machine's external address.
perl -pi -e 's/listen_address: localhost/listen_address: /g' /opt/cassandra/conf/cassandra.yaml
perl -pi -e 's/rpc_address: localhost/rpc_address: 0.0.0.0/g' /opt/cassandra/conf/cassandra.yaml

# Use vnodes for auto-bootstrapping.
perl -pi -e 's/# num_tokens: 256/num_tokens: 256/g' /opt/cassandra/conf/cassandra.yaml


# Set up cassandra to start on boot, under control of circus.

$YUM install openssl-devel python-devel gcc
$YUM install czmq-devel zeromq
$YUM install python-pip

python-pip install circus

cat > /opt/cassandra/cassandra.circus.ini << EOF
[watcher:cassandra]
working_dir=/opt/cassandra/
cmd=bin/cassandra -f
numprocesses=1 

[env]
JAVA_HOME=/usr/lib/jvm/java-1.7.0
EOF

chown cassandra:cassandra /opt/cassandra/cassandra.circus.ini

cat > /etc/rc.local << EOF
# Sleep briefly, so cloud-init can re-write config files before cassandra starts
sleep 1m && su -l cassandra -c '/usr/bin/circusd --daemon /opt/cassandra/cassandra.circus.ini'
exit 0
EOF

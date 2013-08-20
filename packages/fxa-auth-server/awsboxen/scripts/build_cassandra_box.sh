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

$YUM install java-1.7.0-openjdk-devel

# Grab cassandra beta release.
# For now we just unpack the binary tarball.
# Obviously we will need an RPM for production deployment.

mkdir -p /opt
cd /opt
wget http://www.us.apache.org/dist/cassandra/2.0.0/apache-cassandra-2.0.0-rc2-bin.tar.gz
DIGEST=`md5sum apache-cassandra-2.0.0-rc2-bin.tar.gz | cut -d ' ' -f 1`
if [ $DIGEST != "f0ca595eb0811067515930c08aa77463" ]; then
  echo "BAD DIGEST; ABORTING!"
  exit 1
fi
tar -xzvf apache-cassandra-2.0.0-rc2-bin.tar.gz
rm -f apache-cassandra-2.0.0-rc2-bin.tar.gz
mv apache-cassandra-2.0.0-rc2 cassandra

mkdir -p /var/log/cassandra
chown -R mozsvc /var/log/cassandra
mkdir -p /var/lib/cassandra
chown -R mozsvc /var/lib/cassandra

# Hack default config to work with OpenJDK.
# It needs a bigger stack size, or it segfaults.
#
#   https://issues.apache.org/jira/browse/CASSANDRA-2441
#
perl -pi -e 's/Xss180k/Xss280k/g' /opt/cassandra/conf/cassandra-env.sh

# Configure cassandra to listen on the machine's external address.
perl -pi -e 's/listen_address: localhost/listen_address: /g' /opt/cassandra/conf/cassandra.yaml
perl -pi -e 's/rpc_address: localhost/rpc_address: 0.0.0.0/g' /opt/cassandra/conf/cassandra.yaml

# Uncomment the setting that uses vnodes for auto-bootstrapping.
perl -pi -e 's/# num_tokens: 256/num_tokens: 256/g' /opt/cassandra/conf/cassandra.yaml

# Set up cassandra to start on boot, under control of circus.

cat >> /home/mozsvc/circus.ini << EOF
[watcher:cassandra]
working_dir=/opt/cassandra/
cmd=bin/cassandra -f
numprocesses=1 
stdout_stream.class = FileStream
stdout_stream.filename = /home/mozsvc/cassandra.log
stdout_stream.refresh_time = 0.5
stdout_stream.max_bytes = 1073741824
stdout_stream.backup_count = 3
stderr_stream.class = StdoutStream

[env:cassandra]
JAVA_HOME=/usr/lib/jvm/java-1.7.0
EOF

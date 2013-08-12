#!/usr/bin/env bash
echo "Setting up mysql"

sudo /sbin/chkconfig mysqld on
sudo /sbin/service mysqld start
echo "CREATE USER 'picl'@'localhost';" | mysql -u root
echo "CREATE DATABASE picl;" | mysql -u root
echo "GRANT ALL ON picl.* TO 'picl'@'localhost';" | mysql -u root

echo "Setting up memcached"

sudo /sbin/chkconfig memcached on
sudo /sbin/service memcached start

echo "Setting up logstash"

wget https://logstash.objects.dreamhost.com/release/logstash-1.1.13-flatjar.jar

echo "Installing identity team public keys"

git clone https://github.com/mozilla/identity-pubkeys
cd identity-pubkeys
git checkout b63a19a153f631c949e7f6506ad4bf1f258dda69
cat *.pub >> /home/ec2-user/.ssh/authorized_keys
cd ..
rm -rf identity-pubkeys

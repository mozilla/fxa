#!/usr/bin/env bash
echo "Setting up mysql"

sudo /sbin/chkconfig mysqld on
sudo /sbin/service mysqld start
echo "CREATE USER 'picl'@'localhost';" | mysql -u root
echo "CREATE DATABASE picl;" | mysql -u root
echo "GRANT ALL ON picl.* TO 'picl'@'localhost';" | mysql -u root

echo "Setting up memcached"

yum --assumeyes install memcached

/sbin/chkconfig memcached on
/sbin/service memcached start

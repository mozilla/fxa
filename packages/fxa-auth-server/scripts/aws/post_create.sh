#!/usr/bin/env bash
echo "Setting up mysql"

sudo /sbin/chkconfig mysqld on
sudo /sbin/service mysqld start
echo "CREATE USER 'picl'@'localhost';" | mysql -u root
echo "CREATE DATABASE picl;" | mysql -u root
echo "GRANT ALL ON picl.* TO 'picl'@'localhost';" | mysql -u root

echo "hacking iptables"
# this is a workaround until someone figures
# out why the iptables on this image don't stick
sudo /home/app/scripts/setup_routes.sh

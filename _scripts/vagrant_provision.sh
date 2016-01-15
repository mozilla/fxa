#!/bin/bash -e

echo "### Adding Java and Node.js repositories ###"
sudo add-apt-repository -y ppa:webupd8team/java
curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -

echo "### Installing dependencies ###"
sudo apt-get install -y build-essential git-core libgmp3-dev graphicsmagick redis-server python-virtualenv python-dev

echo "### Installing Node.js ###"
sudo apt-get install -y nodejs

echo "### Checking if npm is older than 2.4 ###"
if [[ $(npm -v | awk '{print $1}') < 2.4 ]]; then
  echo "Updating npm to 2.4"
  sudo npm install -g npm@2.4
fi

echo "### Accepting Oracle licence and installing Java ###"
echo debconf shared/accepted-oracle-license-v1-1 select true | sudo debconf-set-selections
echo debconf shared/accepted-oracle-license-v1-1 seen true | sudo debconf-set-selections
sudo apt-get install -y oracle-java7-installer

if [ "$1" != "TRUE" ]; then
  echo "### Installing development environment ###"
  cd /vagrant; npm install
else
  echo "### You need to manually install development environment ###"
fi

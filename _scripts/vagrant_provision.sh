#!/bin/bash -e

echo "Adding Java and Node.js repositories"
sudo add-apt-repository -y ppa:webupd8team/java &>> ~/provision.log
curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash - &>> \
    ~/provision.log

echo "Installing dependencies"
sudo apt-get install -y build-essential git-core libgmp3-dev graphicsmagick \
    redis-server python-virtualenv python-dev &>> ~/provision.log

echo "Installing Node.js"
sudo apt-get install -y nodejs &>> ~/provision.log

echo "Checking npm version"
CURRENT_VERSION=$(npm -v | awk '{print $1}')
INSTALL_VERSION=$(npm view npm@2 version | tail -1 | cut -d "'" -f2 |
    awk '{print $1}')
if [[ $CURRENT_VERSION < $INSTALL_VERSION ]]; then
  echo "Updating npm from $CURRENT_VERSION to $INSTALL_VERSION"
  sudo npm install npm@$INSTALL_VERSION -g &>> ~/provision.log
else
  echo "Npm is already at the desired version ($INSTALL_VERSION)"
fi

echo "Accepting Oracle licence and installing Java 8"
echo debconf shared/accepted-oracle-license-v1-1 select true |
    sudo debconf-set-selections &>> ~/provision.log
echo debconf shared/accepted-oracle-license-v1-1 seen true |
    sudo debconf-set-selections &>> ~/provision.log
sudo apt-get install -y oracle-java8-installer &>> ~/provision.log

if [ "$1" != "TRUE" ]; then
  echo "Installing development environment"
  cd /vagrant; npm install
else
  echo "You need to manually install development environment"
fi

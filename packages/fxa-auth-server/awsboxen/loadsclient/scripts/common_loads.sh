#!/bin/sh

set -e

YUM="yum --assumeyes --enablerepo=epel"
UDO="sudo -u mozsvc"

$YUM install nodejs npm gmp gmp-devel libevent-devel
sudo python-pip install virtualenv

# Install loads and loads.js and github master.

cd /home/mozsvc
$UDO git clone https://github.com/mozilla-services/loads/
cd ./loads
$UDO make build || true
$UDO ./bin/pip install "psutil<1.1"
$UDO make build
cd ../

$UDO git clone https://github.com/mozilla-services/loads.js
cd ./loads.js/loads.js
$UDO npm install
cd ../../


# Grab and build the current picl-idp checkout, for access to loadtest script.

$UDO git clone https://github.com/mozilla/picl-idp
cd /picl-idp
$UDO git checkout {"Ref": "AWSBoxenCommit"}
$UDO npm install
cd ./loadtest/
make build

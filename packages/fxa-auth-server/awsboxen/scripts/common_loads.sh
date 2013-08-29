#!/bin/sh

set -e

YUM="yum --assumeyes --enablerepo=epel"
UDO="sudo -u mozsvc"

$YUM install nodejs npm gmp gmp-devel
sudo python-pip install virtualenv

# Install loads and loads.js and github master.

cd /home/mozsvc
$UDO git clone https://github.com/mozilla-services/loads/
cd ./loads
$UDO git checkout -t origin/fix-external-runner-respawning
$UDO make build || true
$UDO ./bin/pip install "psutil<1.1"
$UDO make build
cd ../

$UDO git clone https://github.com/mozilla-services/loads.js
cd ./loads.js/loads.js
$UDO npm install
cd ../../

perl -pi -e "s/process_timeout', 2/process_timeout', 60/g" ./loads/loads/runners/external.py


# Grab and build the current picl-idp checkout, for access to loadtest script.

$UDO git clone https://github.com/mozilla/picl-idp
cd picl-idp
$UDO git checkout {"Ref": "AWSBoxenCommit"}
$UDO npm install

cat > ./loadtest/run.sh << EOF
#!/bin/sh
/home/mozsvc/loads/bin/loads-runner --test-dir="/home/mozsvc/picl-idp" --test-runner="/home/mozsvc/loads.js/loads.js/runner.js {test}" "/home/mozsvc/picl-idp/loadtest/loadtests.js" --users=3 --duration=60
EOF

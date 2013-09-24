#!/usr/bin/env bash

MYPWD=`pwd`

echo "Setting up heka"

HEKAFILE=heka-0_4_0-picl-idp-amd64.tar.gz
wget https://people.mozilla.com/~rmiller/heka/$HEKAFILE
pushd /home/app
sudo tar zxvf $MYPWD/$HEKAFILE
sudo chown -R app:app heka-0_4_0-linux-amd64
popd

echo "Installing identity team public keys"

git clone https://github.com/mozilla/identity-pubkeys
cd identity-pubkeys
git checkout b63a19a153f631c949e7f6506ad4bf1f258dda69
cat *.pub >> /home/ec2-user/.ssh/authorized_keys
cd ..
rm -rf identity-pubkeys

echo "Cleaning up old logfiles"

sudo rm -rf /var/log/nginx/access.log-*
sudo rm -rf /var/log/nginx/error.log-*

echo "post-create complete!"

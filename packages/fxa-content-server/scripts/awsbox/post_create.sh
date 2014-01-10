#!/usr/bin/env bash

MYPWD=`pwd`


echo "Setting up heka"

HEKAURL=https://github.com/mozilla-services/heka/releases/download/v0.4.1/heka-0_4_1-linux-amd64.tar.gz
HEKAFILE=`basename $HEKAURL`
wget $HEKAURL
pushd /home/app
sudo tar zxvf $MYPWD/$HEKAFILE
sudo chown -R app:app heka-0_4_1-linux-amd64
popd


echo "Setting up circus"

sudo yum install --assumeyes python-devel python-pip
sudo pip install circus
sudo tee --append /home/app/circus.ini << EOF
[watcher:hekad]
working_dir=/home/app/hekad
cmd=/home/app/heka-0_4_1-linux-amd64/bin/hekad -config=/home/app/code/scripts/awsbox/hekad.toml
numprocesses = 1
stdout_stream.class = FileStream
stdout_stream.filename = /home/app/hekad/circus.stdout.log
stdout_stream.refresh_time = 0.5
stdout_stream.max_bytes = 1073741824
stdout_stream.backup_count = 3
stderr_stream.class = FileStream
stderr_stream.filename = /home/app/hekad/circus.stderr.log
stderr_stream.refresh_time = 0.5
stderr_stream.max_bytes = 1073741824
stderr_stream.backup_count = 3
EOF


echo "Installing identity team public keys"

git clone https://github.com/mozilla/identity-pubkeys
cd identity-pubkeys
git checkout 9e009e6f15f28debfb59d3d7787dfc20c50e230f
cat *.pub >> /home/ec2-user/.ssh/authorized_keys
cd ..
rm -rf identity-pubkeys
cat >> /home/ec2-user/.ssh/authorized_keys << EOF
ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEAvyIb/9pablSz0Bf46dpKfWfxyL1Ui5Ypo1LOdmesUYxW4kUE3eQpc7bAPP8wVEFUixQR908p94M1FORICzc8mrOG/0l8Vu+B86kYML+Z0Rjtjn+NDXyY8BUKhGapTLnyZh7BiV5RlUN/JBUYtIYzj1Y5yS58LdbFdhzt7MQmcBklfwkN7fzbpf/E1Fv5CcWnr0TvFsz8wSueoh0vepiHKVYgym3HnUTqnF8opUL3i4mrKftZi0PPg4t6YxIgu8ZKj8yGin0eNtwJhjE3dO9WBXGDYcLv8Ps7Ny9chymeJljRJ/QNtJXt6XxLGZdagehTjj3/uz14WEGr7i5bZJRjjw== trink@mozilla.com
EOF


echo "Cleaning up old logfiles"

sudo rm -rf /var/log/nginx/access.log-*
sudo rm -rf /var/log/nginx/error.log-*

echo "post-create complete!"

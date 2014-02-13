#!/usr/bin/env bash

echo "Setting up mysql"

sudo /sbin/chkconfig mysqld on
sudo /sbin/service mysqld start
echo "CREATE USER 'fxa'@'localhost';" | mysql -u root
echo "CREATE DATABASE fxa;" | mysql -u root
echo "GRANT ALL ON fxa.* to 'fxa'@'localhost';" | mysql -u root

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

mkdir -p /home/app/var/uploads

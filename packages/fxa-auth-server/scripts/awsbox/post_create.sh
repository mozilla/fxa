#!/usr/bin/env bash
MYPWD=`pwd`


echo "Setting up mysql"

sudo /sbin/chkconfig mysqld on
sudo /sbin/service mysqld start
echo "CREATE USER 'fxa'@'localhost';" | mysql -u root
echo "CREATE DATABASE fxa;" | mysql -u root
echo "GRANT ALL ON fxa.* TO 'fxa'@'localhost';" | mysql -u root


echo "Setting up memcached"

sudo /sbin/chkconfig memcached on
sudo /sbin/service memcached start


echo "Setting up nginx"

sudo /sbin/chkconfig nginx on
sudo /sbin/service nginx start


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


echo "Setting up postfix as the mailserver"

sudo alternatives --set mta /usr/sbin/sendmail.postfix

sudo service sendmail stop
sudo chkconfig sendmail off

sudo tee --append /etc/postfix/main.cf << EOF
# This basic configuration sends mail directly.
# It's unlikely to work very well from within EC2.
# You should get some SES credentials and use it as relay host:
#
#    https://gist.github.com/gene1wood/6323301
#
relayhost = 
smtp_sasl_auth_enable = yes
smtp_sasl_security_options = noanonymous
smtp_sasl_password_maps = hash:/etc/postfix/sasl_passwd
smtp_use_tls = yes
smtp_tls_security_level = encrypt
smtp_tls_note_starttls_offer = yes
EOF

# Create placeholder for the SES relay credentials.
sudo tee --append /etc/postfix/sasl_passwd << EOF
email-smtp.us-east-1.amazonaws.com:25 INSERTUSERNAME:INSERTPASSWORD
EOF
sudo /usr/sbin/postmap /etc/postfix/sasl_passwd
 
sudo service postfix start
sudo chkconfig postfix on


echo "Cleaning up old logfiles"

sudo rm -rf /var/log/nginx/access.log-*
sudo rm -rf /var/log/nginx/error.log-*


echo "post-create complete!"

#!/bin/sh

# This script sets up a default password for VNC
# If you do not run this then the first time VNC
# starts it will ask you to set a password.

prog=/usr/bin/vnc4passwd
mypass="newpass"

/usr/bin/expect <<EOF
spawn "$prog"
expect "Password:"
send "$mypass\r"
expect "Verify:"
send "$mypass\r"
expect eof
exit
EOF

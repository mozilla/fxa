#!/bin/sh
#
# Wrapper script for loads-runner to talk to remote broker.
# We use an ssh tunnel to communicate with the loads-broker in AWS.
# This gives us a bit of security while making it easy to control the
# loadtest from from a local box.

BROKER=broker.loads.lcip.org

# Host key checking is deliberately disabled because the server regularly
# gets torn-down and replaced, and we're not sending any private info anyway.
SSH="ssh -q -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"

if $SSH ec2-user@$BROKER true; then
  true
else
  echo "ERROR: could not ssh into $BROKER"
  exit 1
fi

$SSH -N -L 7776:$BROKER:7776 -L 7780:$BROKER:7780 ec2-user@$BROKER &
SSH_PID=$!

./bin/loads-runner --broker=tcp://localhost:7780 --zmq-publisher=tcp://localhost:7776 $@

kill $SSH_PID

#!/bin/sh
#
# Run loads bench suite, by submitting to worker machines in AWS.

BROKER=loads.loadtest.lcip.org

# We use an ssh tunnel to communicate with the loads-broker in AWS.
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

# This depends on the agent boxes having picl-idp installed and built.
# XXX TODO: better way to get the JS support code onto the agent boxes.

# JavaScript runner:
#./bin/loads-runner --users=20 --duration=300 --external-process-timeout=60 --broker=tcp://localhost:7780 --zmq-publisher=tcp://localhost:7776 --agents=5 --test-runner="/home/app/picl-idp/loadtest/lib/loads.js/loadsjs/runner.js {test}" "/home/app/picl-idp/loadtest/loadtests.js"

# Python runner
./bin/loads-runner --users=20 --duration=300 --broker=tcp://localhost:7780 --zmq-publisher=tcp://localhost:7776 --agents=5 loadtests.LoadTest.test_idp"

kill $SSH_PID

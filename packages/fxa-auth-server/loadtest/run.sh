#!/bin/sh
#loads-runner -a 1 -b ipc:///tmp/loads-front.ipc --test-dir=/home/rfk/repos/mozilla/identity/picl-idp --test-runner='./loadtest/runner.js {test}' '/home/rfk/repos/mozilla/identity/picl-idp/loadtest/loadtests.js' --hits 10
loads-runner --test-dir=/home/rfk/repos/mozilla/identity/picl-idp --test-runner='/home/rfk/repos/mozilla/services/loads.js/loads.js/runner.js {test}' '/home/rfk/repos/mozilla/identity/picl-idp/loadtest/loadtests.js' --hits=10

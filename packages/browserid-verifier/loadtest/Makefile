SERVER_URL = https://verifier.stage.mozaws.net

.PHONY: build clean test bench megabench

# Build virtualenv, to ensure we have all the dependencies.
build:
	virtualenv --no-site-packages ./venv
	./venv/bin/pip install gevent
	./venv/bin/pip install https://github.com/mozilla-services/loads/archive/master.zip
	./venv/bin/pip install PyBrowserID

# Clean all the things installed by `make build`.
clean:
	rm -rf ./venv *.pyc

# Run a single test from the venv machine, for sanity-checking.
test:
	./venv/bin/loads-runner --config=./config/test.ini --server-url=$(SERVER_URL) loadtest.VerifierLoadTest.test_verifier

# Run a bench of 20 concurrent users.
bench:
	./venv/bin/loads-runner --config=./config/bench.ini --server-url=$(SERVER_URL) loadtest.VerifierLoadTest.test_verifier

# Run a much bigger bench, by submitting to broker in AWS.
megabench:
	./venv/bin/loads-runner --config=./config/megabench.ini --user-id=$(USER) --server-url=$(SERVER_URL) loadtest.VerifierLoadTest.test_verifier

# Purge any currently-running loadtest runs.
purge:
	./venv/bin/loads-runner --config=./config/megabench.ini --purge-broker

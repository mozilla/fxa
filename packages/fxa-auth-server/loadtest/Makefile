.PHONY: build test bench

# Build virtualenv, to ensure we have all the dependencies.
build:
	virtualenv --no-site-packages .
	./bin/pip install cython
	CYTHON=`pwd`/bin/cython ./bin/pip install https://github.com/surfly/gevent/archive/1.0rc2.tar.gz
	./bin/pip install https://github.com/mozilla-services/loads/archive/master.zip
	./bin/pip install 'pyzmq < 14.0'
	./bin/pip install 'hawkauthlib'
	rm -rf ./local  # ubuntu, why you create this useless folder?

# Clean all the things installed by `make build`.
clean:
	rm -rf ./include ./bin ./lib ./lib64

# Run a single test from the local machine, for sanity-checking.
test:
	./bin/loads-runner --hits=1 --users=1 loadtests.LoadTest.test_auth_server

# Run a full bench, by submitting to broker in AWS.
bench:
	./loadsrunner.sh --users=20 --duration=1800 --agents=5 --include-file=./loadtests.py --python-dep=hawkauthlib loadtests.LoadTest.test_auth_server

# Purge any currently-running loadtest runs.
purge:
	./loadsrunner.sh --purge-broker

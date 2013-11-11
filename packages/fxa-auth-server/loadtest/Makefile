.PHONY: build test bench

# Build virtualenv, to ensure we have all the dependencies.
build:
	virtualenv --no-site-packages .
	./bin/pip install cython
	CYTHON=`pwd`/bin/cython ./bin/pip install https://github.com/surfly/gevent/archive/1.0rc2.tar.gz
	./bin/pip install https://github.com/mozilla-services/loads/archive/master.zip
	./bin/pip install 'pyzmq < 14.0'
	./bin/pip install 'hawkauthlib'
	curl -L https://github.com/mozilla-services/loads.js/archive/master.tar.gz > master.tar.gz
	tar -xzvf master.tar.gz
	rm -rf ./lib/loads.js
	mv loads.js-master ./lib/loads.js
	npm install ../
	npm install zmq
	(cd ./lib/loads.js/ && npm install)
	rm -rf master.tar.gz
	rm -rf ./local  # ubuntu, why you create this useless folder?

# Clean all the things installed by `make build`.
clean:
	rm -rf ./include ./bin ./lib ./lib64

# Run a single test from the local machine, for sanity-checking.
test:
	# JavaScript runner:
	#./bin/loads-runner --hits=1 --users=1 --external-process-timeout=30 --test-runner="`pwd`/lib/loads.js/loadsjs/runner.js {test}" "`pwd`/loadtests.js"
	# Python runner:
	./bin/loads-runner --hits=1 --users=1 loadtests.LoadTest.test_idp

# Run a full bench, by submitting to broker in AWS.
bench:
	./runbench.sh

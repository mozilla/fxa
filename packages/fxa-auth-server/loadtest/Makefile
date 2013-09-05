.PHONY: build test bench

# build virtualenv
build:
	virtualenv --no-site-packages .
	./bin/pip install https://github.com/mozilla-services/loads/archive/master.zip
	wget https://github.com/mozilla-services/loads.js/archive/master.tar.gz
	tar -xzvf master.tar.gz
	mv loads.js-master/loads.js ./lib/
	npm install zmq
	npm install ./lib/loads.js/
	rm -rf loads.js-master master.tar.gz
	rm -rf ./local  # ubuntu wtf you create this for?

clean:
	rm -rf ./include ./bin ./lib

# run a single test, for sanity-checking
test:
	./bin/loads-runner --hits=1 --external-process-timeout=30 --test-dir="`pwd`/../" --test-runner="`pwd`/lib/loads.js/runner.js {test}" "`pwd`/loadtests.js"

bench:
	./bin/loads-runner --users=10 --duration=240 --external-process-timeout=30 --test-dir="`pwd`/../" --test-runner="`pwd`/lib/loads.js/runner.js {test}" "`pwd`/loadtests.js"

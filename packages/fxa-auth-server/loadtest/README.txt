This directory contains some very simple loadtests, written using
the "loads" framework:

    https://github.com/mozilla/loads


To run them, you will need the following dependencies:

  * Python development files (e.g. python-dev or python-devel package)
  * Virtualenv (e.g. python-virtualenv package)
  * ZeroMQ development files (e.g. libzmq-dev package)

Then do the following:

  $> make build       # installs local environment with all dependencies
  $> make test        # runs a single test, to check that everything's working
  $> make bench       # runs a longer, higher-concurrency test.
  $> make megabench   # runs a really-long, really-high-concurrent test
                      # using http://loads.services.mozilla.com


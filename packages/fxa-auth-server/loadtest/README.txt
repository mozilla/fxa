
Steps for preliminary loads.js integration using local box:

  * Install dependencies: pip install loads; npm install https://github.com/mozilla-services/loads.js
  * Run the runner:  ./run.sh

Steps for preliminary loads.js integration using broker

  * Install dependencies: pip install loads circus
  * Run the broker:  circusd ./loads.ini
  * Execute the tests ./run.sh


define([
  './intern'
], function (intern) {
  intern.proxyPort = 9090;
  intern.proxyUrl = 'http://localhost:9090/';

  intern.useSauceConnect = false;

  intern.webdriver =  {
    host: 'localhost',
    port: 4444
  };

  intern.capabilities = {
    'selenium-version': '2.37.0'
  };

  intern.environments = [
    { browserName: 'firefox' }
  ];

  return intern;
});

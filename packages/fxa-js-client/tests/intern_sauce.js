define([
  './intern'
], function (intern) {
  intern.proxyPort = 9090;
  intern.proxyUrl = 'http://localhost:9090/';

  intern.useSauceConnect = true;
  intern.maxConcurrency = 3;

  intern.webdriver =  {
    host: 'localhost',
    port: 4445
  };

  intern.capabilities = {
    'selenium-version': '2.37.0'
  };

  intern.environments = [
    { browserName: 'firefox', version: '24' , platform: [ 'Windows 7', 'Linux' ] },
    { browserName: 'internet explorer', version: '10', platform: [ 'Windows 7' ] }
  ];

  return intern;
});

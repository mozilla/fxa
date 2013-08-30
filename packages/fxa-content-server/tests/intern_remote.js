define([
  './intern'
], function (intern) {
  // simply override the main config file and adjust it to suite the local env

  // disable Sauce Connect for local config
  intern.useSauceConnect = true;

  // adjust the local Selenium port
  intern.webdriver.port = 4445;

  intern.environments = [
    { browserName: 'firefox', version: '23', platform: [ 'Linux', 'Windows 7' ] }
  ];

  return intern;
});

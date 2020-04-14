#!/usr/bin/env node

var path = require("path");

var r = require("replace-in-file");

var ios_path = process.env.FIREFOX_IOS_HOME;

if (!ios_path) {
  throw new Error("FIREFOX_IOS_HOME is not set");
}

var config_path = path.join(
  ios_path,
  "Account",
  "FirefoxAccountConfiguration.swift"
);

function replace(options) {
  return new Promise(function(resolve, reject) {
    r(options, function(err) {
      if (err) reject(err);
      resolve();
    });
  });
}

return replace({
  files: config_path,
  replace: /https:\/\/accounts.firefox.com/g,
  with: "http://localhost:3030"
})
  .then(function() {
    return replace({
      files: config_path,
      replace: "https://api.accounts.firefox.com/v1",
      with: "http://localhost:9000/v1"
    });
  })
  .then(function() {
    return replace({
      files: config_path,
      replace: "https://oauth.accounts.firefox.com/v1",
      with: "http://localhost:9010/v1"
    });
  })
  .then(function() {
    return replace({
      files: config_path,
      replace: "https://profile.accounts.firefox.com/v1",
      with: "http://localhost:1111/v1"
    });
  });

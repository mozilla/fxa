/* globals blanket */

blanket.options({
  filter: '//.*fxa-oauth-console/.*/',
  antifilter: '//.*(tests|templates).*/',
  loaderExclusions: ['simple-auth'],
});

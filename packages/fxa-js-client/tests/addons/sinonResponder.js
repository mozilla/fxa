define([
  'tests/addons/sinon'
], function (Sinon) {

  return {
    useFakeXMLHttpRequest: Sinon.useFakeXMLHttpRequest,
    respond: function (req, mock) {
      if (req && req.respond) {
        req.respond(mock.status, mock.headers, mock.body);
      }
    }
  }
});

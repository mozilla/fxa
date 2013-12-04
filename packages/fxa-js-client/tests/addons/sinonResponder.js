define([
  'tests/addons/sinon'
], function (Sinon) {

  return {
    useFakeXMLHttpRequest: Sinon.useFakeXMLHttpRequest,
    respond: function (req, mock) {
      req.respond(mock.status, mock.headers, mock.body);
    }
  }
});

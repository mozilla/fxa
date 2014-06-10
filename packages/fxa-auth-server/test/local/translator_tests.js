var test = require('tap').test

require('../../translator')(['en_US','pt_br', 'DE', 'ES_AR', 'ES_cl'])
.done(
  function (translator) {
    test(
      'translator works with upper and lowercase languages',
      function (t) {
        var x = translator('PT-br,DE')
        t.equal(x.language, 'pt-BR')
        x = translator('bu-ll,es-ar')
        t.equal(x.language, 'es-AR')
        x = translator('es-CL')
        t.equal(x.language, 'es-CL')
        t.end()
      }
    )
  }
)

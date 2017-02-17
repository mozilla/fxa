var test = require('tap').test

require('../../translator')(['en', 'pt_br', 'DE', 'ES_AR', 'ES_cl'], 'en')
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
        x = translator('en-US')
        t.equal(x.language, 'en')
        x = translator('db-LB') // a locale that does not exist
        t.equal(x.language, 'en')
        t.end()
      }
    )
  }
)

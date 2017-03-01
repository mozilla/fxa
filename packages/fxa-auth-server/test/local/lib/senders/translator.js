/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('insist')

require('../../../../lib/senders/translator')(['en', 'pt_br', 'DE', 'ES_AR', 'ES_cl'], 'en')
.then(
  function (translator) {
    it(
      'translator works with upper and lowercase languages',
      function (t) {
        var x = translator('PT-br,DE')
        assert.equal(x.language, 'pt-BR')
        x = translator('bu-ll,es-ar')
        assert.equal(x.language, 'es-AR')
        x = translator('es-CL')
        assert.equal(x.language, 'es-CL')
        x = translator('en-US')
        assert.equal(x.language, 'en')
        x = translator('db-LB') // a locale that does not exist
        assert.equal(x.language, 'en')
      }
    )
  }
)

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

module.exports = {
  create(context) {
    return {
      CallExpression(node) {
        const callee = node.callee
        if (callee.object &&
            callee.object.name === 'crypto' &&
            callee.property &&
            callee.property.name === 'randomBytes' &&
            node.arguments.length === 1) {
          context.report({
            node: node,
            message: 'Pass a callback to crypto.randomBytes().'
          })
        }
      }
    }
  }
}

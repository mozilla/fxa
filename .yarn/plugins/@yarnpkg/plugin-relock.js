/* eslint-disable */
module.exports = {
  name: '@yarnpkg/plugin-relock',
  factory: function (require) {
    var plugin;
    plugin = (() => {
      'use strict';
      var e = {
          928: (e, t, r) => {
            r.r(t), r.d(t, { default: () => p });
            var o = r(594),
              n = r(966),
              c = r(42),
              a = function (e, t, r, o) {
                var n,
                  c = arguments.length,
                  a =
                    c < 3
                      ? t
                      : null === o
                      ? (o = Object.getOwnPropertyDescriptor(t, r))
                      : o;
                if (
                  'object' == typeof Reflect &&
                  'function' == typeof Reflect.decorate
                )
                  a = Reflect.decorate(e, t, r, o);
                else
                  for (var i = e.length - 1; i >= 0; i--)
                    (n = e[i]) &&
                      (a = (c < 3 ? n(a) : c > 3 ? n(t, r, a) : n(t, r)) || a);
                return c > 3 && a && Object.defineProperty(t, r, a), a;
              };
            class i extends c.Command {
              async execute() {
                const e = await n.Configuration.find(
                    this.context.cwd,
                    this.context.plugins
                  ),
                  { project: t, workspace: r } = await n.Project.find(
                    e,
                    this.context.cwd
                  );
                if (!r)
                  throw new o.WorkspaceRequiredError(t.cwd, this.context.cwd);
                const c = await n.Cache.find(e);
                await t.resolveEverything({
                  cache: c,
                  report: new n.ThrowReport(),
                }),
                  await t.persistLockfile();
              }
            }
            a([c.Command.Path('relock')], i.prototype, 'execute', null);
            const p = { commands: [i] };
          },
          594: (e) => {
            e.exports = require('@yarnpkg/cli');
          },
          966: (e) => {
            e.exports = require('@yarnpkg/core');
          },
          42: (e) => {
            e.exports = require('clipanion');
          },
        },
        t = {};
      function r(o) {
        if (t[o]) return t[o].exports;
        var n = (t[o] = { exports: {} });
        return e[o](n, n.exports, r), n.exports;
      }
      return (
        (r.n = (e) => {
          var t = e && e.__esModule ? () => e.default : () => e;
          return r.d(t, { a: t }), t;
        }),
        (r.d = (e, t) => {
          for (var o in t)
            r.o(t, o) &&
              !r.o(e, o) &&
              Object.defineProperty(e, o, { enumerable: !0, get: t[o] });
        }),
        (r.o = (e, t) => Object.prototype.hasOwnProperty.call(e, t)),
        (r.r = (e) => {
          'undefined' != typeof Symbol &&
            Symbol.toStringTag &&
            Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' }),
            Object.defineProperty(e, '__esModule', { value: !0 });
        }),
        r(928)
      );
    })();
    return plugin;
  },
};

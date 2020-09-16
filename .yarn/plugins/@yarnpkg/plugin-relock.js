/* eslint-disable */
module.exports = {
  name: '@yarnpkg/plugin-relock',
  factory: function (require) {
    var plugin;
    plugin = (() => {
      'use strict';
      var e = {
          928: (e, t, r) => {
            r.r(t), r.d(t, { default: () => i });
            var o = r(594),
              c = r(966),
              s = r(42),
              n = function (e, t, r, o) {
                var c,
                  s = arguments.length,
                  n =
                    s < 3
                      ? t
                      : null === o
                      ? (o = Object.getOwnPropertyDescriptor(t, r))
                      : o;
                if (
                  'object' == typeof Reflect &&
                  'function' == typeof Reflect.decorate
                )
                  n = Reflect.decorate(e, t, r, o);
                else
                  for (var a = e.length - 1; a >= 0; a--)
                    (c = e[a]) &&
                      (n = (s < 3 ? c(n) : s > 3 ? c(t, r, n) : c(t, r)) || n);
                return s > 3 && n && Object.defineProperty(t, r, n), n;
              };
            class a extends s.Command {
              async execute() {
                const e = await c.Configuration.find(
                    this.context.cwd,
                    this.context.plugins
                  ),
                  { project: t, workspace: r } = await c.Project.find(
                    e,
                    this.context.cwd
                  );
                if (!r)
                  throw new o.WorkspaceRequiredError(t.cwd, this.context.cwd);
                const s = await c.Cache.find(e);
                await t.resolveEverything({
                  cache: s,
                  report: new c.ThrowReport(),
                });
                try {
                  const r = Array.from(
                    new Set(
                      c.miscUtils.sortMap(t.storedResolutions.values(), [
                        (e) => {
                          const r = t.storedPackages.get(e);
                          if (!r)
                            throw new Error(
                              'Assertion failed: The locator should have been registered'
                            );
                          return c.structUtils.stringifyLocator(r);
                        },
                      ])
                    )
                  ).filter((e) => !t.storedChecksums.has(e));
                  for (const o of r) {
                    const r = t.storedPackages.get(o),
                      n = e.makeFetcher(),
                      a = await n.fetch(r, {
                        checksums: t.storedChecksums,
                        project: t,
                        cache: s,
                        fetcher: n,
                        report: new c.ThrowReport(),
                      });
                    a.checksum &&
                      t.storedChecksums.set(r.locatorHash, a.checksum);
                  }
                } catch (e) {}
                await t.persistLockfile();
              }
            }
            n([s.Command.Path('relock')], a.prototype, 'execute', null);
            const i = { commands: [a] };
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
        var c = (t[o] = { exports: {} });
        return e[o](c, c.exports, r), c.exports;
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

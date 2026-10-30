/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// EXPERIMENTAL GENAI DRIBBLE, CONSIDER YOURSELF WARNED!!!


// Webpack config for bundling a Node service and the @fxa/* libs it imports.
// npm packages stay external and are listed in the generated package.json,
// which `install-bundle.sh` installs from.
//
// A bundle must start with cwd set to its package: `__dirname` and
// `__filename` become each module's source path, resolved against that
// starting cwd, so templates, locales and config files are read from where
// they live in the repo even if the service later calls process.chdir().

const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { existsSync, readdirSync, readFileSync, realpathSync } = require('fs');
const { builtinModules } = require('module');
const { dirname, join, relative } = require('path');
const { TsconfigPathsPlugin } = require('tsconfig-paths-webpack-plugin');

const repoRoot = join(__dirname, '../..');
const rootPkg = require(join(repoRoot, 'package.json'));

// webpack's own `node.__dirname: true` emits a relative path, which breaks
// once the process changes directory. NxAppWebpackPlugin leaves `node: false`,
// so these identifiers are untouched until this plugin rewrites them.
class SourcePathPlugin {
  apply(compiler) {
    const { BannerPlugin, dependencies } = compiler.webpack;
    new BannerPlugin({
      banner: 'const __fxaPackageRoot = process.cwd();',
      raw: true,
      entryOnly: true,
    }).apply(compiler);

    compiler.hooks.compilation.tap('SourcePath', (compilation, { normalModuleFactory }) => {
      const onParser = (parser) => {
        for (const [ident, pathOf] of [
          ['__dirname', dirname],
          ['__filename', (p) => p],
        ]) {
          parser.hooks.expression.for(ident).tap('SourcePath', (expr) => {
            const rel = relative(compiler.context, pathOf(parser.state.module.resource));
            const dep = new dependencies.ConstDependency(
              `require('path').resolve(__fxaPackageRoot, ${JSON.stringify(rel)})`,
              expr.range
            );
            dep.loc = expr.loc;
            parser.state.module.addPresentationalDependency(dep);
            return true;
          });
        }
      };
      for (const type of ['javascript/auto', 'javascript/dynamic']) {
        normalModuleFactory.hooks.parser.for(type).tap('SourcePath', onParser);
      }
    });
  }
}

// Writes a package.json listing exactly the npm packages the bundle requires.
// Nx's generatePackageJson works from the project graph, which both misses
// runtime requires and includes deps only tests import.
class ExternalsPackageJsonPlugin {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.ownPkg = require(join(projectRoot, 'package.json'));
  }

  // Read from disk: `exports` maps can hide package.json from require.resolve.
  installedDir(name) {
    for (const dir of [this.projectRoot, repoRoot]) {
      const pkgDir = join(dir, 'node_modules', name);
      if (existsSync(join(pkgDir, 'package.json'))) return realpathSync(pkgDir);
    }
    throw new Error(`${name} is required by the bundle but not installed`);
  }

  installedPkg(name) {
    return JSON.parse(readFileSync(join(this.installedDir(name), 'package.json'), 'utf8'));
  }

  // Workspace packages can require packages they don't declare, which the
  // monorepo root happens to provide. Scans their source for bare requires.
  workspaceRequires(dir) {
    const names = new Set();
    const walk = (d) => {
      for (const ent of readdirSync(d, { withFileTypes: true })) {
        if (['node_modules', 'test', 'tests'].includes(ent.name)) continue;
        const p = join(d, ent.name);
        if (ent.isDirectory()) walk(p);
        else if (/\.[cm]?js$/.test(ent.name)) {
          const src = readFileSync(p, 'utf8');
          for (const [, req] of src.matchAll(/require\(\s*['"]([^'"./][^'"]*)['"]\s*\)/g)) {
            const parts = req.replace(/^node:/, '').split('/');
            const name = req.startsWith('@') ? `${parts[0]}/${parts[1]}` : parts[0];
            if (!builtinModules.includes(name)) names.add(name);
          }
        }
      }
    };
    walk(dir);
    return names;
  }

  // A standalone install gets no peers for free, unlike the monorepo where the
  // root provides them. Walks the hoisted tree from `names` and returns every
  // required peer that the monorepo has installed.
  // ponytail: hoisted lookup only; nested copies with different peers are missed.
  requiredPeers(names) {
    const seen = new Set();
    const peers = new Set();
    const queue = [...names];
    while (queue.length) {
      const name = queue.pop();
      if (seen.has(name)) continue;
      seen.add(name);
      let pkg;
      try {
        pkg = this.installedPkg(name);
      } catch {
        continue;
      }
      queue.push(...Object.keys(pkg.dependencies ?? {}));
      for (const peer of Object.keys(pkg.peerDependencies ?? {})) {
        if (pkg.peerDependenciesMeta?.[peer]?.optional) continue;
        peers.add(peer);
        queue.push(peer);
      }
    }
    return [...peers].filter((peer) => {
      try {
        return this.installedPkg(peer);
      } catch {
        return false;
      }
    });
  }

  versionOf(name) {
    return (
      this.ownPkg.dependencies?.[name] ??
      rootPkg.dependencies?.[name] ??
      rootPkg.devDependencies?.[name] ??
      this.installedPkg(name).version
    );
  }

  apply(compiler) {
    compiler.hooks.thisCompilation.tap('ExternalsPackageJson', (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: 'ExternalsPackageJson',
          stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
        },
        () => {
          const used = new Set();
          for (const m of compilation.modules) {
            if (!(m instanceof compiler.webpack.ExternalModule)) continue;
            const req = [].concat(m.request)[0].replace(/^node:/, '');
            if (builtinModules.includes(req.split('/')[0])) continue;
            const parts = req.split('/');
            used.add(req.startsWith('@') ? `${parts[0]}/${parts[1]}` : parts[0]);
          }

          for (const peer of this.requiredPeers(used)) used.add(peer);
          const deps = {};
          const workspacePackages = {};
          for (const name of [...used].sort()) {
            const version = this.versionOf(name);
            if (!version.startsWith('workspace:')) {
              deps[name] = version;
              continue;
            }
            // Workspace packages are copied into the image as-is, so only
            // their dependencies are installed.
            const dir = this.installedDir(name);
            workspacePackages[name] = relative(repoRoot, dir);
            Object.assign(deps, this.installedPkg(name).dependencies);
            for (const req of this.workspaceRequires(dir)) {
              deps[req] ??= this.versionOf(req);
            }
          }

          const out = {
            name: this.ownPkg.name,
            version: this.ownPkg.version,
            private: true,
            dependencies: deps,
            resolutions: rootPkg.resolutions,
            fxaWorkspacePackages: workspacePackages,
          };
          const { RawSource } = compiler.webpack.sources;
          compilation.emitAsset(
            'package.json',
            new RawSource(JSON.stringify(out, null, 2))
          );
        }
      );
    });
  }
}

/**
 * @param {object} opts
 * @param {string} opts.projectRoot absolute path of the package being bundled
 * @param {string} opts.main entry file, relative to projectRoot
 * @param {{entryName: string, entryPath: string}[]} [opts.additionalEntryPoints]
 * @param {string} [opts.tsConfig] tsconfig file name inside projectRoot
 */
function nodeServiceWebpackConfig({
  projectRoot,
  main,
  additionalEntryPoints = [],
  tsConfig = 'tsconfig.json',
}) {
  const tsConfigPath = join(projectRoot, tsConfig);
  return {
    output: {
      path: join(repoRoot, 'dist', relative(repoRoot, projectRoot)),
    },
    resolve: {
      plugins: [
        new TsconfigPathsPlugin({
          configFile: tsConfigPath,
          extensions: ['.ts', '.tsx', '.mjs', '.js', '.jsx'],
        }),
      ],
    },
    plugins: [
      new NxAppWebpackPlugin({
        target: 'node',
        compiler: 'tsc',
        main,
        additionalEntryPoints,
        tsConfig: tsConfigPath,
        // Nx's own paths plugin parses tsconfig with JSON.parse, fails on
        // comments, and falls back to the wrong baseUrl.
        useTsconfigPaths: false,
        externalDependencies: 'all',
        skipTypeChecking: true,
        optimization: false,
        outputHashing: 'none',
        sourceMap: true,
      }),
      new SourcePathPlugin(),
      new ExternalsPackageJsonPlugin(projectRoot),
    ],
  };
}

module.exports = { nodeServiceWebpackConfig };

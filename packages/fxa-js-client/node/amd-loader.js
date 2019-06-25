// This is intended to be the simplest possible AMD shim that works
// It is not intended a general AMD loader just enough to load this package
// This relies on the fact that Node.js require() is synchronous.
// It attempts to let the node.js module loader do as much work as possible
// Also provides a way to replace modules with api compatible counterparts

var path = require('path');

module.exports = function amdload(absoluteFilename, map) {
  // Store this so we can put it back later.
  var oldDefine = global.define;

  map = map || {};
  var loaded = {},
    dirs = [],
    exported;

  /**
   * These two functions operate as a pair
   */
  function amdrequire(filepath) {
    // Return real node modules if we have them mapped
    if (filepath in map) {
      return require(map[filepath]);
    }

    // Resolve target against 'current working directory'
    var fullpath = path.resolve(dirs[0], filepath);

    if (!loaded[fullpath]) {
      // Put current operation on stack
      dirs.unshift(path.dirname(fullpath));

      // setup fake define and delegate to real require()
      global.define = define;

      require(fullpath);

      // Capture and store exported module
      loaded[fullpath] = exported;
      exported = null;

      // Restore previous define() state
      if (oldDefine) {
        global.define = define;
      } else {
        delete global.define;
      }

      // return to cwd from before define
      dirs.shift();
    }

    // return value captured by define()
    return loaded[fullpath];
  }
  function define(deps, factory) {
    // Load all dependencies
    var modules = deps.map(amdrequire);
    // Capture the exported value
    exported = factory.apply(null, modules);
  }
  define.amd = true;

  return amdrequire(absoluteFilename);
};

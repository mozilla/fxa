// Details: https://github.com/jrburke/almond#exporting-a-public-api
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        //Allow using this built library as an AMD module
        //in another project. That other project will only
        //see this AMD call, not the internal modules in
        //the closure below.
        define([], factory);
    } else {
        //Browser globals case. Just assign the
        //result to a property on the global.
        root.FxaRelierClient = factory();
    }
}(this, function () {
/**
 * @license almond 0.3.0 Copyright (c) 2011-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice,
        jsSuffixRegExp = /\.js$/;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap, lastIndex,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);
                name = name.split('/');
                lastIndex = name.length - 1;

                // Node .js allowance:
                if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                    name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
                }

                name = baseParts.concat(name);

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            var args = aps.call(arguments, 0);

            //If first arg is not require('string'), and there is only
            //one arg, it is the array form without a callback. Insert
            //a null so that the following concat is correct.
            if (typeof args[0] !== 'string' && args.length === 1) {
                args.push(null);
            }
            return req.apply(undef, args.concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            callbackType = typeof callback,
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (callbackType === 'undefined' || callbackType === 'function') {
            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback ? callback.apply(defined[name], args) : undefined;

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (config.deps) {
                req(config.deps, config.callback);
            }
            if (!callback) {
                return;
            }

            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        return req(cfg);
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("components/almond/almond", function(){});

/*!
 * Copyright 2013 Robert Katić
 * Released under the MIT license
 * https://github.com/rkatic/p/blob/master/LICENSE
 *
 * High-priority-tasks code-portion based on https://github.com/kriskowal/asap
 * Long-Stack-Support code-portion based on https://github.com/kriskowal/q
 */
;(function( factory ){
	// CommonJS
	if ( typeof module !== "undefined" && module && module.exports ) {
		module.exports = factory();

	// RequireJS
	} else if ( typeof define === "function" && define.amd ) {
		define( 'p-promise',factory );

	// global
	} else {
		P = factory();
	}
})(function() {
	

	var withStack = withStackThrowing,
		pStartingLine = captureLine(),
		pFileName,
		currentTrace = null;

	function withStackThrowing( error ) {
		if ( !error.stack ) {
			try {
				throw error;
			} catch ( e ) {}
		}
		return error;
	}

	if ( new Error().stack ) {
		withStack = function( error ) {
			return error;
		};
	}

	function getTrace() {
		var stack = withStack( new Error() ).stack;
		if ( !stack ) {
			return null;
		}

		var stacks = [ filterStackString( stack, 1 ) ];

		if ( currentTrace ) {
			stacks = stacks.concat( currentTrace );

			if ( stacks.length === 128 ) {
				stacks.pop();
			}
		}

		return stacks;
	}

	function getFileNameAndLineNumber( stackLine ) {
		var m =
			/at .+ \((.+):(\d+):(?:\d+)\)$/.exec( stackLine ) ||
			/at ([^ ]+):(\d+):(?:\d+)$/.exec( stackLine ) ||
			/@(.+):(\d+):(?:\d+)$/.exec( stackLine );

		return m ? { fileName: m[1], lineNumber: Number(m[2]) } : null;
	}

	function captureLine() {
		var stack = withStack( new Error() ).stack;
		if ( !stack ) {
			return 0;
		}

		var lines = stack.split("\n");
		var firstLine = lines[0].indexOf("@") > 0 ? lines[1] : lines[2];
		var pos = getFileNameAndLineNumber( firstLine );
		if ( !pos ) {
			return 0;
		}

		pFileName = pos.fileName;
		return pos.lineNumber;
	}

	function filterStackString( stack, ignoreFirstLines ) {
		var lines = stack.split("\n");
		var goodLines = [];

		for ( var i = ignoreFirstLines|0, l = lines.length; i < l; ++i ) {
			var line = lines[i];

			if ( line && !isNodeFrame(line) && !isInternalFrame(line) ) {
				goodLines.push( line );
			}
		}

		return goodLines.join("\n");
	}

	function isNodeFrame( stackLine ) {
		return stackLine.indexOf("(module.js:") !== -1 ||
			   stackLine.indexOf("(node.js:") !== -1;
	}

	function isInternalFrame( stackLine ) {
		var pos = getFileNameAndLineNumber( stackLine );
		return !!pos &&
			pos.fileName === pFileName &&
			pos.lineNumber >= pStartingLine &&
			pos.lineNumber <= pEndingLine;
	}

	var STACK_JUMP_SEPARATOR = "\nFrom previous event:\n";

	function makeStackTraceLong( error ) {
		if ( error instanceof Error ) {
			var stack = error.stack;

			if ( !stack ) {
				stack = withStack( error ).stack;

			} else if ( ~stack.indexOf(STACK_JUMP_SEPARATOR) ) {
				return;
			}

			if ( stack ) {
				error.stack = [ filterStackString( stack, 0 ) ]
					.concat( currentTrace || [] )
					.join(STACK_JUMP_SEPARATOR);
			}
		}
	}

	//__________________________________________________________________________

	var
		isNodeJS = ot(typeof process) && process != null &&
			({}).toString.call(process) === "[object process]",

		hasSetImmediate = typeof setImmediate === "function",

		gMutationObserver =
			ot(typeof MutationObserver) && MutationObserver ||
			ot(typeof WebKitMutationObserver) && WebKitMutationObserver,

		head = new TaskNode(),
		tail = head,
		flushing = false,
		nFreeTaskNodes = 0,

		requestFlush =
			isNodeJS ? requestFlushForNodeJS :
			gMutationObserver ? makeRequestCallFromMutationObserver( flush ) :
			makeRequestCallFromTimer( flush ),

		pendingErrors = [],
		requestErrorThrow = makeRequestCallFromTimer( throwFirstError ),

		handleError,

		domain,

		call = ot.call,
		apply = ot.apply;

	tail.next = head;

	function TaskNode() {
		this.a = null;
		this.b = null;
		this.next = null;
	}

	function ot( type ) {
		return type === "object" || type === "function";
	}

	function throwFirstError() {
		if ( pendingErrors.length ) {
			throw pendingErrors.shift();
		}
	}

	function flush() {
		while ( head !== tail ) {
			var h = head = head.next;

			if ( nFreeTaskNodes >= 1024 ) {
				tail.next = tail.next.next;
			} else {
				++nFreeTaskNodes;
			}

			var a = h.a;
			var b = h.b;
			h.a = null;
			h.b = null;

			Then( a, b );
		}

		flushing = false;
		currentTrace = null;
	}

	function scheduleThen( a, b ) {
		var node = tail.next;

		if ( node === head ) {
			tail.next = node = new TaskNode();
			node.next = head;
		} else {
			--nFreeTaskNodes;
		}

		tail = node;

		node.a = a;
		node.b = b;

		if ( !flushing ) {
			flushing = true;
			requestFlush();
		}
	}

	function requestFlushForNodeJS() {
		var currentDomain = process.domain;

		if ( currentDomain ) {
			if ( !domain ) domain = (1,require)("domain");
			domain.active = process.domain = null;
		}

		if ( flushing && hasSetImmediate ) {
			setImmediate( flush );

		} else {
			process.nextTick( flush );
		}

		if ( currentDomain ) {
			domain.active = process.domain = currentDomain;
		}
	}

	function makeRequestCallFromMutationObserver( callback ) {
		var toggle = 1;
		var node = document.createTextNode("");
		var observer = new gMutationObserver( callback );
		observer.observe( node, {characterData: true} );

		return function() {
			toggle = -toggle;
			node.data = toggle;
		};
	}

	function makeRequestCallFromTimer( callback ) {
		return function() {
			var timeoutHandle = setTimeout( handleTimer, 0 );
			var intervalHandle = setInterval( handleTimer, 50 );

			function handleTimer() {
				clearTimeout( timeoutHandle );
				clearInterval( intervalHandle );
				callback();
			}
		};
	}

	if ( isNodeJS ) {
		handleError = function( e ) {
			currentTrace = null;
			requestFlush();
			throw e;
		};

	} else {
		handleError = function( e ) {
			pendingErrors.push( e );
			requestErrorThrow();
		}
	}

	//__________________________________________________________________________


	var PENDING = 0;
	var FULFILLED = 1;
	var REJECTED = 2;

	var OP_CALL = 0;
	var OP_THEN = -1;
	var OP_MULTIPLE = -2;

	var VOID = P(void 0);

	function DoneEb( e ) {
		if ( P.onerror ) {
			(1,P.onerror)( e );

		} else {
			throw e;
		}
	}

	function ReportIfRejected( p ) {
		if ( p._state === REJECTED ) {
			if ( p._domain ) {
				p._domain.enter();
			}

			handleError( p._value );
		}
	}

	function P( x ) {
		return x instanceof Promise ?
			x :
			Resolve( new Promise(), x );
	}

	P.longStackSupport = false;

	function Fulfill( p, value ) {
		if ( p._state ) {
			return;
		}

		p._state = FULFILLED;
		p._value = value;

		HandleSettled( p );
	}

	function Reject( p, reason ) {
		if ( p._state ) {
			return;
		}

		if ( currentTrace ) {
			makeStackTraceLong( reason );
		}

		p._state = REJECTED;
		p._value = reason;

		if ( isNodeJS ) {
			p._domain = process.domain;
		}

		HandleSettled( p );
	}

	function Propagate( parent, p ) {
		if ( p._state ) {
			return;
		}

		p._state = parent._state;
		p._value = parent._value;
		p._domain = parent._domain;

		HandleSettled( p );
	}

	function Resolve( p, x ) {
		if ( p._state ) {
			return p;
		}

		if ( x instanceof Promise ) {
			ResolveWithPromise( p, x );

		} else {
			var type = typeof x;

			if ( type === "object" && x !== null || type === "function" ) {
				ResolveWithObject( p, x )

			} else {
				Fulfill( p, x );
			}
		}

		return p;
	}

	function ResolveWithPromise( p, x ) {
		if ( x === p ) {
			Reject( p, new TypeError("You can't resolve a promise with itself") );

		} else if ( x._state ) {
			Propagate( x, p );

		} else {
			OnSettled( x, OP_THEN, p );
		}
	}

	function ResolveWithObject( p, x ) {
		var then = GetThen( p, x );

		if ( typeof then === "function" ) {
			TryResolver( resolverFor(p, false), then, x );

		} else {
			Fulfill( p, x );
		}
	}

	function GetThen( p, x ) {
		try {
			return x.then;

		} catch ( e ) {
			Reject( p, e );
			return null;
		}
	}

	function TryResolver( d, resolver, x ) {
		try {
			call.call( resolver, x, d.resolve, d.reject );

		} catch ( e ) {
			d.reject( e );
		}
	}

	function HandleSettled( p ) {
		if ( p._pending ) {
			HandlePending( p, p._op, p._pending );
			p._pending = null;
		}
	}

	function HandlePending( p, op, pending ) {
		if ( op >= 0 ) {
			pending( p, op );

		} else if ( op === OP_THEN ) {
			scheduleThen( p, pending );

		} else {
			for ( var i = 0, l = pending.length; i < l; i += 2 ) {
				HandlePending( p, pending[i], pending[i + 1] );
			}
		}
	}

	function OnSettled( p, op, pending ) {
		if ( p._state ) {
			HandlePending( p, op, pending );

		} else if ( !p._pending ) {
			p._pending = pending;
			p._op = op;

		} else if ( p._op === OP_MULTIPLE ) {
			p._pending.push( op, pending );

		} else {
			p._pending = [ p._op, p._pending, op, pending ];
			p._op = OP_MULTIPLE;
		}
	}

	function Then( parent, p ) {
		var domain = parent._domain || p._domain;

		currentTrace = p._trace;

		var cb = parent._state === FULFILLED ? p._cb : p._eb;

		p._cb = null;
		p._eb = null;
		p._domain = null;
		p._trace = null;

		if ( cb === null ) {
			Propagate( parent, p );

		} else if ( domain ) {
			if ( !domain._disposed ) {
				domain.enter();
				HandleCallback( p, cb, parent._value );
				domain.exit();
			}

		} else {
			HandleCallback( p, cb, parent._value );
		}
	}

	function HandleCallback( p, cb, value ) {
		var x;

		try {
			x = cb( value );

		} catch ( e ) {
			Reject( p, e );
			return;
		}

		Resolve( p, x );
	}

	function resolverFor( promise, nodelike ) {
		var trace = P.longStackSupport ? getTrace() : null;

		function resolve( error, y ) {
			if ( promise ) {
				var p = promise;
				promise = null;

				if ( trace ) {
					if ( currentTrace ) {
						trace = null;

					} else {
						currentTrace = trace;
					}
				}

				if ( error ) {
					Reject( p, nodelike ? error : y );

				} else {
					Resolve( p, y );
				}

				if ( trace ) {
					currentTrace = trace = null;
				}
			}
		}

		return nodelike ? resolve : {
			promise: promise,

			resolve: function( y ) {
				resolve( false, y );
			},

			reject: function( reason ) {
				resolve( true, reason );
			}
		};
	}

	P.defer = defer;
	function defer() {
		return resolverFor( new Promise(), false );
	}

	P.reject = reject;
	function reject( reason ) {
		var promise = new Promise();
		Reject( promise, reason );
		return promise;
	}

	function Promise() {
		this._state = 0;
		this._value = void 0;
		this._domain = null;
		this._cb = null;
		this._eb = null;
		this._op = 0;
		this._pending = null;
		this._trace = null;
	}

	Promise.prototype._clone = function() {
		var promise = new Promise();
		ResolveWithPromise( promise, this );
		return promise;
	};

	Promise.prototype.then = function( onFulfilled, onRejected ) {
		var promise = new Promise();

		promise._cb = typeof onFulfilled === "function" ? onFulfilled : null;
		promise._eb = typeof onRejected === "function" ? onRejected : null;

		if ( P.longStackSupport ) {
			promise._trace = getTrace();
		}

		if ( isNodeJS ) {
			promise._domain = process.domain;
		}

		if ( this._state ) {
			scheduleThen( this, promise );

		} else {
			OnSettled( this, OP_THEN, promise );
		}

		return promise;
	};

	Promise.prototype.done = function( cb, eb ) {
		var p = this;

		if ( cb || eb ) {
			p = p.then( cb, eb );
		}

		p = p.then( null, DoneEb );

		OnSettled( p, OP_CALL, ReportIfRejected );
	};

	Promise.prototype.fail = function( eb ) {
		return this.then( null, eb );
	};

	Promise.prototype.fin = function( cb ) {
		var p = this;
		var promise = p.then( _finally, _finally );

		function _finally() {
			return P( cb() ).then(function() {
				Propagate( p, promise );
			});
		}

		return promise;
	};

	Promise.prototype.spread = function( cb, eb ) {
		return this.then( _all ).then(function( args ) {
			return apply.call( cb, void 0, args );
		}, eb);
	};

	Promise.prototype.timeout = function( ms, msg ) {
		var promise = this._clone();

		if ( this._state === PENDING ) {
			var trace = P.longStackSupport ? getTrace() : null;
			var timeoutId = setTimeout(function() {
				currentTrace = trace;
				Reject( promise, new Error(msg || "Timed out after " + ms + " ms") );
				currentTrace = null;
			}, ms);

			OnSettled( this, OP_CALL, function() {
				clearTimeout( timeoutId );
			});
		}

		return promise;
	};

	Promise.prototype.delay = function( ms ) {
		var promise = new Promise();

		OnSettled(this, OP_CALL, function( p ) {
			if ( p._state === FULFILLED ) {
				setTimeout(function() {
					Propagate( p, promise );
				}, ms);

			} else {
				VOID.then(function() {
					Propagate( p, promise );
				});
			}
		});

		return promise;
	};

	Promise.prototype.all = function() {
		return this.then( _all );
	};

	Promise.prototype.allSettled = function() {
		return this.then( _allSettled );
	};

	Promise.prototype.inspect = function() {
		switch ( this._state ) {
			case PENDING:   return { state: "pending" };
			case FULFILLED: return { state: "fulfilled", value: this._value };
			case REJECTED:  return { state: "rejected", reason: this._value };
			default: throw new TypeError("invalid state");
		}
	};

	Promise.prototype.nodeify = function( nodeback ) {
		if ( nodeback ) {
			this.done(function( value ) {
				nodeback( null, value );
			}, nodeback);
			return void 0;

		} else {
			return this;
		}
	};

	P.allSettled = allSettled;
	function allSettled( input ) {
		var promise = _allSettled( input );
		// Ensure propagation doesn't overflew the stack.
		return promise._state ? promise : promise._clone();
	}

	function _allSettled( input ) {
		var promise = new Promise();
		var len = input.length;

		if ( typeof len !== "number" ) {
			Reject( promise, new TypeError("input not array-like") );
			return promise;
		}

		var output = new Array( len );
		var waiting = len;

		function onSettled( p, i ) {
			output[ i ] = p.inspect();
			if ( --waiting === 0 ) {
				Fulfill( promise, output );
			}
		}

		for ( var i = 0; i < len; ++i ) {
			OnSettled( P(input[i]), i, onSettled );
		}

		if ( waiting === 0 ) {
			Fulfill( promise, output );
		}

		return promise;
	}

	P.all = all;
	function all( input ) {
		var promise = _all( input );
		// Ensure propagation doesn't overflew the stack.
		return promise._state ? promise : promise._clone();
	}

	function _all( input ) {
		var promise = new Promise();
		var len = input.length;
		var ret = promise;

		if ( typeof len !== "number" ) {
			Reject( promise, new TypeError("input not array-like") );
			return promise;
		}

		var output = new Array( len );
		var waiting = len;

		function onSettled( p, i ) {
			if ( output !== null ) {
				if ( p._state === REJECTED ) {
					output = null;
					Propagate( p, promise );
					promise = null;

				} else {
					output[ i ] = p._value;
					if ( --waiting === 0 ) {
						Fulfill( promise, output );
					}
				}
			}
		}

		for ( var i = 0; i < len; ++i ) {
			OnSettled( P(input[i]), i, onSettled );
		}

		if ( waiting === 0 ) {
			Fulfill( promise, output );
		}

		return ret;
	}

	P.spread = spread;
	function spread( values, cb, eb ) {
		return _all( values ).then(function( args ) {
			return apply.call( cb, void 0, args );
		}, eb);
	}

	P.promised = promised;
	function promised( f ) {
		function onFulfilled( thisAndArgs ) {
			return call.apply( f, thisAndArgs );
		}

		return function() {
			var len = arguments.length;
			var thisAndArgs = new Array( len + 1 );
			thisAndArgs[0] = this;
			for ( var i = 0; i < len; ++i ) {
				thisAndArgs[ i + 1 ] = arguments[ i ];
			}
			return _all( thisAndArgs ).then( onFulfilled );
		};
	}

	P.denodeify = denodeify;
	function denodeify( f ) {
		return function() {
			var promise = new Promise();

			var i = arguments.length;
			var args = new Array( i + 1 );
			args[i] = resolverFor( promise, true );
			while ( i-- ) {
				args[i] = arguments[i];
			}

			TryApply( promise, f, this, args );

			return promise;
		};
	}

	function TryApply( p, f, that, args ) {
		try {
			apply.call( f, that, args );

		} catch ( e ) {
			Reject( p, e );
		}
	}

	P.onerror = null;

	P.nextTick = function nextTick( task ) {
		// We don't use .done to avoid P.onerror.
		var p = VOID.then(function() {
			task.call();
		});
		OnSettled( p, OP_CALL, ReportIfRejected );
	};

	var pEndingLine = captureLine();

	return P;
});

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Helper functions for working with Objects
 */
define('client/lib/object',[], function () {
  

  function extend(target) {
    var sources = [].slice.call(arguments, 1);

    for (var index = 0, source; source = sources[index]; ++index) {
      for (var key in source) {
        target[key] = source[key];
      }
    }

    return target;
  }

  return {
    extend: extend
  };
});





/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Helper functions for working with options
 */


define('client/lib/options',[], function () {
  

  function checkRequired(requiredOptions, options) {
    for (var i = 0, requiredOption; requiredOption = requiredOptions[i]; ++i) {
      if (! (requiredOption in options)) {
        throw new Error(requiredOption + ' is required');
      }
    }
  }

  return {
    checkRequired: checkRequired
  };

});



/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define('client/lib/constants',[], function () {
  

  return {
    DEFAULT_FXA_HOST: 'https://accounts.firefox.com',
    SIGNIN_ENDPOINT: 'oauth/signin',
    SIGNUP_ENDPOINT: 'oauth/signup',
    FORCE_EMAIL_ENDPOINT: 'force_auth'
  };
});



/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * helpers to work with URLs
 */
define('client/lib/url',[], function () {
  

  function createQueryParam(key, value) {
    return key + '=' + encodeURIComponent(value);
  }

  function objectToQueryString(obj) {
    var queryParams = [];

    for (var key in obj) {
      queryParams.push(createQueryParam(key, obj[key]));
    }

    return '?' + queryParams.join('&');
  }

  return {
    createQueryParam: createQueryParam,
    objectToQueryString: objectToQueryString
  };
});



/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*globals define*/

define('client/auth/api',[
  'p-promise',
  'client/lib/constants',
  'client/lib/options',
  'client/lib/url'
], function (p, Constants, Options, Url) {
  

  function AuthenticationAPI(clientId, options) {
    if (! clientId) {
      throw new Error('clientId is required');
    }

    this._clientId = clientId;
    this._fxaHost = options.fxaHost || Constants.DEFAULT_FXA_HOST;
    this._window = options.window || window;
  }

  function authenticate(page, config) {
    //jshint validthis: true
    var self = this;
    return p().then(function () {
      var requiredOptions = ['scope', 'state', 'redirect_uri'];
      Options.checkRequired(requiredOptions, config);

      var fxaUrl = getFxaUrl.call(self, page, config);
      return self.openFxa(fxaUrl);
    });
  }

  function getFxaUrl(page, config) {
    //jshint validthis: true
    var queryParams = {
      client_id: this._clientId,
      state: config.state,
      scope: config.scope,
      redirect_uri: config.redirect_uri
    };

    if (config.force_email) {
      queryParams.email = config.force_email;
    }

    return this._fxaHost + '/' + page + Url.objectToQueryString(queryParams);
  }

  AuthenticationAPI.prototype = {
    /**
     * Open Firefox Accounts to authenticate the user.
     * Must be overridden to provide API specific functionality.
     *
     * @method openFxa
     * @param {String} fxaUrl - URL to open for authentication
     *
     * @virtual
     */
    openFxa: function (fxaUrl) {
      throw new Error('openFxa must be overridden');
    },

    /**
     * Sign in an existing user
     *
     * @method signIn
     * @param {Object} config - configuration
     *   @param {String} config.state
     *   CSRF/State token
     *   @param {String} config.redirect_uri
     *   URI to redirect to when complete
     *   @param {String} config.scope
     *   OAuth scope
     *   @param {String} [config.force_email]
     *   Force the user to sign in with the given email
     */
    signIn: function (config) {
      config = config || {};
      var page = config.force_email ?
                   Constants.FORCE_EMAIL_ENDPOINT :
                   Constants.SIGNIN_ENDPOINT;
      return authenticate.call(this, page, config);
    },

    /**
     * Sign up a new user
     *
     * @method signUp
     * @param {Object} config - configuration
     *   @param {String} config.state
     *   CSRF/State token
     *   @param {String} config.redirect_uri
     *   URI to redirect to when complete
     *   @param {String} config.scope
     *   OAuth scope
     */
    signUp: function (config) {
      return authenticate.call(this, Constants.SIGNUP_ENDPOINT, config);
    },
  };

  return AuthenticationAPI;
});



/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*globals define*/

define('client/auth/lightbox/lightbox',[
], function () {
  

  function createElement(window, type, attributes) {
    var el = window.document.createElement(type);

    for (var attribute in attributes) {
      el.setAttribute(attribute, attributes[attribute]);
    }

    return el;
  }

  function cssPropsToString(props) {
    var str = '';

    for (var key in props) {
      str += key + ':' + props[key] + ';';
    }

    return str;
  }


  function Lightbox(options) {
    options = options || {};

    this._window = options.window;
  }

  Lightbox.prototype = {
    load: function (src) {
      var background = this._backgroundEl = createElement(this._window, 'div', {
        style: cssPropsToString({
          background: 'rgba(0,0,0,0.5)',
          bottom: 0,
          left: 0,
          position: 'fixed',
          right: 0,
          top: 0
        })
      });

      var iframe = createElement(this._window, 'iframe', {
        id: 'fxa',
        src: src,
        width: '600',
        height: '400',
        allowtransparency: 'true',
        border: '0',
        style: cssPropsToString({
          background: 'transparent',
          border: 'none',
          display: 'block',
          height: '600px',
          margin: '0 auto 0 auto',
          position: 'relative',
          top: '10%',
          width: '400px'
        })
      });

      background.appendChild(iframe);
      this._window.document.body.appendChild(background);

      this._iframe = iframe;
      this._contentWindow = iframe.contentWindow;
    },

    getContentElement: function () {
      return this._iframe;
    },

    getContentWindow: function () {
      return this._contentWindow;
    },

    isLoaded: function () {
      return !! this._backgroundEl;
    },

    unload: function () {
      if (this._backgroundEl) {
        this._window.document.body.removeChild(this._backgroundEl);
        delete this._backgroundEl;
        delete this._iframe;
      }
    }
  };

  return Lightbox;
});


/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define('client/auth/lightbox/iframe_channel',[
  'p-promise',
  'client/lib/object'
], function (p, ObjectHelpers) {
  

  function IFrameChannel(options) {
    options = options || {};

    this._window = options.window;
    this._contentWindow = options.contentWindow;
    this._iframeHost = options.iframeHost;
  }

  IFrameChannel.prototype = {
    version: '0.0.0',

    attach: function () {
      this._boundOnMessage = onMessage.bind(this);
      this._window.addEventListener('message', this._boundOnMessage, false);

      this._deferred = p.defer();
      return this._deferred.promise;
    },

    detach: function () {
      this._window.removeEventListener('message', this._boundOnMessage, false);
    },

    send: function (command, data) {
      var dataToSend = ObjectHelpers.extend({ version: this.version }, data);
      var msg = stringifyFxAEvent(command, dataToSend);

      this._contentWindow.postMessage(msg, this._iframeHost);
    }
  };

  // commands that come from the iframe. They are called
  // in the Lightbox object context.
  var COMMANDS = {
    error: function (command, data) {
      this.detach();
      this._deferred.reject(data);
    },
    /*jshint camelcase:false*/
    ping: function (command, data) {
      // ping is used to get the RP's origin. If the RP's origin is not
      // whitelisted, it cannot be iframed.
      this.send(command, data);
    },
    ignore: function (command, data) {
      console.log('ignoring command: %s', command);
    },
    oauth_cancel: function (command, data) {
      this.detach();
      return this._deferred.reject({ reason: 'cancel' });
    },
    oauth_complete: function (command, data) {
      this.detach();
      this._deferred.resolve(data);
    }
  };

  function onMessage(event) {
    /*jshint validthis: true*/
    if (event.origin !== this._iframeHost) {
      return;
    }

    var parsed = parseFxAEvent(event.data);
    var command = parsed.command;
    var data = parsed.data;

    var handler = COMMANDS[command] || COMMANDS.ignore;
    handler.call(this, command, data);
  }

  function parseFxAEvent(msg) {
    var components = msg.split('!!!');
    return {
      command: components[0],
      data: JSON.parse(components[1] || '{}')
    };
  }

  function stringifyFxAEvent(command, data) {
    return command + '!!!' + JSON.stringify(data || '');
  }

  IFrameChannel.stringifyFxAEvent = stringifyFxAEvent;
  IFrameChannel.parseFxAEvent = parseFxAEvent;

  return IFrameChannel;
});



/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*globals define*/

define('client/auth/lightbox/api',[
  'p-promise',
  'client/lib/object',
  'client/lib/options',
  '../api',
  './lightbox',
  './iframe_channel'
], function (p, ObjectHelpers, Options, AuthenticationAPI, Lightbox, IFrameChannel) {
  

  function getLightbox() {
    //jshint validthis: true
    var self = this;
    if (self._lightbox) {
      return self._lightbox;
    }

    self._lightbox = new Lightbox({
      window: self._window
    });

    return self._lightbox;
  }

  function openLightbox(fxaUrl) {
    /*jshint validthis: true*/
    var self = this;
    return p().then(function() {
      if (self._lightbox && self._lightbox.isLoaded()) {
        throw new Error('lightbox already open');
      }

      var lightbox = getLightbox.call(self);

      lightbox.load(fxaUrl);

      return lightbox;
    });
  }

  function getChannel(lightbox) {
    //jshint validthis: true
    var self = this;
    if (self._channel) {
      return self._channel;
    }

    self._channel = new IFrameChannel({
      iframeHost: self._fxaHost,
      contentWindow: lightbox.getContentWindow(),
      window: self._window
    });

    return self._channel;
  }

  function waitForAuthentication(lightbox) {
    /*jshint validthis: true*/
    var self = this;
    return p().then(function () {
      var channel = getChannel.call(self, lightbox);
      return channel.attach();
    });
  }

  /**
   * Authenticate users with a lightbox
   *
   * @class LightboxAPI
   * @extends AuthenticationAPI
   * @constructor
   */
  function LightboxAPI(clientId, options) {
    AuthenticationAPI.call(this, clientId, options);

    options = options || {};
    this._lightbox = options.lightbox;
    this._channel = options.channel;
  }
  LightboxAPI.prototype = Object.create(AuthenticationAPI.prototype);

  ObjectHelpers.extend(LightboxAPI.prototype, {
    openFxa: function (fxaUrl) {
      /*jshint validthis: true*/
      var self = this;

      return openLightbox.call(self, fxaUrl)
        .then(function (lightbox) {
          return waitForAuthentication.call(self, lightbox);
        })
        .then(function (result) {
          self.unload();
          return result;
        }, function (err) {
          self.unload();
          throw err;
        });
    },

    /**
     * Unload the lightbox
     *
     * @method unload
     */
    unload: function () {
      var self = this;
      return p().then(function () {
        if (! self._lightbox) {
          throw new Error('lightbox not open');
        }

        self._lightbox.unload();
        self._channel.detach();
      });
    }
  });

  return LightboxAPI;
});


/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define('client/auth/redirect/api',[
  '../api',
  'client/lib/constants',
  'client/lib/options',
  'client/lib/object'
], function (AuthenticationAPI, Constants, Options, ObjectHelpers) {
  

  /**
   * Authenticate a user with the redirect flow.
   *
   * @class RedirectAPI
   * @extends AuthenticationAPI
   * @constructor
   */
  function RedirectAPI(clientId, options) {
    AuthenticationAPI.call(this, clientId, options);
  }

  RedirectAPI.prototype = Object.create(AuthenticationAPI.prototype);
  ObjectHelpers.extend(RedirectAPI.prototype, {
    openFxa: function (fxaUrl) {
      this._window.location.href = fxaUrl;
    }
  });

  return RedirectAPI;
});


/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define('client/FxaRelierClient',[
  'p-promise',
  'client/auth/lightbox/api',
  'client/auth/redirect/api'
], function (p, LightboxUI, RedirectUI) {
  

  var UIs = {
    'default': RedirectUI,
    lightbox: LightboxUI,
    redirect: RedirectUI
  };

  function getUI(context, ui, clientId, options) {
    if (context._ui) {
      throw new Error('Firefox Accounts is already open');
    }

    if (typeof ui === 'object') {
      // allow a UI to be passed in for testing.
      context._ui = ui;
    } else {
      ui = ui || 'default';
      var UI = UIs[ui];

      if (! UI) {
        throw new Error('Invalid ui: ' + ui);
      }

      context._ui = new UI(clientId, options);
    }

    return context._ui;
  }


  /**
   * @class FxaRelierClient
   * @constructor
   * @param {string} clientId - the OAuth client ID for the relier
   * @param {Object} [options={}] - configuration
   *   @param {String} [options.fxaHost]
   *   Firefox Accounts Content Server host
   *   @param {Object} [options.window]
   *   window override, used for unit tests
   *   @param {Object} [options.lightbox]
   *   lightbox override, used for unit tests
   *   @param {Object} [options.channel]
   *   channel override, used for unit tests
   */
  function FxaRelierClient(clientId, options) {
    if (! clientId) {
      throw new Error('clientId is required');
    }

    this.auth = {
      /**
       * Sign in an existing user
       *
       * @method signIn
       * @param {Object} config - configuration
       *   @param {String} config.state
       *   CSRF/State token
       *   @param {String} config.redirect_uri
       *   URI to redirect to when complete
       *   @param {String} config.scope
       *   OAuth scope
       *   @param {String} [config.force_email]
       *   Force the user to sign in with the given email
       *   @param {String} [config.ui]
       *   UI to present - `lightbox` or `redirect` - defaults to `redirect`
       */
      signIn: function (config) {
        var self = this;
        return p().then(function () {
          config = config || {};

          var api = getUI(self, config.ui, clientId, options);
          return api.signIn(config)
            .fin(function () {
              delete self._ui;
            });
        });
      },

      /**
       * Sign up a new user
       *
       * @method signUp
       * @param {Object} config - configuration
       *   @param {String} config.state
       *   CSRF/State token
       *   @param {String} config.redirect_uri
       *   URI to redirect to when complete
       *   @param {String} config.scope
       *   OAuth scope
       *   @param {String} [config.ui]
       *   UI to present - `lightbox` or `redirect` - defaults to `redirect`
       */
      signUp: function (config) {
        var self = this;
        return p().then(function () {
          config = config || {};

          var api = getUI(self, config.ui, clientId, options);
          return api.signUp(config)
            .fin(function () {
              delete self._ui;
            });
        });
      }
    };
  }

  FxaRelierClient.prototype = {
    /**
     * FxaRelierClient version
     *
     * @property version
     * @type {String}
     */
    version: '0.0.0'
  };

  return FxaRelierClient;
});


    //The modules for your project will be inlined above
    //this snippet. Ask almond to synchronously require the
    //module value for 'main' here and return it as the
    //value to use for the public API for the built file.
    return requirejs('client/FxaRelierClient');
}));

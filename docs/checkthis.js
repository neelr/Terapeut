// This is from dialogflow (edited)
var $jscomp = $jscomp || {};
$jscomp.scope = {};
$jscomp.ASSUME_ES5 = !1;
$jscomp.ASSUME_NO_NATIVE_MAP = !1;
$jscomp.ASSUME_NO_NATIVE_SET = !1;
$jscomp.SIMPLE_FROUND_POLYFILL = !1;
$jscomp.defineProperty = $jscomp.ASSUME_ES5 || "function" == typeof Object.defineProperties ? Object.defineProperty : function(a, b, c) {
    a != Array.prototype && a != Object.prototype && (a[b] = c.value)
};
$jscomp.getGlobal = function(a) {
    return "undefined" != typeof window && window === a ? a : "undefined" != typeof global && null != global ? global : a
};
$jscomp.global = $jscomp.getGlobal(this);
$jscomp.polyfill = function(a, b) {
    if (b) {
        var c = $jscomp.global;
        a = a.split(".");
        for (var d = 0; d < a.length - 1; d++) {
            var f = a[d];
            f in c || (c[f] = {});
            c = c[f]
        }
        a = a[a.length - 1];
        d = c[a];
        b = b(d);
        b != d && null != b && $jscomp.defineProperty(c, a, {
            configurable: !0,
            writable: !0,
            value: b
        })
    }
};
$jscomp.underscoreProtoCanBeSet = function() {
    var a = {
            a: !0
        },
        b = {};
    try {
        return b.__proto__ = a, b.a
    } catch (c) {}
    return !1
};
$jscomp.setPrototypeOf = "function" == typeof Object.setPrototypeOf ? Object.setPrototypeOf : $jscomp.underscoreProtoCanBeSet() ? function(a, b) {
    a.__proto__ = b;
    if (a.__proto__ !== b) throw new TypeError(a + " is not extensible");
    return a
} : null;
$jscomp.polyfill("Object.setPrototypeOf", function(a) {
    return a || $jscomp.setPrototypeOf
}, "es6", "es5");
$jscomp.owns = function(a, b) {
    return Object.prototype.hasOwnProperty.call(a, b)
};
$jscomp.assign = "function" == typeof Object.assign ? Object.assign : function(a, b) {
    for (var c = 1; c < arguments.length; c++) {
        var d = arguments[c];
        if (d)
            for (var f in d) $jscomp.owns(d, f) && (a[f] = d[f])
    }
    return a
};
$jscomp.polyfill("Object.assign", function(a) {
    return a || $jscomp.assign
}, "es6", "es3");
$jscomp.arrayIteratorImpl = function(a) {
    var b = 0;
    return function() {
        return b < a.length ? {
            done: !1,
            value: a[b++]
        } : {
            done: !0
        }
    }
};
$jscomp.arrayIterator = function(a) {
    return {
        next: $jscomp.arrayIteratorImpl(a)
    }
};
$jscomp.makeIterator = function(a) {
    var b = "undefined" != typeof Symbol && Symbol.iterator && a[Symbol.iterator];
    return b ? b.call(a) : $jscomp.arrayIterator(a)
};
$jscomp.FORCE_POLYFILL_PROMISE = !1;
$jscomp.polyfill("Promise", function(a) {
    function b() {
        this.batch_ = null
    }

    function c(e) {
        return e instanceof g ? e : new g(function(h) {
            h(e)
        })
    }
    if (a && !$jscomp.FORCE_POLYFILL_PROMISE) return a;
    b.prototype.asyncExecute = function(e) {
        if (null == this.batch_) {
            this.batch_ = [];
            var h = this;
            this.asyncExecuteFunction(function() {
                h.executeBatch_()
            })
        }
        this.batch_.push(e)
    };
    var d = $jscomp.global.setTimeout;
    b.prototype.asyncExecuteFunction = function(e) {
        d(e, 0)
    };
    b.prototype.executeBatch_ = function() {
        for (; this.batch_ && this.batch_.length;) {
            var e =
                this.batch_;
            this.batch_ = [];
            for (var h = 0; h < e.length; ++h) {
                var k = e[h];
                e[h] = null;
                try {
                    k()
                } catch (m) {
                    this.asyncThrow_(m)
                }
            }
        }
        this.batch_ = null
    };
    b.prototype.asyncThrow_ = function(e) {
        this.asyncExecuteFunction(function() {
            throw e;
        })
    };
    var f = {
            PENDING: 0,
            FULFILLED: 1,
            REJECTED: 2
        },
        g = function(e) {
            this.state_ = f.PENDING;
            this.result_ = void 0;
            this.onSettledCallbacks_ = [];
            var h = this.createResolveAndReject_();
            try {
                e(h.resolve, h.reject)
            } catch (k) {
                h.reject(k)
            }
        };
    g.prototype.createResolveAndReject_ = function() {
        function e(m) {
            return function(n) {
                k ||
                    (k = !0, m.call(h, n))
            }
        }
        var h = this,
            k = !1;
        return {
            resolve: e(this.resolveTo_),
            reject: e(this.reject_)
        }
    };
    g.prototype.resolveTo_ = function(e) {
        if (e === this) this.reject_(new TypeError("A Promise cannot resolve to itself"));
        else if (e instanceof g) this.settleSameAsPromise_(e);
        else {
            a: switch (typeof e) {
                case "object":
                    var h = null != e;
                    break a;
                case "function":
                    h = !0;
                    break a;
                default:
                    h = !1
            }
            h ? this.resolveToNonPromiseObj_(e) : this.fulfill_(e)
        }
    };
    g.prototype.resolveToNonPromiseObj_ = function(e) {
        var h = void 0;
        try {
            h = e.then
        } catch (k) {
            this.reject_(k);
            return
        }
        "function" == typeof h ? this.settleSameAsThenable_(h, e) : this.fulfill_(e)
    };
    g.prototype.reject_ = function(e) {
        this.settle_(f.REJECTED, e)
    };
    g.prototype.fulfill_ = function(e) {
        this.settle_(f.FULFILLED, e)
    };
    g.prototype.settle_ = function(e, h) {
        if (this.state_ != f.PENDING) throw Error("Cannot settle(" + e + ", " + h + "): Promise already settled in state" + this.state_);
        this.state_ = e;
        this.result_ = h;
        this.executeOnSettledCallbacks_()
    };
    g.prototype.executeOnSettledCallbacks_ = function() {
        if (null != this.onSettledCallbacks_) {
            for (var e =
                    0; e < this.onSettledCallbacks_.length; ++e) l.asyncExecute(this.onSettledCallbacks_[e]);
            this.onSettledCallbacks_ = null
        }
    };
    var l = new b;
    g.prototype.settleSameAsPromise_ = function(e) {
        var h = this.createResolveAndReject_();
        e.callWhenSettled_(h.resolve, h.reject)
    };
    g.prototype.settleSameAsThenable_ = function(e, h) {
        var k = this.createResolveAndReject_();
        try {
            e.call(h, k.resolve, k.reject)
        } catch (m) {
            k.reject(m)
        }
    };
    g.prototype.then = function(e, h) {
        function k(p, q) {
            return "function" == typeof p ? function(r) {
                    try {
                        m(p(r))
                    } catch (t) {
                        n(t)
                    }
                } :
                q
        }
        var m, n, u = new g(function(p, q) {
            m = p;
            n = q
        });
        this.callWhenSettled_(k(e, m), k(h, n));
        return u
    };
    g.prototype["catch"] = function(e) {
        return this.then(void 0, e)
    };
    g.prototype.callWhenSettled_ = function(e, h) {
        function k() {
            switch (m.state_) {
                case f.FULFILLED:
                    e(m.result_);
                    break;
                case f.REJECTED:
                    h(m.result_);
                    break;
                default:
                    throw Error("Unexpected state: " + m.state_);
            }
        }
        var m = this;
        null == this.onSettledCallbacks_ ? l.asyncExecute(k) : this.onSettledCallbacks_.push(k)
    };
    g.resolve = c;
    g.reject = function(e) {
        return new g(function(h, k) {
            k(e)
        })
    };
    g.race = function(e) {
        return new g(function(h, k) {
            for (var m = $jscomp.makeIterator(e), n = m.next(); !n.done; n = m.next()) c(n.value).callWhenSettled_(h, k)
        })
    };
    g.all = function(e) {
        var h = $jscomp.makeIterator(e),
            k = h.next();
        return k.done ? c([]) : new g(function(m, n) {
            function u(r) {
                return function(t) {
                    p[r] = t;
                    q--;
                    0 == q && m(p)
                }
            }
            var p = [],
                q = 0;
            do p.push(void 0), q++, c(k.value).callWhenSettled_(u(p.length - 1), n), k = h.next(); while (!k.done)
        })
    };
    return g
}, "es6", "es3");
var goog = goog || {};
goog.global = this;
goog.isDef = function(a) {
    return void 0 !== a
};
goog.isString = function(a) {
    return "string" == typeof a
};
goog.isBoolean = function(a) {
    return "boolean" == typeof a
};
goog.isNumber = function(a) {
    return "number" == typeof a
};
goog.exportPath_ = function(a, b, c) {
    a = a.split(".");
    c = c || goog.global;
    a[0] in c || "undefined" == typeof c.execScript || c.execScript("var " + a[0]);
    for (var d; a.length && (d = a.shift());) !a.length && goog.isDef(b) ? c[d] = b : c = c[d] && c[d] !== Object.prototype[d] ? c[d] : c[d] = {}
};
goog.define = function(a, b) {
    goog.exportPath_(a, b);
    return b
};
goog.DEBUG = !0;
goog.LOCALE = "en";
goog.TRUSTED_SITE = !0;
goog.STRICT_MODE_COMPATIBLE = !1;
goog.DISALLOW_TEST_ONLY_CODE = !goog.DEBUG;
goog.ENABLE_CHROME_APP_SAFE_SCRIPT_LOADING = !1;
goog.provide = function(a) {
    if (goog.isInModuleLoader_()) throw Error("goog.provide cannot be used within a module.");
    goog.constructNamespace_(a)
};
goog.constructNamespace_ = function(a, b) {
    goog.exportPath_(a, b)
};
goog.getScriptNonce = function(a) {
    if (a && a != goog.global) return goog.getScriptNonce_(a.document);
    null === goog.cspNonce_ && (goog.cspNonce_ = goog.getScriptNonce_(goog.global.document));
    return goog.cspNonce_
};
goog.NONCE_PATTERN_ = /^[\w+/_-]+[=]{0,2}$/;
goog.cspNonce_ = null;
goog.getScriptNonce_ = function(a) {
    return (a = a.querySelector && a.querySelector("script[nonce]")) && (a = a.nonce || a.getAttribute("nonce")) && goog.NONCE_PATTERN_.test(a) ? a : ""
};
goog.VALID_MODULE_RE_ = /^[a-zA-Z_$][a-zA-Z0-9._$]*$/;
goog.module = function(a) {
    if (!goog.isString(a) || !a || -1 == a.search(goog.VALID_MODULE_RE_)) throw Error("Invalid module identifier");
    if (!goog.isInGoogModuleLoader_()) throw Error("Module " + a + " has been loaded incorrectly. Note, modules cannot be loaded as normal scripts. They require some kind of pre-processing step. You're likely trying to load a module via a script tag or as a part of a concatenated bundle without rewriting the module. For more info see: https://github.com/google/closure-library/wiki/goog.module:-an-ES6-module-like-alternative-to-goog.provide.");
    if (goog.moduleLoaderState_.moduleName) throw Error("goog.module may only be called once per module.");
    goog.moduleLoaderState_.moduleName = a
};
goog.module.get = function() {
    return null
};
goog.module.getInternal_ = function() {
    return null
};
goog.ModuleType = {
    ES6: "es6",
    GOOG: "goog"
};
goog.moduleLoaderState_ = null;
goog.isInModuleLoader_ = function() {
    return goog.isInGoogModuleLoader_() || goog.isInEs6ModuleLoader_()
};
goog.isInGoogModuleLoader_ = function() {
    return !!goog.moduleLoaderState_ && goog.moduleLoaderState_.type == goog.ModuleType.GOOG
};
goog.isInEs6ModuleLoader_ = function() {
    var a = !!goog.moduleLoaderState_ && goog.moduleLoaderState_.type == goog.ModuleType.ES6;
    return a ? !0 : (a = goog.global.$jscomp) ? "function" != typeof a.getCurrentModulePath ? !1 : !!a.getCurrentModulePath() : !1
};
goog.module.declareLegacyNamespace = function() {
    goog.moduleLoaderState_.declareLegacyNamespace = !0
};
goog.declareModuleId = function(a) {
    if (goog.moduleLoaderState_) goog.moduleLoaderState_.moduleName = a;
    else {
        var b = goog.global.$jscomp;
        if (!b || "function" != typeof b.getCurrentModulePath) throw Error('Module with namespace "' + a + '" has been loaded incorrectly.');
        b = b.require(b.getCurrentModulePath());
        goog.loadedModules_[a] = {
            exports: b,
            type: goog.ModuleType.ES6,
            moduleId: a
        }
    }
};
goog.module.declareNamespace = goog.declareModuleId;
goog.setTestOnly = function(a) {
    if (goog.DISALLOW_TEST_ONLY_CODE) throw a = a || "", Error("Importing test-only code into non-debug environment" + (a ? ": " + a : "."));
};
goog.forwardDeclare = function() {};
goog.getObjectByName = function(a, b) {
    a = a.split(".");
    b = b || goog.global;
    for (var c = 0; c < a.length; c++)
        if (b = b[a[c]], !goog.isDefAndNotNull(b)) return null;
    return b
};
goog.globalize = function(a, b) {
    b = b || goog.global;
    for (var c in a) b[c] = a[c]
};
goog.addDependency = function() {};
goog.useStrictRequires = !1;
goog.ENABLE_DEBUG_LOADER = !0;
goog.logToConsole_ = function(a) {
    goog.global.console && goog.global.console.error(a)
};
goog.require = function() {};
goog.requireType = function() {
    return {}
};
goog.basePath = "";
goog.nullFunction = function() {};
goog.abstractMethod = function() {
    throw Error("unimplemented abstract method");
};
goog.addSingletonGetter = function(a) {
    a.instance_ = void 0;
    a.getInstance = function() {
        if (a.instance_) return a.instance_;
        goog.DEBUG && (goog.instantiatedSingletons_[goog.instantiatedSingletons_.length] = a);
        return a.instance_ = new a
    }
};
goog.instantiatedSingletons_ = [];
goog.LOAD_MODULE_USING_EVAL = !0;
goog.SEAL_MODULE_EXPORTS = goog.DEBUG;
goog.loadedModules_ = {};
goog.DEPENDENCIES_ENABLED = !1;
goog.TRANSPILE = "detect";
goog.ASSUME_ES_MODULES_TRANSPILED = !1;
goog.TRANSPILE_TO_LANGUAGE = "";
goog.TRANSPILER = "transpile.js";
goog.hasBadLetScoping = null;
goog.useSafari10Workaround = function() {
    if (null == goog.hasBadLetScoping) {
        try {
            var a = !eval('"use strict";let x = 1; function f() { return typeof x; };f() == "number";')
        } catch (b) {
            a = !1
        }
        goog.hasBadLetScoping = a
    }
    return goog.hasBadLetScoping
};
goog.workaroundSafari10EvalBug = function(a) {
    return "(function(){" + a + "\n;})();\n"
};
goog.loadModule = function(a) {
    var b = goog.moduleLoaderState_;
    try {
        goog.moduleLoaderState_ = {
            moduleName: "",
            declareLegacyNamespace: !1,
            type: goog.ModuleType.GOOG
        };
        if (goog.isFunction(a)) var c = a.call(void 0, {});
        else if (goog.isString(a)) goog.useSafari10Workaround() && (a = goog.workaroundSafari10EvalBug(a)), c = goog.loadModuleFromSource_.call(void 0, a);
        else throw Error("Invalid module definition");
        var d = goog.moduleLoaderState_.moduleName;
        if (goog.isString(d) && d) {
            goog.moduleLoaderState_.declareLegacyNamespace ? goog.constructNamespace_(d,
                c) : goog.SEAL_MODULE_EXPORTS && Object.seal && "object" == typeof c && null != c && Object.seal(c);
            var f = {
                exports: c,
                type: goog.ModuleType.GOOG,
                moduleId: goog.moduleLoaderState_.moduleName
            };
            goog.loadedModules_[d] = f
        } else throw Error('Invalid module name "' + d + '"');
    } finally {
        goog.moduleLoaderState_ = b
    }
};
goog.loadModuleFromSource_ = function(a) {
    var b = {};
    eval(a);
    return b
};
goog.normalizePath_ = function(a) {
    a = a.split("/");
    for (var b = 0; b < a.length;) "." == a[b] ? a.splice(b, 1) : b && ".." == a[b] && a[b - 1] && ".." != a[b - 1] ? a.splice(--b, 2) : b++;
    return a.join("/")
};
goog.loadFileSync_ = function(a) {
    if (goog.global.CLOSURE_LOAD_FILE_SYNC) return goog.global.CLOSURE_LOAD_FILE_SYNC(a);
    try {
        var b = new goog.global.XMLHttpRequest;
        b.open("get", a, !1);
        b.send();
        return 0 == b.status || 200 == b.status ? b.responseText : null
    } catch (c) {
        return null
    }
};
goog.transpile_ = function(a, b, c) {
    var d = goog.global.$jscomp;
    d || (goog.global.$jscomp = d = {});
    var f = d.transpile;
    if (!f) {
        var g = goog.basePath + goog.TRANSPILER,
            l = goog.loadFileSync_(g);
        if (l) {
            (function() {
                eval(l + "\n//# sourceURL=" + g)
            }).call(goog.global);
            if (goog.global.$gwtExport && goog.global.$gwtExport.$jscomp && !goog.global.$gwtExport.$jscomp.transpile) throw Error('The transpiler did not properly export the "transpile" method. $gwtExport: ' + JSON.stringify(goog.global.$gwtExport));
            goog.global.$jscomp.transpile =
                goog.global.$gwtExport.$jscomp.transpile;
            d = goog.global.$jscomp;
            f = d.transpile
        }
    }
    if (!f) {
        var e = " requires transpilation but no transpiler was found.";
        e += ' Please add "//javascript/closure:transpiler" as a data dependency to ensure it is included.';
        f = d.transpile = function(h, k) {
            goog.logToConsole_(k + e);
            return h
        }
    }
    return f(a, b, c)
};
goog.typeOf = function(a) {
    var b = typeof a;
    if ("object" == b)
        if (a) {
            if (a instanceof Array) return "array";
            if (a instanceof Object) return b;
            var c = Object.prototype.toString.call(a);
            if ("[object Window]" == c) return "object";
            if ("[object Array]" == c || "number" == typeof a.length && "undefined" != typeof a.splice && "undefined" != typeof a.propertyIsEnumerable && !a.propertyIsEnumerable("splice")) return "array";
            if ("[object Function]" == c || "undefined" != typeof a.call && "undefined" != typeof a.propertyIsEnumerable && !a.propertyIsEnumerable("call")) return "function"
        } else return "null";
    else if ("function" == b && "undefined" == typeof a.call) return "object";
    return b
};
goog.isNull = function(a) {
    return null === a
};
goog.isDefAndNotNull = function(a) {
    return null != a
};
goog.isArray = function(a) {
    return "array" == goog.typeOf(a)
};
goog.isArrayLike = function(a) {
    var b = goog.typeOf(a);
    return "array" == b || "object" == b && "number" == typeof a.length
};
goog.isDateLike = function(a) {
    return goog.isObject(a) && "function" == typeof a.getFullYear
};
goog.isFunction = function(a) {
    return "function" == goog.typeOf(a)
};
goog.isObject = function(a) {
    var b = typeof a;
    return "object" == b && null != a || "function" == b
};
goog.getUid = function(a) {
    return a[goog.UID_PROPERTY_] || (a[goog.UID_PROPERTY_] = ++goog.uidCounter_)
};
goog.hasUid = function(a) {
    return !!a[goog.UID_PROPERTY_]
};
goog.removeUid = function(a) {
    null !== a && "removeAttribute" in a && a.removeAttribute(goog.UID_PROPERTY_);
    try {
        delete a[goog.UID_PROPERTY_]
    } catch (b) {}
};
goog.UID_PROPERTY_ = "closure_uid_" + (1E9 * Math.random() >>> 0);
goog.uidCounter_ = 0;
goog.getHashCode = goog.getUid;
goog.removeHashCode = goog.removeUid;
goog.cloneObject = function(a) {
    var b = goog.typeOf(a);
    if ("object" == b || "array" == b) {
        if ("function" === typeof a.clone) return a.clone();
        b = "array" == b ? [] : {};
        for (var c in a) b[c] = goog.cloneObject(a[c]);
        return b
    }
    return a
};
goog.bindNative_ = function(a, b, c) {
    return a.call.apply(a.bind, arguments)
};
goog.bindJs_ = function(a, b, c) {
    if (!a) throw Error();
    if (2 < arguments.length) {
        var d = Array.prototype.slice.call(arguments, 2);
        return function() {
            var f = Array.prototype.slice.call(arguments);
            Array.prototype.unshift.apply(f, d);
            return a.apply(b, f)
        }
    }
    return function() {
        return a.apply(b, arguments)
    }
};
goog.bind = function(a, b, c) {
    Function.prototype.bind && -1 != Function.prototype.bind.toString().indexOf("native code") ? goog.bind = goog.bindNative_ : goog.bind = goog.bindJs_;
    return goog.bind.apply(null, arguments)
};
goog.partial = function(a, b) {
    var c = Array.prototype.slice.call(arguments, 1);
    return function() {
        var d = c.slice();
        d.push.apply(d, arguments);
        return a.apply(this, d)
    }
};
goog.mixin = function(a, b) {
    for (var c in b) a[c] = b[c]
};
goog.now = goog.TRUSTED_SITE && Date.now || function() {
    return +new Date
};
goog.globalEval = function(a) {
    if (goog.global.execScript) goog.global.execScript(a, "JavaScript");
    else if (goog.global.eval) {
        if (null == goog.evalWorksForGlobals_) {
            try {
                goog.global.eval("var _evalTest_ = 1;")
            } catch (d) {}
            if ("undefined" != typeof goog.global._evalTest_) {
                try {
                    delete goog.global._evalTest_
                } catch (d) {}
                goog.evalWorksForGlobals_ = !0
            } else goog.evalWorksForGlobals_ = !1
        }
        if (goog.evalWorksForGlobals_) goog.global.eval(a);
        else {
            var b = goog.global.document,
                c = b.createElement("SCRIPT");
            c.type = "text/javascript";
            c.defer = !1;
            c.appendChild(b.createTextNode(a));
            b.head.appendChild(c);
            b.head.removeChild(c)
        }
    } else throw Error("goog.globalEval not available");
};
goog.evalWorksForGlobals_ = null;
goog.getCssName = function(a, b) {
    if ("." == String(a).charAt(0)) throw Error('className passed in goog.getCssName must not start with ".". You passed: ' + a);
    var c = function(f) {
            return goog.cssNameMapping_[f] || f
        },
        d = function(f) {
            f = f.split("-");
            for (var g = [], l = 0; l < f.length; l++) g.push(c(f[l]));
            return g.join("-")
        };
    d = goog.cssNameMapping_ ? "BY_WHOLE" == goog.cssNameMappingStyle_ ? c : d : function(f) {
        return f
    };
    a = b ? a + "-" + d(b) : d(a);
    return goog.global.CLOSURE_CSS_NAME_MAP_FN ? goog.global.CLOSURE_CSS_NAME_MAP_FN(a) : a
};
goog.setCssNameMapping = function(a, b) {
    goog.cssNameMapping_ = a;
    goog.cssNameMappingStyle_ = b
};
goog.getMsg = function(a, b) {
    b && (a = a.replace(/\{\$([^}]+)}/g, function(c, d) {
        return null != b && d in b ? b[d] : c
    }));
    return a
};
goog.getMsgWithFallback = function(a) {
    return a
};
goog.exportSymbol = function(a, b, c) {
    goog.exportPath_(a, b, c)
};
goog.exportProperty = function(a, b, c) {
    a[b] = c
};
goog.inherits = function(a, b) {
    function c() {}
    c.prototype = b.prototype;
    a.superClass_ = b.prototype;
    a.prototype = new c;
    a.prototype.constructor = a;
    a.base = function(d, f, g) {
        for (var l = Array(arguments.length - 2), e = 2; e < arguments.length; e++) l[e - 2] = arguments[e];
        return b.prototype[f].apply(d, l)
    }
};
goog.base = function(a, b, c) {
    var d = arguments.callee.caller;
    if (goog.STRICT_MODE_COMPATIBLE || goog.DEBUG && !d) throw Error("arguments.caller not defined.  goog.base() cannot be used with strict mode code. See http://www.ecma-international.org/ecma-262/5.1/#sec-C");
    if ("undefined" !== typeof d.superClass_) {
        for (var f = Array(arguments.length - 1), g = 1; g < arguments.length; g++) f[g - 1] = arguments[g];
        return d.superClass_.constructor.apply(a, f)
    }
    if ("string" != typeof b && "symbol" != typeof b) throw Error("method names provided to goog.base must be a string or a symbol");
    f = Array(arguments.length - 2);
    for (g = 2; g < arguments.length; g++) f[g - 2] = arguments[g];
    g = !1;
    for (var l = a.constructor; l; l = l.superClass_ && l.superClass_.constructor)
        if (l.prototype[b] === d) g = !0;
        else if (g) return l.prototype[b].apply(a, f);
    if (a[b] === d) return a.constructor.prototype[b].apply(a, f);
    throw Error("goog.base called from a method of one name to a method of a different name");
};
goog.scope = function(a) {
    if (goog.isInModuleLoader_()) throw Error("goog.scope is not supported within a module.");
    a.call(goog.global)
};
goog.defineClass = function(a, b) {
    var c = b.constructor,
        d = b.statics;
    c && c != Object.prototype.constructor || (c = function() {
        throw Error("cannot instantiate an interface (no constructor defined).");
    });
    c = goog.defineClass.createSealingConstructor_(c, a);
    a && goog.inherits(c, a);
    delete b.constructor;
    delete b.statics;
    goog.defineClass.applyProperties_(c.prototype, b);
    null != d && (d instanceof Function ? d(c) : goog.defineClass.applyProperties_(c, d));
    return c
};
goog.defineClass.SEAL_CLASS_INSTANCES = goog.DEBUG;
goog.defineClass.createSealingConstructor_ = function(a, b) {
    if (!goog.defineClass.SEAL_CLASS_INSTANCES) return a;
    var c = !goog.defineClass.isUnsealable_(b),
        d = function() {
            var f = a.apply(this, arguments) || this;
            f[goog.UID_PROPERTY_] = f[goog.UID_PROPERTY_];
            this.constructor === d && c && Object.seal instanceof Function && Object.seal(f);
            return f
        };
    return d
};
goog.defineClass.isUnsealable_ = function(a) {
    return a && a.prototype && a.prototype[goog.UNSEALABLE_CONSTRUCTOR_PROPERTY_]
};
goog.defineClass.OBJECT_PROTOTYPE_FIELDS_ = "constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");
goog.defineClass.applyProperties_ = function(a, b) {
    for (var c in b) Object.prototype.hasOwnProperty.call(b, c) && (a[c] = b[c]);
    for (var d = 0; d < goog.defineClass.OBJECT_PROTOTYPE_FIELDS_.length; d++) c = goog.defineClass.OBJECT_PROTOTYPE_FIELDS_[d], Object.prototype.hasOwnProperty.call(b, c) && (a[c] = b[c])
};
goog.tagUnsealableClass = function() {};
goog.UNSEALABLE_CONSTRUCTOR_PROPERTY_ = "goog_defineClass_legacy_unsealable";
goog.TRUSTED_TYPES_POLICY_NAME = "";
goog.identity_ = function(a) {
    return a
};
goog.createTrustedTypesPolicy = function(a) {
    return "undefined" !== typeof TrustedTypes && TrustedTypes.createPolicy ? TrustedTypes.createPolicy(a, {
        createHTML: goog.identity_,
        createScript: goog.identity_,
        createScriptURL: goog.identity_,
        createURL: goog.identity_
    }) : null
};
goog.TRUSTED_TYPES_POLICY_ = goog.TRUSTED_TYPES_POLICY_NAME ? goog.createTrustedTypesPolicy(goog.TRUSTED_TYPES_POLICY_NAME + "#base") : null;
/*
 Copyright (c) Microsoft Corporation. All rights reserved.
 Licensed under the Apache License, Version 2.0 (the "License"); you may not use
 this file except in compliance with the License. You may obtain a copy of the
 License at http://www.apache.org/licenses/LICENSE-2.0

 THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
 WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
 MERCHANTABLITY OR NON-INFRINGEMENT.

 See the Apache Version 2.0 License for specific language governing permissions
 and limitations under the License.
*/
var module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$DomHelper_DomHelper = function() {
    this.workplace = document;
    this.body = document.body;
    this.queryInput = this.workplace.getElementById(module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$DomHelper_DomHelper.QUERY_INPUT_ID);
    this.queryResult = this.workplace.getElementById(module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$DomHelper_DomHelper.QUERY_RESULT_ID);
    this.queryResultWrapper = this.workplace.getElementById(module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$DomHelper_DomHelper.QUERY_RESULT_WRAPPER_ID);
    this.mic = this.workplace.getElementById(module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$DomHelper_DomHelper.QUERY_MIC_ID);
    this.preloader = this.workplace.getElementById(module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$DomHelper_DomHelper.PRELOADER_ID);
    this.agentAvatar = this.workplace.getElementById(module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$DomHelper_DomHelper.ID_AGENT_AVATAR_IMAGE)
};
module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$DomHelper_DomHelper.showNode = function(a) {
    a.style.display = "block"
};
module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$DomHelper_DomHelper.escapeString = function(a) {
    return a && a.toString() ? a.toString().replace(/&/g, "&amp").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;").replace(/\//g, "&#x2F;") : a
};
module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$DomHelper_DomHelper.prototype.checkAvatar = function() {
    "" === window.AGENT_AVATAR_ID && (this.agentAvatar.src = module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$DomHelper_DomHelper.DEFAULT_AVATAR_SRC)
};
module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$DomHelper_DomHelper.prototype.hidePreloader = function() {
    var a = this;
    setTimeout(function() {
        return a.preloader.style.opacity = "0"
    }, 200);
    setTimeout(function() {
        return a.preloader.style.display = "none"
    }, 500)
};
module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$DomHelper_DomHelper.prototype.setInputValue = function(a) {
    this.queryInput.value = a;
    return this
};
module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$DomHelper_DomHelper.prototype.addUserRequestNode = function(a) {
    var b = this.workplace.createElement("div");
    b.className = module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$DomHelper_DomHelper.CLASS_USER_REQUEST;
    b.innerHTML = a;
    this.queryResult.appendChild(b);
    return this
};
module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$DomHelper_DomHelper.prototype.generateEmptyServerResponseNode = function() {
    var a = this.workplace.createElement("div");
    a.className = module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$DomHelper_DomHelper.CLASS_SERVER_RESPONSE;
    a.innerHTML = module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$DomHelper_DomHelper.DEFAULT_EMPTY_NODE_CONTENT;
    this.queryResult.appendChild(a);
    return a
};
module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$DomHelper_DomHelper.prototype.setErrorOnNode = function(a, b) {
    b.innerHTML = a;
    b.className += " " + module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$DomHelper_DomHelper.CLASS_SERVER_RESPONSE_ERROR;
    return b
};
module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$DomHelper_DomHelper.prototype.setContentOnNode = function(a, b) {
    b.innerHTML = a;
    return this
};
module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$DomHelper_DomHelper.prototype.scrollResultWrapperNodeToBottom = function() {
    this.queryResultWrapper.scrollTop = this.queryResultWrapper.scrollHeight;
    return this
};
module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$DomHelper_DomHelper.prototype.handleStartRecognition = function() {
    this.mic.className += " " + module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$DomHelper_DomHelper.CLASS_MIC_ACTIVE;
    return this
};
module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$DomHelper_DomHelper.prototype.handleStopRecognition = function() {
    var a = new RegExp("(?:^|\\s)" + module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$DomHelper_DomHelper.CLASS_MIC_ACTIVE + "(?!\\S)", "gi");
    this.mic.className = this.mic.className.replace(a, "");
    return this
};
module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$DomHelper_DomHelper.QUERY_INPUT_ID = "query";
module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$DomHelper_DomHelper.QUERY_RESULT_ID = "result";
module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$DomHelper_DomHelper.QUERY_RESULT_WRAPPER_ID = "resultWrapper";
module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$DomHelper_DomHelper.QUERY_MIC_ID = "mic";
module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$DomHelper_DomHelper.PRELOADER_ID = "preloader";
module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$DomHelper_DomHelper.CLASS_USER_REQUEST = "user-request";
module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$DomHelper_DomHelper.CLASS_SERVER_RESPONSE = "server-response";
module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$DomHelper_DomHelper.CLASS_SERVER_RESPONSE_ERROR = "server-response-error";
module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$DomHelper_DomHelper.ID_AGENT_AVATAR_IMAGE = "agent-avatar";
module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$DomHelper_DomHelper.CLASS_MIC_ACTIVE = "active";
module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$DomHelper_DomHelper.DEFAULT_EMPTY_NODE_CONTENT = "...";
module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$DomHelper_DomHelper.DEFAULT_AVATAR_SRC = "https://www.gstatic.com/dialogflow-console/common/assets/img/logo-short.png";
var module$exports$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$XhrRequest = {},
    module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$XhrRequest_XhrRequest = function() {};
module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$XhrRequest_XhrRequest.ajax = function(a, b, c, d) {
    c = void 0 === c ? null : c;
    d = void 0 === d ? null : d;
    return new Promise(function(f, g) {
        var l = module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$XhrRequest_XhrRequest.createXMLHTTPObject(),
            e = b,
            h = null;
        if (c && a === module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$XhrRequest_XhrRequest.Method.GET) {
            e += "?";
            var k = 0,
                m;
            for (m in c) c.hasOwnProperty(m) &&
                (k++ && (e += "&"), e += encodeURIComponent(m) + "=" + encodeURIComponent(c[m]))
        } else c && (d || (d = {}), d["Content-Type"] = "application/json", h = JSON.stringify(c));
        l.open(a, e);
        if (d)
            for (var n in d) d.hasOwnProperty(n) && l.setRequestHeader(n, d[n]);
        h ? l.send(h) : l.send();
        l.onload = function() {
            200 <= l.status && 300 > l.status ? f(l) : g(l)
        };
        l.onerror = function() {
            g(l)
        }
    })
};
module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$XhrRequest_XhrRequest.get = function(a, b, c) {
    b = void 0 === b ? null : b;
    c = void 0 === c ? null : c;
    return module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$XhrRequest_XhrRequest.ajax(module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$XhrRequest_XhrRequest.Method.GET, a, b, c)
};
module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$XhrRequest_XhrRequest.post = function(a, b, c) {
    b = void 0 === b ? null : b;
    c = void 0 === c ? null : c;
    return module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$XhrRequest_XhrRequest.ajax(module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$XhrRequest_XhrRequest.Method.POST, a, b, c)
};
module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$XhrRequest_XhrRequest.put = function(a, b, c) {
    b = void 0 === b ? null : b;
    c = void 0 === c ? null : c;
    return module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$XhrRequest_XhrRequest.ajax(module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$XhrRequest_XhrRequest.Method.PUT, a, b, c)
};
module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$XhrRequest_XhrRequest["delete"] = function(a, b, c) {
    b = void 0 === b ? null : b;
    c = void 0 === c ? null : c;
    return module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$XhrRequest_XhrRequest.ajax(module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$XhrRequest_XhrRequest.Method.DELETE, a, b, c)
};
module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$XhrRequest_XhrRequest.createXMLHTTPObject = function() {
    for (var a = null, b = 0; b < module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$XhrRequest_XhrRequest.XMLHttpFactories.length; b++)
        if (module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$XhrRequest_XhrRequest.XMLHttpFactories.hasOwnProperty(b)) {
            try {
                a = module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$XhrRequest_XhrRequest.XMLHttpFactories[b]()
            } catch (c) {
                continue
            }
            break
        } return a
};
module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$XhrRequest_XhrRequest.XMLHttpFactories = [function() {
    return new XMLHttpRequest
}, function() {
    return new ActiveXObject("Msxml2.XMLHTTP")
}, function() {
    return new ActiveXObject("Msxml3.XMLHTTP")
}, function() {
    return new ActiveXObject("Microsoft.XMLHTTP")
}];
module$exports$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$XhrRequest.XhrRequest = module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$XhrRequest_XhrRequest;
var XhrRequest$jscomp$inline_9 = module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$XhrRequest_XhrRequest = module$exports$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$XhrRequest.XhrRequest || (module$exports$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$XhrRequest.XhrRequest = {}),
    Method$jscomp$inline_10 = XhrRequest$jscomp$inline_9.Method || (XhrRequest$jscomp$inline_9.Method = {});
Method$jscomp$inline_10.GET = "GET";
Method$jscomp$inline_10.POST = "POST";
Method$jscomp$inline_10.PUT = "PUT";
Method$jscomp$inline_10.DELETE = "DELETE";
var module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$App_App = function(a) {
    var b = this;
    this.domHelper = a;
    this.handleMicClick = function() {
        b.isRecognizing ? b.recognition.stop() : b.recognition.start()
    };
    this.hanleInputKeyDown = function(c) {
        c.keyCode === module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$App_App.KEY_CODES.ENTER && (c.preventDefault(), c.stopPropagation(), b.handleInput())
    };
    this.handleInput = function() {
        var settings = {
            "async": true,
            "crossDomain": true,
            "url": "https://hasura-10910.herokuapp.com/v1alpha1/graphql",
            "method": "POST",
            "headers": {
              "origin": "https://hasura-10910.herokuapp.com",
              "accept-encoding": "gzip, deflate, br",
              "accept-language": "en-US,en;q=0.9,la;q=0.8",
              "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36",
              "content-type": "application/json",
              "accept": "*/*",
              "referer": "https://hasura-10910.herokuapp.com/console/api-explorer",
              "connection": "keep-alive",
              "cache-control": "no-cache",
            },
            "data": "{\"query\":\"mutation {\\n  update_terapeut(_inc: {tesxtsent: 1}, where: {tesxtsent: {}}) {\\n    returning {\\n      tesxtsent\\n    }\\n  }\\n}\\n\",\"variables\":null}"
          }
          
          $.ajax(settings).done(function (response) {
            document.getElementById('texts').innerHTML = response.data.update_terapeut.returning[0].tesxtsent
          });
        var c = b.domHelper.queryInput.value;
        "" !== c.replace(/\s/g, "") && (b.domHelper.addUserRequestNode(module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$DomHelper_DomHelper.escapeString(c)), c = b.domHelper.generateEmptyServerResponseNode(), c = b.generateCallbacksForNode(c), module$exports$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$XhrRequest.XhrRequest.get(module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$App_App.API_URL, b.buildPayLoad(b.domHelper.queryInput.value)).then(c.success,
            c.error), b.domHelper.setInputValue("").scrollResultWrapperNodeToBottom())
    };
    this.sessionId = this.guid()!1);
    "webkitSpeechRecognition" in window && (this.initRecognition(), module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$DomHelper_DomHelper.showNode(this.domHelper.mic), this.domHelper.mic.addEventListener("click", this.handleMicClick, !1));
    this.domHelper.checkAvatar();
    this.domHelper.hidePreloader()
};
module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$App_App.prototype.bindEventHandlers = function() {
    this.domHelper.queryInput.addEventListener("keydown", this.hanleInputKeyDown, 
};
module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$App_App.prototype.initRecognition = function() {
    var a = this,
        b = new webkitSpeechRecognition;
    b.onstart = function() {
        a.isRecognizing = !0;
        a.domHelper.handleStartRecognition()
    };
    b.onerror = function() {};
    b.onend = function() {
        a.domHelper.handleStopRecognition();
        a.isRecognizing = !1
    };
    b.onresult = function(c) {
        for (var d = "", f = c.resultIndex; f < c.results.length; ++f) c.results[f].isFinal && (d += c.results[f][0].transcript);
        a.domHelper.setInputValue(d);
        a.handleInput()
    };
    b.lang = window.AGENT_LANGUAGE || "en-US";
    this.recognition = b
};
module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$App_App.prototype.buildPayLoad = function(a) {
    return {
        q: encodeURI(a),
        sessionId: encodeURI(this.sessionId)
    }
};
module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$App_App.prototype.handleResponse = function(a, b) {
    var c = a.response ? a.response : a.responseText;
    a = null;
    try {
        a = JSON.parse(c)
    } catch (d) {
        return this.handleError(a, b)
    }
    if (!(a.status && a.status.code && a.status.code === module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$App_App.HTTP_STATUS.OK && a.result && a.result)) return this.handleError(a, b);
    c = this.getSpeech(a.result);
    a.audioDataUri && (c += '<audio hidden id="audio-' +
        a.id + '" src="' + a.audioDataUri + '"></audio>&nbsp;&nbsp;<i class="fa fa-volume-up" style="cursor: pointer;" onclick="document.getElementById(\'audio-' + a.id + "').play()\"></i>");
    this.domHelper.setContentOnNode(c, b).scrollResultWrapperNodeToBottom()
};
module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$App_App.prototype.generateCallbacksForNode = function(a) {
    var b = this;
    return {
        success: function(c) {
            b.handleResponse(c, a)
        },
        error: function(c) {
            b.handleResponse(c, a)
        }
    }
};
module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$App_App.prototype.getSpeech = function(a) {
    a = a.speech || (a.fulfillment ? a.fulfillment.speech : module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$App_App.DEFAULT_NO_ANSWER);
    a || (a = module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$App_App.DEFAULT_NO_ANSWER);
    return module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$DomHelper_DomHelper.escapeString(a)
};
module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$App_App.prototype.handleError = function(a, b) {
    a = a && a.status && a.status.errorDetails ? a.status.errorDetails : module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$App_App.DEFAULT_ERROR;
    this.domHelper.setErrorOnNode(a, b)
};
module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$App_App.prototype.guid = function() {
    var a = function() {
        return Math.floor(65536 * (1 + Math.random())).toString(16).substring(1)
    };
    return a() + a() + "-" + a() + "-" + a() + "-" + a() + "-" + a() + a() + a()
};
module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$App_App.API_URL = "https://console.dialogflow.com/api-client/demo/embedded/ae4eb7a2-75ce-4a86-b2dd-3f7142b943fc" + "/demoQuery";
module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$App_App.DEFAULT_ERROR = "Sorry, it seemed like there was an error during request.";
module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$App_App.DEFAULT_NO_ANSWER = "[empty response]";
module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$App_App.HTTP_STATUS = {
    OK: 200
};
module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$App_App.KEY_CODES = {
    ENTER: 13
};
window.addStyleString('body {\n  margin: 0;\n  background: white;\n}\naudio {\n  -webkit-transition: all 0.5s linear;\n  -moz-transition: all 0.5s linear;\n  -o-transition: all 0.5s linear;\n  transition: all 0.5s linear;\n  -moz-box-shadow: 2px 2px 4px 0px #006773;\n  -webkit-box-shadow: 2px 2px 4px 0px #006773;\n  box-shadow: 2px 2px 4px 0px #006773;\n  -moz-border-radius: 7px 7px 7px 7px;\n  -webkit-border-radius: 7px 7px 7px 7px ;\n  border-radius: 7px 7px 7px 7px;\n  float: right;\n  margin-right: 15px;\n}\nform {\n  margin: 0;\n}\n.b-agent-demo {\n  font-family: "Roboto", "Helvetica Neue", Helvetica, Arial, sans-serif;\n  font-weight: 300;\n  width: 100%;\n  height: auto;\n  color: #2b313f;\n  font-size: 12px;\n  overflow: hidden;\n  position: absolute;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  right: 0;\n}\n.b-agent-demo .user-request,\n.b-agent-demo .server-response {\n  display: inline-block;\n  padding: 15px 25px;\n  border-radius: 3px;\n  border: 1px solid #eee;\n  margin-bottom: 5px;\n  font-size: 16px;\n  clear: both;\n}\n.b-agent-demo .user-request.server-response-error,\n.b-agent-demo .server-response.server-response-error {\n  background-color: #f76949;\n}\n.b-agent-demo .user-request {\n  background-color: #efefef;\n  float: left;\n  margin-right: 15px;\n  margin-top: 15px;\n  margin-left: 15px;\n}\n.b-agent-demo .server-response {\n  color: #ffffff;\n  background-color: #a5d175;\n  float: right;\n  margin-top: 15px;\n  margin-right: 15px;\n  margin-left: 15px;\n}\n.b-agent-demo .b-agent-demo_result {\n  overflow-y: auto;\n  background: white;\n  position: fixed;\n  top: 110px;\n  bottom: 55px;\n  width: 100%;\n}\n.b-agent-demo .b-agent-demo_result-table {\n  height: 100%;\n  min-height: 100%;\n  width: 100%;\n}\n.b-agent-demo .b-agent-demo_result-table td {\n  vertical-align: bottom;\n}\n.b-agent-demo .b-agent-demo_header {\n  min-height: 80px;\n  height: 80px;\n  overflow: hidden;\n  position: fixed;\n  top: 0;\n  width: 100%;\n  background-color: #2b303e;\n  display: table;\n}\n.b-agent-demo .b-agent-demo_header-wrapper {\n  display: table-cell;\n  vertical-align: middle;\n}\n.b-agent-demo .b-agent-demo_header-icon {\n  position: absolute;\n  top: 20px;\n  left: 20px;\n  width: 40px;\n  height: 40px;\n  border-radius: 100%;\n  /*background-color: @response-color;*/\n  overflow: hidden;\n  vertical-align: middle;\n  text-align: center;\n}\n.b-agent-demo .b-agent-demo_header-icon img {\n  max-height: 100%;\n  max-width: 100%;\n  width: auto;\n  height: auto;\n  position: absolute;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  border: 0;\n  margin: auto;\n}\n.b-agent-demo .b-agent-demo_header-agent-name {\n  padding-left: 80px;\n  font-size: 18px;\n  color: #ffffff;\n}\n.b-agent-demo .b-agent-demo_header-description {\n  color: #b7bbc4;\n  padding-left: 80px;\n  padding-top: 7px;\n  font-size: 12px;\n  display: block;\n  /* Fallback for non-webkit */\n  display: -webkit-box;\n  max-height: 24px;\n  /* Fallback for non-webkit */\n  margin: 0 auto;\n  line-height: 1;\n  -webkit-line-clamp: 2;\n  -webkit-box-orient: vertical;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.b-agent-demo .b-agent-demo_input {\n  position: fixed;\n  bottom: 0;\n  height: 55px;\n  border-top: 1px solid lightgray;\n  background-color: white;\n  width: 100%;\n}\n.b-agent-demo #agentDemoForm {\n  display: block;\n  margin-left: 15px;\n  margin-right: 55px;\n}\n.b-agent-demo #query {\n  width: 100%;\n  border: 0;\n  font-size: 16px;\n  font-weight: 300;\n  margin: 0;\n  height: 55px;\n}\n.b-agent-demo #query:focus {\n  outline: none;\n  outline-offset: 0;\n}\n.b-agent-demo .b-agent-demo_input-microphone {\n  display: none;\n  position: absolute;\n  font-size: 20px;\n  width: 54px;\n  height: 54px;\n  right: 0;\n  bottom: 0;\n  cursor: pointer;\n  text-align: center;\n  /* line-height: 30px; */\n  line-height: 54px;\n  background: white;\n  color: #b7bbc4;\n}\n.b-agent-demo .b-agent-demo_input-microphone.active {\n  color: #f76949;\n}\n.b-agent-demo .b-agent-demo_powered_by {\n  position: fixed;\n  left: 0;\n  right: 0;\n  top: 80px;\n  height: 30px;\n  background-color: #F8F8F8;\n  vertical-align: middle;\n}\n.b-agent-demo .b-agent-demo_powered_by span {\n  color: #b7bbc4;\n  text-transform: uppercase;\n  float: right;\n  vertical-align: middle;\n  line-height: 20px;\n  margin-top: 5px;\n  margin-right: 10px;\n  font-size: 10px;\n  margin-left: -10px;\n}\n.b-agent-demo .b-agent-demo_powered_by img {\n  margin-top: 7px;\n  height: 16px;\n  margin-right: 20px;\n  float: right;\n  vertical-align: middle;\n  border: 0;\n}\n.clearfix {\n  clear: both;\n}\n');
var module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$main_domHelper = new module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$DomHelper_DomHelper,
    module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$main_app = new module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$App_App(module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$main_domHelper);
module$contents$google3$third_party$apiai$ui$legacy$src$main$webapp$js$agentDemoApp$main_app.bindEventHandlers();
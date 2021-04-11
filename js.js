document.addEventListener("DOMContentLoaded", function() {
      var j = j || {};
j.scope = {};
j.arrayIteratorImpl = function(a) {
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
j.arrayIterator = function(a) {
    return {
        next: j.arrayIteratorImpl(a)
    }
};
j.makeIterator = function(a) {
    var b = "undefined" != typeof Symbol && Symbol.iterator && a[Symbol.iterator];
    return b ? b.call(a) : j.arrayIterator(a)
};
j.getGlobal = function(a) {
    return "undefined" != typeof window && window === a ? a : "undefined" != typeof global && null != global ? global : a
};
j.global = j.getGlobal(this);
j.ASSUME_ES5 = !1;
j.ASSUME_NO_NATIVE_MAP = !1;
j.ASSUME_NO_NATIVE_SET = !1;
j.SIMPLE_FROUND_POLYFILL = !1;
j.defineProperty = j.ASSUME_ES5 || "function" == typeof Object.defineProperties ? Object.defineProperty : function(a, b, c) {
    a != Array.prototype && a != Object.prototype && (a[b] = c.value)
};
j.polyfill = function(a, b, c, e) {
    if (b) {
        c = j.global;
        a = a.split(".");
        for (e = 0; e < a.length - 1; e++) {
            var d = a[e];
            d in c || (c[d] = {});
            c = c[d]
        }
        a = a[a.length - 1];
        e = c[a];
        b = b(e);
        b != e && null != b && j.defineProperty(c, a, {
            configurable: !0,
            writable: !0,
            value: b
        })
    }
};
j.FORCE_POLYFILL_PROMISE = !1;
j.polyfill("Promise", function(a) {
    function b() {
        this.batch_ = null
    }

    function c(a) {
        return a instanceof d ? a : new d(function(b, c) {
            b(a)
        })
    }
    if (a && !j.FORCE_POLYFILL_PROMISE) return a;
    b.prototype.asyncExecute = function(a) {
        if (null == this.batch_) {
            this.batch_ = [];
            var b = this;
            this.asyncExecuteFunction(function() {
                b.executeBatch_()
            })
        }
        this.batch_.push(a)
    };
    var e = j.global.setTimeout;
    b.prototype.asyncExecuteFunction = function(a) {
        e(a, 0)
    };
    b.prototype.executeBatch_ = function() {
        for (; this.batch_ && this.batch_.length;) {
            var a = this.batch_;
            this.batch_ = [];
            for (var b = 0; b < a.length; ++b) {
                var c = a[b];
                a[b] = null;
                try {
                    c()
                } catch (k) {
                    this.asyncThrow_(k)
                }
            }
        }
        this.batch_ = null
    };
    b.prototype.asyncThrow_ = function(a) {
        this.asyncExecuteFunction(function() {
            throw a
        })
    };
    var d = function(a) {
        this.state_ = 0;
        this.result_ = void 0;
        this.onSettledCallbacks_ = [];
        var b = this.createResolveAndReject_();
        try {
            a(b.resolve, b.reject)
        } catch (h) {
            b.reject(h)
        }
    };
    d.prototype.createResolveAndReject_ = function() {
        function a(a) {
            return function(d) {
                c || (c = !0, a.call(b, d))
            }
        }
        var b = this,
            c = !1;
        return {
            resolve: a(this.resolveTo_),
            reject: a(this.reject_)
        }
    };
    d.prototype.resolveTo_ = function(a) {
        if (a === this) this.reject_(new TypeError("A Promise cannot resolve to itself"));
        else if (a instanceof d) this.settleSameAsPromise_(a);
        else {
            a: switch (typeof a) {
                case "object":
                    var b = null != a;
                    break a;
                case "function":
                    b = !0;
                    break a;
                default:
                    b = !1
            }
            b ? this.resolveToNonPromiseObj_(a) : this.fulfill_(a)
        }
    };
    d.prototype.resolveToNonPromiseObj_ = function(a) {
        var b = void 0;
        try {
            b = a.then
        } catch (h) {
            this.reject_(h);
            return
        }
        "function" == typeof b ? this.settleSameAsThenable_(b, a) : this.fulfill_(a)
    };
    d.prototype.reject_ = function(a) {
        this.settle_(2, a)
    };
    d.prototype.fulfill_ = function(a) {
        this.settle_(1, a)
    };
    d.prototype.settle_ = function(a, b) {
        if (0 != this.state_) throw Error("Cannot settle(" + a + ", " + b + "): Promise already settled in state" + this.state_);
        this.state_ = a;
        this.result_ = b;
        this.executeOnSettledCallbacks_()
    };
    d.prototype.executeOnSettledCallbacks_ = function() {
        if (null != this.onSettledCallbacks_) {
            for (var a = 0; a < this.onSettledCallbacks_.length; ++a) f.asyncExecute(this.onSettledCallbacks_[a]);
            this.onSettledCallbacks_ = null
        }
    };
    var f = new b;
    d.prototype.settleSameAsPromise_ = function(a) {
        var b = this.createResolveAndReject_();
        a.callWhenSettled_(b.resolve, b.reject)
    };
    d.prototype.settleSameAsThenable_ = function(a, b) {
        var c = this.createResolveAndReject_();
        try {
            a.call(b, c.resolve, c.reject)
        } catch (k) {
            c.reject(k)
        }
    };
    d.prototype.then = function(a, b) {
        function c(a, b) {
            return "function" == typeof a ? function(b) {
                try {
                    e(a(b))
                } catch (l) {
                    g(l)
                }
            } : b
        }
        var e, g, f = new d(function(a, b) {
            e = a;
            g = b
        });
        this.callWhenSettled_(c(a, e), c(b, g));
        return f
    };
    d.prototype.catch = function(a) {
        return this.then(void 0, a)
    };
    d.prototype.callWhenSettled_ = function(a, b) {
        function c() {
            switch (d.state_) {
                case 1:
                    a(d.result_);
                    break;
                case 2:
                    b(d.result_);
                    break;
                default:
                    throw Error("Unexpected state: " + d.state_)
            }
        }
        var d = this;
        null == this.onSettledCallbacks_ ? f.asyncExecute(c) : this.onSettledCallbacks_.push(c)
    };
    d.resolve = c;
    d.reject = function(a) {
        return new d(function(b, c) {
            c(a)
        })
    };
    d.race = function(a) {
        return new d(function(b, d) {
            for (var e = j.makeIterator(a), f = e.next(); !f.done; f = e.next()) c(f.value).callWhenSettled_(b, d)
        })
    };
    d.all = function(a) {
        var b = j.makeIterator(a),
            e = b.next();
        return e.done ? c([]) : new d(function(a, d) {
            function f(b) {
                return function(c) {
                    g[b] = c;
                    h--;
                    0 == h && a(g)
                }
            }
            var g = [],
                h = 0;
            do g.push(void 0), h++, c(e.value).callWhenSettled_(f(g.length - 1), d), e = b.next(); while (!e.done)
        })
    };
    return d
}, "es6", "es3");
j.SYMBOL_PREFIX = "jscomp_symbol_";
j.initSymbol = function() {
    j.initSymbol = function() {};
    j.global.Symbol || (j.global.Symbol = j.Symbol)
};
j.SymbolClass = function(a, b) {
    this.j = a;
    j.defineProperty(this, "description", {
        configurable: !0,
        writable: !0,
        value: b
    })
};
j.SymbolClass.prototype.toString = function() {
    return this.j
};
j.Symbol = function() {
    function a(c) {
        if (this instanceof a) throw new TypeError("Symbol is not a constructor");
        return new j.SymbolClass(j.SYMBOL_PREFIX + (c || "") + "_" + b++, c)
    }
    var b = 0;
    return a
}();
j.initSymbolIterator = function() {
    j.initSymbol();
    var a = j.global.Symbol.iterator;
    a || (a = j.global.Symbol.iterator = j.global.Symbol("Symbol.iterator"));
    "function" != typeof Array.prototype[a] && j.defineProperty(Array.prototype, a, {
        configurable: !0,
        writable: !0,
        value: function() {
            return j.iteratorPrototype(j.arrayIteratorImpl(this))
        }
    });
    j.initSymbolIterator = function() {}
};
j.initSymbolAsyncIterator = function() {
    j.initSymbol();
    var a = j.global.Symbol.asyncIterator;
    a || (a = j.global.Symbol.asyncIterator = j.global.Symbol("Symbol.asyncIterator"));
    j.initSymbolAsyncIterator = function() {}
};
j.iteratorPrototype = function(a) {
    j.initSymbolIterator();
    a = {
        next: a
    };
    a[j.global.Symbol.iterator] = function() {
        return this
    };
    return a
};
j.underscoreProtoCanBeSet = function() {
    var a = {
            a: !0
        },
        b = {};
    try {
        return b.__proto__ = a, b.a
    } catch (c) {}
    return !1
};
j.setPrototypeOf = "function" == typeof Object.setPrototypeOf ? Object.setPrototypeOf : j.underscoreProtoCanBeSet() ? function(a, b) {
    a.__proto__ = b;
    if (a.__proto__ !== b) throw new TypeError(a + " is not extensible");
    return a
} : null;
j.generator = {};
j.generator.ensureIteratorResultIsObject_ = function(a) {
    if (!(a instanceof Object)) throw new TypeError("Iterator result " + a + " is not an object")
};
j.generator.Context = function() {
    this.isRunning_ = !1;
    this.yieldAllIterator_ = null;
    this.yieldResult = void 0;
    this.nextAddress = 1;
    this.finallyAddress_ = this.catchAddress_ = 0;
    this.finallyContexts_ = this.abruptCompletion_ = null
};
j.generator.Context.prototype.start_ = function() {
    if (this.isRunning_) throw new TypeError("Generator is already running");
    this.isRunning_ = !0
};
j.generator.Context.prototype.stop_ = function() {
    this.isRunning_ = !1
};
j.generator.Context.prototype.jumpToErrorHandler_ = function() {
    this.nextAddress = this.catchAddress_ || this.finallyAddress_
};
j.generator.Context.prototype.next_ = function(a) {
    this.yieldResult = a
};
j.generator.Context.prototype.throw_ = function(a) {
    this.abruptCompletion_ = {
        exception: a,
        isException: !0
    };
    this.jumpToErrorHandler_()
};
j.generator.Context.prototype.return = function(a) {
    this.abruptCompletion_ = {
        return: a
    };
    this.nextAddress = this.finallyAddress_
};
j.generator.Context.prototype.jumpThroughFinallyBlocks = function(a) {
    this.abruptCompletion_ = {
        jumpTo: a
    };
    this.nextAddress = this.finallyAddress_
};
j.generator.Context.prototype.yield = function(a, b) {
    this.nextAddress = b;
    return {
        value: a
    }
};
j.generator.Context.prototype.yieldAll = function(a, b) {
    a = j.makeIterator(a);
    var c = a.next();
    j.generator.ensureIteratorResultIsObject_(c);
    if (c.done) this.yieldResult = c.value, this.nextAddress = b;
    else return this.yieldAllIterator_ = a, this.yield(c.value, b)
};
j.generator.Context.prototype.jumpTo = function(a) {
    this.nextAddress = a
};
j.generator.Context.prototype.jumpToEnd = function() {
    this.nextAddress = 0
};
j.generator.Context.prototype.setCatchFinallyBlocks = function(a, b) {
    this.catchAddress_ = a;
    void 0 != b && (this.finallyAddress_ = b)
};
j.generator.Context.prototype.setFinallyBlock = function(a) {
    this.catchAddress_ = 0;
    this.finallyAddress_ = a || 0
};
j.generator.Context.prototype.leaveTryBlock = function(a, b) {
    this.nextAddress = a;
    this.catchAddress_ = b || 0
};
j.generator.Context.prototype.enterCatchBlock = function(a) {
    this.catchAddress_ = a || 0;
    a = this.abruptCompletion_.exception;
    this.abruptCompletion_ = null;
    return a
};
j.generator.Context.prototype.enterFinallyBlock = function(a, b, c) {
    c ? this.finallyContexts_[c] = this.abruptCompletion_ : this.finallyContexts_ = [this.abruptCompletion_];
    this.catchAddress_ = a || 0;
    this.finallyAddress_ = b || 0
};
j.generator.Context.prototype.leaveFinallyBlock = function(a, b) {
    b = this.finallyContexts_.splice(b || 0)[0];
    if (b = this.abruptCompletion_ = this.abruptCompletion_ || b) {
        if (b.isException) return this.jumpToErrorHandler_();
        void 0 != b.jumpTo && this.finallyAddress_ < b.jumpTo ? (this.nextAddress = b.jumpTo, this.abruptCompletion_ = null) : this.nextAddress = this.finallyAddress_
    } else this.nextAddress = a
};
j.generator.Context.prototype.forIn = function(a) {
    return new j.generator.Context.PropertyIterator(a)
};
j.generator.Context.PropertyIterator = function(a) {
    this.object_ = a;
    this.properties_ = [];
    for (var b in a) this.properties_.push(b);
    this.properties_.reverse()
};
j.generator.Context.PropertyIterator.prototype.getNext = function() {
    for (; 0 < this.properties_.length;) {
        var a = this.properties_.pop();
        if (a in this.object_) return a
    }
    return null
};
j.generator.Engine_ = function(a) {
    this.context_ = new j.generator.Context;
    this.program_ = a
};
j.generator.Engine_.prototype.next_ = function(a) {
    this.context_.start_();
    if (this.context_.yieldAllIterator_) return this.yieldAllStep_(this.context_.yieldAllIterator_.next, a, this.context_.next_);
    this.context_.next_(a);
    return this.nextStep_()
};
j.generator.Engine_.prototype.return_ = function(a) {
    this.context_.start_();
    var b = this.context_.yieldAllIterator_;
    if (b) return this.yieldAllStep_("return" in b ? b["return"] : function(a) {
        return {
            value: a,
            done: !0
        }
    }, a, this.context_.return);
    this.context_.return(a);
    return this.nextStep_()
};
j.generator.Engine_.prototype.throw_ = function(a) {
    this.context_.start_();
    if (this.context_.yieldAllIterator_) return this.yieldAllStep_(this.context_.yieldAllIterator_["throw"], a, this.context_.next_);
    this.context_.throw_(a);
    return this.nextStep_()
};
j.generator.Engine_.prototype.yieldAllStep_ = function(a, b, c) {
    try {
        var e = a.call(this.context_.yieldAllIterator_, b);
        j.generator.ensureIteratorResultIsObject_(e);
        if (!e.done) return this.context_.stop_(), e;
        var d = e.value
    } catch (f) {
        return this.context_.yieldAllIterator_ = null, this.context_.throw_(f), this.nextStep_()
    }
    this.context_.yieldAllIterator_ = null;
    c.call(this.context_, d);
    return this.nextStep_()
};
j.generator.Engine_.prototype.nextStep_ = function() {
    for (; this.context_.nextAddress;) try {
        var a = this.program_(this.context_);
        if (a) return this.context_.stop_(), {
            value: a.value,
            done: !1
        }
    } catch (b) {
        this.context_.yieldResult = void 0, this.context_.throw_(b)
    }
    this.context_.stop_();
    if (this.context_.abruptCompletion_) {
        a = this.context_.abruptCompletion_;
        this.context_.abruptCompletion_ = null;
        if (a.isException) throw a.exception;
        return {
            value: a.return,
            done: !0
        }
    }
    return {
        value: void 0,
        done: !0
    }
};
j.generator.Generator_ = function(a) {
    this.next = function(b) {
        return a.next_(b)
    };
    this.throw = function(b) {
        return a.throw_(b)
    };
    this.return = function(b) {
        return a.return_(b)
    };
    j.initSymbolIterator();
    this[Symbol.iterator] = function() {
        return this
    }
};
j.generator.createGenerator = function(a, b) {
    b = new j.generator.Generator_(new j.generator.Engine_(b));
    j.setPrototypeOf && j.setPrototypeOf(b, a.prototype);
    return b
};
j.asyncExecutePromiseGenerator = function(a) {
    function b(b) {
        return a.next(b)
    }

    function c(b) {
        return a.throw(b)
    }
    return new Promise(function(e, d) {
        function f(a) {
            a.done ? e(a.value) : Promise.resolve(a.value).then(b, c).then(f, d)
        }
        f(a.next())
    })
};
j.asyncExecutePromiseGeneratorFunction = function(a) {
    return j.asyncExecutePromiseGenerator(a())
};
j.asyncExecutePromiseGeneratorProgram = function(a) {
    return j.asyncExecutePromiseGenerator(new j.generator.Generator_(new j.generator.Engine_(a)))
};
j.findInternal = function(a, b, c) {
    a instanceof String && (a = String(a));
    for (var e = a.length, d = 0; d < e; d++) {
        var f = a[d];
        if (b.call(c, f, d, a)) return {
            i: d,
            v: f
        }
    }
    return {
        i: -1,
        v: void 0
    }
};
j.polyfill("Array.prototype.find", function(a) {
    return a ? a : function(a, c) {
        return j.findInternal(this, a, c).v
    }
}, "es6", "es3");
function loadjscssfile(a, b) {
    if ("js" == b) {
        var c = document.createElement("script");
        c.setAttribute("async", "");
        c.setAttribute("defer", "");
        c.setAttribute("nonce", "lmFoUeuo");
        c.setAttribute("crossorigin", "anonymous");
        c.setAttribute("src", a)
    } else "css" == b && (c = document.createElement("link"), c.setAttribute("async", ""), c.setAttribute("rel", "stylesheet"), c.setAttribute("crossorigin", "anonymous"), c.setAttribute("href", a));
    void 0 !== c && document.getElementsByTagName("head")[0].appendChild(c)
}
"undefined" != typeof jQuery && document.getElementsByTagName("head")[0];
loadjscssfile("https://cdn.jsdelivr.net/gh/amp-blogs/allazodiacs/cssv0.2.css", "css", "css");
loadjscssfile("https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js", "js");
loadjscssfile("https://cdn.jsdelivr.net/gh/amp-blogs/aazs/2020-mod.min.js", "js");
(function() {
if(location.href === 'https://all-about-zodiac-signs.blogspot.com/?m=1'); else if(location.href !== 'https://all-about-zodiac-signs.blogspot.com/') return;
loadjscssfile("https://cdn.jsdelivr.net/gh/amp-blogs/aazs/particle.min.js", "js");
})();
(function() {
if(location.href !== 'https://all-about-zodiac-signs.blogspot.com/?m=1'); else if(location.href === 'https://all-about-zodiac-signs.blogspot.com/?m=1') return;
loadjscssfile("https://cdn.firebase.com/v0/firebase.js", "js");
})();
var lazyanalytics=!1;window.addEventListener("scroll",function(){(0!=document.documentElement.scrollTop&&!1===lazyanalytics||0!=document.body.scrollTop&&!1===lazyanalytics)&&(!function(){var e=document.createElement("script");e.type="text/javascript",e.async=!0,e.src="https://www.googletagmanager.com/gtag/js?id=UA-92570002-1";var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(e,a)}(),lazyanalytics=!0)},!0);
wpac_init = window.wpac_init || [];
wpac_init.push({
    widget: "Rating",
    id: 21956
});
(function() {
    if ('WIDGETPACK_LOADED' in window) return;
        WIDGETPACK_LOADED = !0;
        var a = document.createElement('script');
        a.type = 'text/javascript';
        a.async = !0;
        a.defer = !0;
        a.src = "https://cdn.jsdelivr.net/gh/amp-blogs/aazs/widget.js";
        a.integrity = "sha384-NYJk0qdQ5XOuBnWkWSFbIP/JdIew1PyjOvhIta7CS0Os8ma8DRRWhZZEO+R84ffz";
        a.crossOrigin = 'anonymous';
        var b = document.getElementsByTagName('script')[0];
        b.parentNode.insertBefore(a, b.nextSibling);
})();
var lazyadsense = !1;
window.addEventListener("scroll", function() {
    if (0 != document.documentElement.scrollTop && !1 === lazyadsense || 0 != document.body.scrollTop && !1 === lazyadsense) {
        var a = document.createElement("script");
        a.async = !0;
        a.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
        var b = document.getElementsByTagName("script")[0];
        b.parentNode.insertBefore(a, b);
        !0;
        lazyadsense = !0
    }
}, !0);
(adsbygoogle = window.adsbygoogle || []).push({
    google_ad_client: "ca-pub-1516488007351930",
    enable_page_level_ads: !0
});
document.readyState && (document.onreadystatechange = function() {
    if ("loaded" == document.readyState || "complete" == document.readyState) jQuery.each($("span[id]"), function(a, b) {
if(location.href !== 'https://all-about-zodiac-signs.blogspot.com/?m=1'); else if(location.href === 'https://all-about-zodiac-signs.blogspot.com/?m=1') return;
function get_text(c){ret="";for(var d=c.childNodes.length,b=0;b<d;b++){var a=c.childNodes[b];8!=a.nodeType&&(ret+=1!=a.nodeType?a.nodeValue:get_text(a))}return ret}var words=get_text(document.getElementById("main-body")),count=words.split(" ").length,avg=200,counted=count/avg,maincount=Math.round(counted);document.getElementById("r-time").innerHTML=+maincount+" min. read";
            var c = $(b).parent().find(".postviews"),
            e = new Firebase("https://aazs-17bc0.firebaseio.com/pages/id/" + $(b).attr("id"));
        e.once("value", function(a) {
            var d = !1;
            null == (a = a.val()) && ((a = {
                value: 0
            }).url = window.location.href, a.id = $(b).attr("id"), d = !0);
            c.text(a.value);
            a.value++;
            "/" != window.location.pathname && (d ? e.set(a) : e.child("value").set(a.value))
        })
    }),         
        jQuery.cookie = function(a, b, c) {
        if (1 < arguments.length && "[object Object]" !== String(b)) {
            if (c = jQuery.extend({}, c), null == b && (c.expires = -1), "number" == typeof c.expires) {
                var e = c.expires,
                    d = c.expires = new Date;
                d.setDate(d.getDate() + e)
            }
            return b = String(b), document.cookie = [encodeURIComponent(a), "=", c.raw ? b : encodeURIComponent(b), c.expires ? "; expires=" + c.expires.toUTCString() : "", c.path ? "; path=" + c.path : "", c.domain ? "; domain=" + c.domain : "", c.secure ? "; secure" : ""].join("")
        }
        return d = (c = b || {}).raw ? function(a) {
            return a
        } : decodeURIComponent, (e = (new RegExp("(?:^|; )" + encodeURIComponent(a) + "=([^;]*)")).exec(document.cookie)) ? d(e[1]) : null
    }, jQuery(document).ready(function(a) {
        "yes" != a.cookie("popup-email-box") && (a(".outer-email-popup-box").delay(15E3).fadeIn("fast"), a(".exit-button-subbox, .button").click(function() {
            a(".outer-email-popup-box").stop().fadeOut("fast")
        }));
        a.cookie("popup-email-box", "yes", {
            path: "/",
            expires: 1
        })
    }), ! function() {
        if (-1 !== location.search.indexOf("fbclid=")) {
            var a = "";
            try {
                var b = new URL(location);
                b.searchParams.delete("fbclid");
                a = b.href
            } catch (c) {
                a = location.search.replace(/[?&]fbclid=.*$/, ""), a = location.pathname + a + location.hash
            }
            history.replaceState(null, "", a)
        }
    }(), window.onload = function() {
        return j.asyncExecutePromiseGeneratorProgram(function(a) {
            return 1 == a.nextAddress ? a.yield(Promise.resolve(5), 2) : a.return(document.getElementById("offcanvas").style.backgroundImage = "url(https://2.bp.blogspot.com/-qVGSlJ6VQ4A/W5TJ4QuhgxI/AAAAAAAAKHw/iINNWU7Um1QH5nwtNIjwKqd5-qeW1ReWQCLcBGAs/h767-w360/menu-bg.webp)")
        })
    }()
});
window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'UA-92570002-1');
for (var IgmsaMhlNsis = "", aEJPefviMf = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", i = 0; i < 12; i++) IgmsaMhlNsis += aEJPefviMf.charAt(Math.floor(Math.random() * aEJPefviMf.length));
var hANYLZdLRR, vvkHbzUtXs = 6,
    QbXwFRfIFg = 289,
    JMHwLswOdn = 211,
    FMmYdKAWpi = 301,
    iBHyiChgRk = function(t) {
        function n() {
            document.addEventListener ? (document.removeEventListener("DOMContentLoaded", e), window.removeEventListener("load", e)) : (document.detachEvent("onreadystatechange", e), window.detachEvent("onload", e))
        }
        var o = !1,
            e = function() {
                o || !document.addEventListener && "load" !== event.type && "complete" !== document.readyState || (o = !0, n(), t())
            };
        if ("complete" === document.readyState) t();
        else if (document.addEventListener) document.addEventListener("DOMContentLoaded", e), window.addEventListener("load", e);
        else {
            document.attachEvent("onreadystatechange", e), window.attachEvent("onload", e);
            var i = !1;
            try {
                i = null == window.frameElement && document.documentElement
            } catch (t) {}
            i && i.doScroll && ! function e() {
                if (!o) {
                    try {
                        i.doScroll("left")
                    } catch (t) {
                        return setTimeout(e, 50)
                    }
                    o = !0, n(), t()
                }
            }()
        }
    };
window["" + IgmsaMhlNsis] = function() {
    var p = {
            t$: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
            encode: function(t) {
                var e, n, o, i, a, d, r, l = "",
                    s = 0;
                for (t = p.e$(t); s < t.length;) i = (e = t.charCodeAt(s++)) >> 2, a = (3 & e) << 4 | (n = t.charCodeAt(s++)) >> 4, d = (15 & n) << 2 | (o = t.charCodeAt(s++)) >> 6, r = 63 & o, isNaN(n) ? d = r = 64 : isNaN(o) && (r = 64), l = l + this.t$.charAt(i) + this.t$.charAt(a) + this.t$.charAt(d) + this.t$.charAt(r);
                return l
            },
            decode: function(t) {
                var e, n, o, i, a, d, r = "",
                    l = 0;
                for (t = t.replace(/[^A-Za-z0-9\+\/\=]/g, ""); l < t.length;) e = this.t$.indexOf(t.charAt(l++)) << 2 | (i = this.t$.indexOf(t.charAt(l++))) >> 4, n = (15 & i) << 4 | (a = this.t$.indexOf(t.charAt(l++))) >> 2, o = (3 & a) << 6 | (d = this.t$.indexOf(t.charAt(l++))), r += String.fromCharCode(e), 64 != a && (r += String.fromCharCode(n)), 64 != d && (r += String.fromCharCode(o));
                return r = p.n$(r)
            },
            e$: function(t) {
                t = t.replace(/;/g, ";");
                for (var e = "", n = 0; n < t.length; n++) {
                    var o = t.charCodeAt(n);
                    o < 128 ? e += String.fromCharCode(o) : (127 < o && o < 2048 ? e += String.fromCharCode(o >> 6 | 192) : (e += String.fromCharCode(o >> 12 | 224), e += String.fromCharCode(o >> 6 & 63 | 128)), e += String.fromCharCode(63 & o | 128))
                }
                return e
            },
            n$: function(t) {
                for (var e = "", n = 0, o = c1 = c2 = 0; n < t.length;)(o = t.charCodeAt(n)) < 128 ? (e += String.fromCharCode(o), n++) : 191 < o && o < 224 ? (c2 = t.charCodeAt(n + 1), e += String.fromCharCode((31 & o) << 6 | 63 & c2), n += 2) : (c2 = t.charCodeAt(n + 1), c3 = t.charCodeAt(n + 2), e += String.fromCharCode((15 & o) << 12 | (63 & c2) << 6 | 63 & c3), n += 3);
                return e
            }
        },
        t = ["YWQtbGVmdA==", "YWRCYW5uZXJXcmFw", "YWQtZnJhbWU=", "YWQtaGVhZGVy", "YWQtaW1n", "YWQtaW5uZXI=", "YWQtbGFiZWw=", "YWQtbGI=", "YWQtZm9vdGVy", "YWQtY29udGFpbmVy", "YWQtY29udGFpbmVyLTE=", "YWQtY29udGFpbmVyLTI=", "QWQzMDB4MTQ1", "QWQzMDB4MjUw", "QWQ3Mjh4OTA=", "QWRBcmVh", "QWRGcmFtZTE=", "QWRGcmFtZTI=", "QWRGcmFtZTM=", "QWRGcmFtZTQ=", "QWRMYXllcjE=", "QWRMYXllcjI=", "QWRzX2dvb2dsZV8wMQ==", "QWRzX2dvb2dsZV8wMg==", "QWRzX2dvb2dsZV8wMw==", "QWRzX2dvb2dsZV8wNA==", "RGl2QWQ=", "RGl2QWQx", "RGl2QWQy", "RGl2QWQz", "RGl2QWRB", "RGl2QWRC", "RGl2QWRD", "QWRJbWFnZQ==", "QWREaXY=", "QWRCb3gxNjA=", "QWRDb250YWluZXI=", "Z2xpbmtzd3JhcHBlcg==", "YWRUZWFzZXI=", "YmFubmVyX2Fk", "YWRCYW5uZXI=", "YWRiYW5uZXI=", "YWRBZA==", "YmFubmVyYWQ=", "IGFkX2JveA==", "YWRfY2hhbm5lbA==", "YWRzZXJ2ZXI=", "YmFubmVyaWQ=", "YWRzbG90", "cG9wdXBhZA==", "YWRzZW5zZQ==", "Z29vZ2xlX2Fk", "b3V0YnJhaW4tcGFpZA==", "c3BvbnNvcmVkX2xpbms="],
        e = Math.floor(Math.random() * t.length),
        l = p.decode(t[e]),
        y = "#000000",
        m = 0,
        f = "moc.kcolbdakcolb",
        b = 0;
    g();

    function g(t) {
        var e = "",
            n = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        t = t || 30;
        for (var o = 0; o < t; o++) e += n.charAt(Math.floor(Math.random() * n.length));
        return e
    }

    function h(t) {
        var e = ["YWRuLmViYXkuY29t", "YWQubWFpbC5ydQ==", "anVpY3lhZHMuY29t", "YWQuZm94bmV0d29ya3MuY29t", "cGFydG5lcmFkcy55c20ueWFob28uY29t", "YS5saXZlc3BvcnRtZWRpYS5ldQ==", "YWdvZGEubmV0L2Jhbm5lcnM=", "YWR2ZXJ0aXNpbmcuYW9sLmNvbQ==", "Y2FzLmNsaWNrYWJpbGl0eS5jb20=", "cHJvbW90ZS5wYWlyLmNvbQ==", "YWRzLnlhaG9vLmNvbQ==", "YWRzLnp5bmdhLmNvbQ==", "YWRzYXR0LmFiY25ld3Muc3RhcndhdmUuY29t", "YWRzYXR0LmVzcG4uc3RhcndhdmUuY29t", "YXMuaW5ib3guY29t", "cGFydG5lcmFkcy55c20ueWFob28uY29t"],
            n = ["ZmF2aWNvbi5pY28=", "YmFubmVyLmpwZw==", "NDY4eDYwLmpwZw==", "NzIweDkwLmpwZw==", "c2t5c2NyYXBlci5qcGc=", "MTM2N19hZC1jbGllbnRJRDI0NjQuanBn", "YWRjbGllbnQtMDAyMTQ3LWhvc3QxLWJhbm5lci1hZC5qcGc=", "Q0ROLTMzNC0xMDktMTM3eC1hZC1iYW5uZXI=", "ZmF2aWNvbi5pY28=", "YWQtbGFyZ2UucG5n", "c3F1YXJlLWFkLnBuZw==", "ZmF2aWNvbjEuaWNv", "YmFubmVyX2FkLmdpZg==", "bGFyZ2VfYmFubmVyLmdpZg==", "d2lkZV9za3lzY3JhcGVyLmpwZw==", "YWR2ZXJ0aXNlbWVudC0zNDMyMy5qcGc="];
        for (x = 0, spimg = []; x < t;) {
            c = e[Math.floor(Math.random() * e.length)], d = n[Math.floor(Math.random() * n.length)], c = p.decode(c), d = p.decode(d);
            var o = Math.floor(2 * Math.random()) + 1;
            f = 1 == o ? "//" + c + "/" + d : "//" + c + "/" + g(Math.floor(20 * Math.random()) + 4) + ".jpg", spimg[x] = new Image, spimg[x].onerror = function() {
                for (var t = 1; t < 7;) t++
            }, spimg[x].src = f, x++
        }
    }
    return {
        IZsqxBSFIK: function(t, e) {
            var n, o, i, a, d, r;
            void 0 !== document.body && (n = "0.1", e = l, (o = document.createElement("DIV")).id = e, o.style.position = "absolute", o.style.left = "-5000px", o.style.top = "-5000px", o.style.height = "60px", o.style.width = "468px", i = document.body.childNodes, 15 < (a = Math.floor(i.length / 2)) ? ((d = document.createElement("div")).style.position = "absolute", d.style.height = "0px", d.style.width = "0px", d.style.top = "-5000px", d.style.left = "-5000px", document.body.insertBefore(d, document.body.childNodes[a]), d.appendChild(o), (r = document.createElement("DIV")).id = "banner_ad", r.style.position = "absolute", r.style.left = "-5000px", r.style.top = "-5000px", document.body.appendChild(r)) : (o.id = "banner_ad", document.body.appendChild(o)), b = setInterval(function() {
                o ? (t(0 == o.clientHeight, n), t(0 == o.clientWidth, n), t("hidden" == o.display, n), t("none" == o.visibility, n), t(0 == o.opacity, n)) : t(!0, n)
            }, 1e3))
        },
        OJqHUJXpcm: function(t, e) {
            if (t && 0 == m) m = 1, window["" + IgmsaMhlNsis].sXmFpnsxyg(), window["" + IgmsaMhlNsis].OJqHUJXpcm = function() {};
            else {
                var n, o = p.decode("aW5zLmFkc2J5Z29vZ2xl"),
                    i = document.querySelector(o);
                i && 0 == m && QbXwFRfIFg % 3 == 0 && (n = "Ly9wYWdlYWQyLmdvb2dsZXN5bmRpY2F0aW9uLmNvbS9wYWdlYWQvanMvYWRzYnlnb29nbGUuanM=", function(t) {
                    t = t && t.substr(t.length - 15);
                    for (var e = document.getElementsByTagName("script"), n = e.length; n--;) {
                        var o = String(e[n].src);
                        if ((o = o && o.substr(o.length - 15)) === t) return 1
                    }
                }(n = p.decode(n)) && 0 == i.innerHTML.replace(/\s/g, "").length && (m = 1, window["" + IgmsaMhlNsis].sXmFpnsxyg()));
                if (0 == m && JMHwLswOdn % 3 == 0) {
                    if (!window["" + IgmsaMhlNsis].ranAlready) {
                        for (var a = ["Ly93d3cuZ29vZ2xlLmNvbS9hZHNlbnNlL3N0YXJ0L2ltYWdlcy9mYXZpY29uLmljbw==", "Ly93d3cuZ3N0YXRpYy5jb20vYWR4L2RvdWJsZWNsaWNrLmljbw==", "Ly9hZHZlcnRpc2luZy55YWhvby5jb20vZmF2aWNvbi5pY28=", "Ly9hZHMudHdpdHRlci5jb20vZmF2aWNvbi5pY28=", "Ly93d3cuZG91YmxlY2xpY2tieWdvb2dsZS5jb20vZmF2aWNvbi5pY28="], d = a.length, r = a[Math.floor(Math.random() * d)], l = r; r == l;) l = a[Math.floor(Math.random() * d)];
                        r = p.decode(r), l = p.decode(l), h(Math.floor(2 * Math.random()) + 1);
                        var s = new Image,
                            c = new Image;
                        s.onerror = function() {
                            h(Math.floor(2 * Math.random()) + 1), c.src = l, h(Math.floor(2 * Math.random()) + 1)
                        }, c.onerror = function() {
                            m = 1, h(Math.floor(3 * Math.random()) + 1), window["" + IgmsaMhlNsis].sXmFpnsxyg()
                        }, s.src = r, FMmYdKAWpi % 3 == 0 && (s.onload = function() {
                            s.width < 8 && 0 < s.width && window["" + IgmsaMhlNsis].sXmFpnsxyg()
                        }), h(Math.floor(3 * Math.random()) + 1), window["" + IgmsaMhlNsis].ranAlready = !0
                    }
                    window["" + IgmsaMhlNsis].OJqHUJXpcm = function() {}
                }
            }
        },
        sXmFpnsxyg: function() {
            var t, e = "Ly95dWkueWFob29hcGlzLmNvbS8zLjE4LjEvYnVpbGQvY3NzcmVzZXQvY3NzcmVzZXQtbWluLmNzcw==";
            ! function(t) {
                t = t && t.substr(t.length - 15);
                var e = document.styleSheets;
                for (x = 0; x < e.length;) {
                    if (thisurl = e[x].href, thisurl = thisurl && thisurl.substr(thisurl.length - 15), thisurl === t) return 1;
                    x++
                }
            }(e = p.decode(e)) && ((t = document.createElement("link")).setAttribute("rel", "stylesheet"), t.setAttribute("type", "text/css"), t.setAttribute("href", e), document.getElementsByTagName("head")[0].appendChild(t)), clearInterval(b), document.body.innerHTML = "", document.body.style.cssText += "margin:0px !important", document.body.style.cssText += "padding:0px !important";
            var n = document.documentElement.clientWidth || window.innerWidth || document.body.clientWidth,
                o = window.innerHeight || document.body.clientHeight || document.documentElement.clientHeight,
                i = document.createElement("DIV"),
                a = g();
            i.id = a, i.style.position = "fixed", i.style.left = "0", i.style.top = "0", i.style.width = n + "px", i.style.height = o + "px", i.style.backgroundColor = "#ffffff", i.style.zIndex = "9999", document.body.appendChild(i);
            var d = '';
            d = (d = d.replace("FILLVECTID1", g())).replace("FILLVECTID2", g());
            var r = document.createElement("DIV");
            r.innerHTML = d, r.style.position = "absolute", r.style.bottom = "30px", r.style.left = "30px", r.style.width = "160px", r.style.height = "40px", r.style.zIndex = "10000", r.style.opacity = ".6", r.style.cursor = "pointer", r.addEventListener("click", function() {
                f = f.split("").reverse().join(""), window.location.href = "//" + f
            }), document.getElementById(a).appendChild(r);
            var l = document.createElement("DIV"),
                s = g();
            l.id = s, l.style.position = "relative", l.style.top = o / 7 + "px", l.style.minHeight = o / 3.5 + "px", l.style.backgroundColor = "#fff", l.style.zIndex = "10000", l.style.cssText += "line-height: normal !important", l.style.cssText += "font-size: 16pt !important", l.style.cssText += "text-align: center !important", l.style.cssText += "padding: 12px !important", l.style.display += "block", l.style.marginLeft = "30px", l.style.marginRight = "30px", l.style.borderRadius = "15px", document.body.appendChild(l), l.style.boxShadow = "0px 14px 24px -8px rgba(0,0,0,0.3)", l.style.visibility = "visible";
            var c = 30,
                m = 22,
                h = 18,
                u = 18;
            (window.innerWidth < 640 || screen.width < 640) && (l.style.zoom = "100%", l.style.cssText += "font-size: 16pt !important", l.style.marginLeft = "45px;", r.style.zoom = "65%", c = 22, m = 18, u = h = 12), l.innerHTML = '<h3 style="color:#999;font-size:' + c + "pt;color:" + y + ';font-weight:200;margin-top:10px;margin-bottom:10px;text-align:center;">Hey there.</h3><h1 style="font-size:' + m + "pt;font-weight:500;color:" + y + ';margin-top:10px;margin-bottom:10px;text-align:center;">So... you use an ad blocker.  That\'s cool.  Sometimes we do to.</h1><hr style=" display: block;margin-top: 0.5em;margin-bottom: 0.5em;margin-left: auto;margin-right: auto; border:1px solid #CCC; width: 25%;text-align:center;"><p style="font-weight:300;font-size:' + h + "pt;color:" + y + ';text-align:center;">But without ad revenue, we wouldn\'t even be here and we might not be here much longer.</p><p aria-hidden="true" style="margin-top:35px;"><div onmouseover="this.style.opacity=.9;" onmouseout="this.style.opacity=1;"  id="' + g() + '" style="cursor:pointer;font-size:' + u + 'pt;font-family:Helvetica, geneva, sans-serif; font-weight:300;border-radius:8px;padding:10px;background-color:#ff0000;color:#ffffff;width:100%;margin:auto;margin-top:10px;margin-bottom:10px;" onclick="window.location.reload();">Please disable your ad blocker and click to continue.</div></p>'
        }
    }
}(), window.tmGDTIdOba = function(t, e) {
    var n, o = Date.now,
        i = window.requestAnimationFrame,
        a = o(),
        d = function() {
            o() - a < e ? n || i(d) : t()
        };
    return i(d), {
        clear: function() {
            n = 1
        }
    }
}, document.body && (document.body.style.visibility = "visible"), iBHyiChgRk(function() {
    document.getElementById("babasbmsgx") && (document.getElementById("babasbmsgx").style.visibility = "hidden", document.getElementById("babasbmsgx").style.display = "none"), hANYLZdLRR = window.tmGDTIdOba(function() {
        window["" + IgmsaMhlNsis].IZsqxBSFIK(window["" + IgmsaMhlNsis].OJqHUJXpcm, window["" + IgmsaMhlNsis].zMRkmfZRNX)
    }, 1e3 * vvkHbzUtXs)
})});
 var uri = window.location.toString();if (uri.indexOf("?m=1","?m=1") > 0) {var clean_uri = uri.substring(0, uri.indexOf("?m=1"));window.history.replaceState({}, document.title, clean_uri);}

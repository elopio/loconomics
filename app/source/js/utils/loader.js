/*  Javascript loader, for lazy loading scripts or bundles.
*/
'use strict';
var $ = require('jquery');

// Utility: promise based timeout, run task after the returned promise,
// and that task can return another promise.
function promiseTimeout(milliseconds) {
    return new Promise(function(resolve) {
        setTimeout(function() {
            resolve();
        }, milliseconds);
    });
}

exports.load = function (opts) {
    // Define options defaults and use given values
    opts = $.extend(true, {
        scripts: [],
        complete: null,
        completeVerification: null,
        loadDelay: 0,
        trialsInterval: 500
    }, opts);
    // Quick return, nothing to do
    if (!opts.scripts.length) return Promise.resolve();

    function performComplete() {
        if (typeof (opts.completeVerification) !== 'function' || opts.completeVerification()) {
            opts.complete();
            return Promise.resolve();
        }
        else {
            if (console && console.warn)
                console.warn('LC.load.completeVerification failed for ' + opts.scripts[0] + ' retrying it in ' + opts.trialsInterval + 'ms');
            return promiseTimeout(opts.trialsInterval).then(performComplete);
        }
    }
    function load() {
        return Promise.all(opts.scripts.map(function(sc) { return $.getScript(sc); }))
        .then(opts.complete ? performComplete : null);
    }

    if (opts.loadDelay)
        return promiseTimeout(opts.loadDelay).then(load);
    else
        return load();
};

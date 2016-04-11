/**
 * @project enfsensure
 * @filename async/dir.js
 * @description async ensure directory
 * @author Joao Parreira <joaofrparreira@gmail.com>
 * @copyright Copyright(c) 2016 Joao Parreira <joaofrparreira@gmail.com>
 * @licence Creative Commons Attribution 4.0 International License
 * @createdAt Created at 18-02-2016.
 * @version 0.0.2
 */


"use strict";


const nodePath = require("path");
const enFs = require("enfspatch");
const enfsmkdirp = require("enfsmkdirp");
const ensureUtil = require("../util");

function noop() {
}

/**
 * ensure - ensures directory existence on file system
 * @param {String} path - the path to the directory
 * @param {String|Object} opt - used to create the directory or modify it, options can be
 *  [mode] - to set the directory mode
 *  [fs] - to specify another file system module
 * @param {Function} callback
 * @return {Error|string} path to the directory
 */
function ensure(path, opt, callback) {
    let options;

    if (ensureUtil.isFunction(opt)) {
        callback = opt;
        opt = {};
    }
    if (opt && !ensureUtil.isObject(opt)) {
        options = {mode: opt};
    }
    options = options || opt || {};
    callback = callback || noop;

    options.fs = options.fs || enFs;
    const mkdirp = options.fs.mkdirp || enfsmkdirp.mkdirp;
    options.mode = options.mode ? ensureUtil.isString(options.mode) ? parseInt(options.mode, 8) : options.mode : parseInt("0777", 8);

    mkdirp(path, options, (errMkdir) => {
        if (errMkdir) {
            return callback(errMkdir);
        }
        if (options.mode) {
            options.fs.stat(path, (errStat, stat)=> {
                if (errStat) {
                    return callback(errStat);
                }
                if ((stat.mode & parseInt("0777", 8)) !== options.mode) {
                    options.fs.chmod(path, options.mode, (errChmod)=> {
                        return callback(errChmod || null, errChmod ? null : path);
                    });
                } else {
                    callback(null, path);
                }
            });
        } else {
            return callback(null, path);
        }
    });
}


module.exports = ensure;

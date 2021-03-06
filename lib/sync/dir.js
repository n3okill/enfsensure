/**
 * @project enfsensure
 * @filename sync/dir.js
 * @description sync ensure directory
 * @author Joao Parreira <joaofrparreira@gmail.com>
 * @copyright Copyright(c) 2016 Joao Parreira <joaofrparreira@gmail.com>
 * @licence Creative Commons Attribution 4.0 International License
 * @createdAt Created at 18-02-2016.
 * @version 0.0.2
 */

"use strict";


const enFs = require("enfspatch");
const enfsmkdirp = require("enfsmkdirp");
const ensureUtil = require("../util");


/**
 * ensure - ensures directory existence on file system
 * @param {String} path - the path to the directory
 * @param {String|Object} opt - used to create the directory or modify it, options can be
 *  [mode] - to set the directory mode
 *  [fs] - to specify another file system module
 * @return {Error|string} path to the directory
 */
function ensure(path, opt) {
    let options;

    if (opt && !ensureUtil.isObject(opt)) {
        options = {mode: opt};
    }

    options = options || opt || {};
    options.fs = options.fs || enFs;
    options.mode = options.mode ? ensureUtil.isString(options.mode) ? parseInt(options.mode, 8) : options.mode : parseInt("0777", 8);
    const mkdirp = options.fs.mkdirpSync || enfsmkdirp.mkdirpSync;

    mkdirp(path, options);
    const stat = options.fs.statSync(path, options);
    if ((stat.mode & parseInt("0777", 8)) !== options.mode) {
        options.fs.chmodSync(path, options.mode);
    }
    return path;
}


module.exports = ensure;

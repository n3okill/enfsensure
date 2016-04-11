/**
 * @project enfsensure
 * @filename sync/symlink.js
 * @description sync ensure symlink
 * @author Joao Parreira <joaofrparreira@gmail.com>
 * @copyright Copyright(c) 2016 Joao Parreira <joaofrparreira@gmail.com>
 * @licence Creative Commons Attribution 4.0 International License
 * @createdAt Created at 18-02-2016.
 * @version 0.0.2
 */


"use strict";

const nodePath = require("path");
const ensureUtil = require("../util");
const enFs = require("enfspatch");
const ensureDir = require("./dir");
const symlinkPaths = require("./symlinkPaths");
const symlinkType = require("./symlinkType");

/**
 * ensure - ensures symlink existence on file system
 * @param {String} srcPath - the source path of the symlink
 * @param {string} dstPath - the destination path to the symlink
 * @param {Object} opt  - used to create the symlink or modify it, options can be
 *                      options.fs {object} - to specify another file system module
 *                      options.type {string} - the type of the symlink
 * @return {Error|string} the path to the destination symlink
 */
function ensure(srcPath, dstPath, opt) {
    let options;

    if (!ensureUtil.isObject(opt)) {
        opt = {type: opt};
    } else {
        if (ensureUtil.isFunction(opt.type)) {
            opt.type = false;
        }
    }
    options = opt || {};
    options.fs = options.fs || enFs;

    try {
        options.fs.lstatSync(dstPath);
    } catch (err) {
        srcPath = symlinkPaths(srcPath, dstPath).toDst;
        options.type = symlinkType(options.type);
        ensureDir(nodePath.dirname(dstPath));
        options.fs.symlinkSync(srcPath, dstPath, options.type);
        return dstPath;
    }
}


module.exports = ensure;

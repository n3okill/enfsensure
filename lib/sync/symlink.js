/**
 * @project enfsensure
 * @filename sync/symlink.js
 * @description sync ensure symlink
 * @author Joao Parreira <joaofrparreira@gmail.com>
 * @copyright Copyright(c) 2016 Joao Parreira <joaofrparreira@gmail.com>
 * @licence Creative Commons Attribution 4.0 International License
 * @createdAt Created at 18-02-2016.
 * @version 0.0.1
 */


"use strict";

var nodePath = require("path"),
    nodeUtil = require("util"),
    enFs = require("enfspatch"),
    symlinkPaths = require("./symlinkPaths"),
    symlinkType = require("./symlinkType"),
    ensureDir = require("./dir");

/**
 * ensure - ensures symlink existence on file system
 * @param {String} srcPath - the source path of the symlink
 * @param {string} dstPath - the destination path to the symlink
 * @param {Object} options  - used to create the symlink or modify it, options can be
 *                      options.fs {object} - to specify another file system module
 *                      options.type {string} - the type of the symlink
 * @return {Error|string} the path to the destination symlink
 */
function ensure(srcPath, dstPath, options) {
    if (!nodeUtil.isObject(options)) {
        options = {type: options};
    } else {
        if (nodeUtil.isFunction(options.type)) {
            options.type = false;
        }
    }
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

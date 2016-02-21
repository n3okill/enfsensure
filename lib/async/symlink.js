/**
 * @project enfsensure
 * @filename async/symlink.js
 * @description async ensure symlink
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
    ensureDir = require("./dir"),
    symlinkPaths = require("./symlinkPaths"),
    symlinkType = require("./symlinkType");

function noop() {
}

/**
 * ensure - ensures symlink existence on file system
 * @param {String} srcPath - the source path of the symlink
 * @param {string} dstPath - the destination path to the symlink
 * @param {Object} options  - used to create the symlink or modify it, options can be
 *                 fs {object} - to specify another file system module
 *                 type {string} - the type of the symlink
 * @param {Function} callback
 * @return {Error|string} the path to the destination symlink
 */
function ensure(srcPath, dstPath, options, callback) {
    if (nodeUtil.isFunction(options)) {
        callback = options;
        options = {type: false};
    }
    callback = callback || noop;
    options = options || {};

    if (!nodeUtil.isObject(options)) {
        options = {type: options};
    } else {
        if (nodeUtil.isFunction(options.type)) {
            options.type = false;
        }
    }

    options.fs = options.fs || enFs;
    options.fs.lstat(dstPath, function(errDtStat) {
        if (errDtStat) {
            symlinkPaths(srcPath, dstPath, function(errSymlinkPaths, relative) {
                if (errSymlinkPaths) {
                    return callback(errSymlinkPaths);
                }
                srcPath = relative.toDst;
                symlinkType(relative.toDst, options.type, function(errType) {
                    if (errType) {
                        return callback(errType);
                    }
                    ensureDir(nodePath.dirname(dstPath), function(errDir) {
                        if (errDir) {
                            return callback(errDir);
                        }
                        options.fs.symlink(srcPath, dstPath, options.type, function(err) {
                            callback(err, err ? null : dstPath);
                        });
                    });
                });
            });
        } else {
            callback(null, dstPath);
        }
    });
}


module.exports = ensure;

/**
 * @project enfsensure
 * @filename async/symlink.js
 * @description async ensure symlink
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

function noop() {
}

/**
 * ensure - ensures symlink existence on file system
 * @param {String} srcPath - the source path of the symlink
 * @param {string} dstPath - the destination path to the symlink
 * @param {Object} opt  - used to create the symlink or modify it, options can be
 *                 fs {object} - to specify another file system module
 *                 type {string} - the type of the symlink
 * @param {Function} callback
 * @return {Error|string} the path to the destination symlink
 */
function ensure(srcPath, dstPath, opt, callback) {
    let options;
    if (ensureUtil.isFunction(opt)) {
        callback = opt;
        opt = {type: false};
    }
    callback = callback || noop;
    options = opt || {};

    if (!ensureUtil.isObject(options)) {
        options = {type: options};
    } else {
        if (ensureUtil.isFunction(options.type)) {
            options.type = false;
        }
    }

    options.fs = options.fs || enFs;
    options.fs.lstat(dstPath, (errDtStat) => {
        if (errDtStat) {
            symlinkPaths(srcPath, dstPath, (errSymlinkPaths, relative) => {
                if (errSymlinkPaths) {
                    return callback(errSymlinkPaths);
                }
                srcPath = relative.toDst;
                symlinkType(relative.toDst, options.type, (errType) => {
                    if (errType) {
                        return callback(errType);
                    }
                    ensureDir(nodePath.dirname(dstPath), (errDir)=> {
                        if (errDir) {
                            return callback(errDir);
                        }
                        options.fs.symlink(srcPath, dstPath, options.type, (err) => {
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

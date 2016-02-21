/**
 * @project enfsensure
 * @filename async/link.js
 * @description async ensure link
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
    ensureDir = require("./dir");

function noop() {
}

/**
 * ensure - ensures link existence on file system
 * @param {String} srcPath - the source path of the link
 * @param {string} dstPath - the destination path to the link
 * @param {Object} options  - used to create the file or modify it, options can be
 *                 fs {object} - to specify another file system module
 * @param {Function} callback
 * @return {Error|string} the path to the destination link
 */
function ensure(srcPath, dstPath, options, callback) {

    if (nodeUtil.isFunction(options)) {
        callback = options;
        options = {};
    }
    callback = callback || noop;
    options = options || {};
    options.fs = options.fs || enFs;

    options.fs.lstat(dstPath, function(errDstStat) {
        if (errDstStat) {
            options.fs.lstat(srcPath, function(errSrcStat) {
                if (errSrcStat) {
                    errSrcStat.message = errSrcStat.message.replace("lstat", "ensureLink");
                    return callback(errSrcStat);
                }
                createLink(srcPath, dstPath, options, callback);
            });
        } else {
            callback(null, dstPath);
        }
    });
}

function createLink(srcPath, dstPath, options, callback) {
    ensureDir(nodePath.dirname(dstPath), function(err) {
        if (err) {
            return callback(err);
        }
        options.fs.link(srcPath, dstPath, function(errLink) {
            callback(errLink, errLink ? null : dstPath);
        });
    });
}


module.exports = ensure;

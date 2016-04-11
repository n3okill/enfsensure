/**
 * @project enfsensure
 * @filename async/link.js
 * @description async ensure link
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

function noop() {
}

/**
 * ensure - ensures link existence on file system
 * @param {String} srcPath - the source path of the link
 * @param {string} dstPath - the destination path to the link
 * @param {Object} opt  - used to create the file or modify it, options can be
 *                 fs {object} - to specify another file system module
 * @param {Function} callback
 * @return {Error|string} the path to the destination link
 */
function ensure(srcPath, dstPath, opt, callback) {
    let options;

    if (ensureUtil.isFunction(opt)) {
        callback = opt;
        opt= {};
    }
    callback = callback || noop;
    options = opt || {};
    options.fs = options.fs || enFs;

    options.fs.lstat(dstPath, (errDstStat)=> {
        if (errDstStat) {
            options.fs.lstat(srcPath, (errSrcStat) => {
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
    ensureDir(nodePath.dirname(dstPath), (err) => {
        if (err) {
            return callback(err);
        }
        options.fs.link(srcPath, dstPath, (errLink) => {
            callback(errLink, errLink ? null : dstPath);
        });
    });
}


module.exports = ensure;

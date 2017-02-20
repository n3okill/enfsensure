/**
 * @project enfsensure
 * @filename sync/link.js
 * @description sync ensure link
 * @author Joao Parreira <joaofrparreira@gmail.com>
 * @copyright Copyright(c) 2016 Joao Parreira <joaofrparreira@gmail.com>
 * @licence Creative Commons Attribution 4.0 International License
 * @createdAt Created at 18-02-2016.
 * @version 0.0.2
 */


"use strict";

const nodePath = require("path");
const enFs = require("enfspatch");
const ensureDir = require("./dir");

/**
 * ensure - ensures link existence on file system
 * @param {String} srcPath - the source path of the link
 * @param {string} dstPath - the destination path to the link
 * @param {Object} opt  - used to create the file or modify it, options can be
 *                      options.fs {object} - to specify another file system module
 * @return {Error|string} the path to the destination link
 */
function ensure(srcPath, dstPath, opt) {
    let options;

    options = opt || {};
    options.fs = options.fs || enFs;

    try {
        options.fs.lstatSync(dstPath);
    } catch (errDstStat) {
        try {
            options.fs.lstatSync(srcPath);
        } catch (errSrcStat) {
            errSrcStat.message = errSrcStat.message.replace("lstat", "ensureLinkSync");
            throw errSrcStat;
        }
        ensureDir(nodePath.dirname(dstPath));
        return options.fs.linkSync(srcPath, dstPath);
    }
}


module.exports = ensure;

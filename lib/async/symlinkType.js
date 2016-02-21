/**
 * @project enfsensure
 * @filename async/symlinkType.js
 * @description async ensure symlink helper
 * @author Joao Parreira <joaofrparreira@gmail.com>
 * @copyright Copyright(c) 2016 Joao Parreira <joaofrparreira@gmail.com>
 * @licence Creative Commons Attribution 4.0 International License
 * @createdAt Created at 18-02-2016.
 * @version 0.0.1
 */

"use strict";

var nodeUtil = require("util"),
    enFs = require("enfspatch");

function noop() {
}

function symlinkType(srcPath, options, callback) {

    if (nodeUtil.isFunction(options)) {
        callback = options;
        options = {};
    }

    callback = callback || noop();
    options = options || {};

    if (!nodeUtil.isObject(options)) {
        options = {type: options};
    } else {
        if (nodeUtil.isFunction(options.type)) {
            options.type = false;
        }
    }

    options.fs = options.fs || enFs;

    if (options.type) {
        return callback(null, options.type);
    }
    options.fs.lstat(srcPath, function(err, stat) {
        if (err) {
            return callback(null, "file");
        }
        options.type = (stat && stat.isDirectory()) ? "dir" : "file";
        callback(null, options.type);
    });
}

module.exports = symlinkType;

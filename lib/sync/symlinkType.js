/**
 * @project enfsensure
 * @filename sync/symlinkType.js
 * @description sync ensure symlink helper
 * @author Joao Parreira <joaofrparreira@gmail.com>
 * @copyright Copyright(c) 2016 Joao Parreira <joaofrparreira@gmail.com>
 * @licence Creative Commons Attribution 4.0 International License
 * @createdAt Created at 18-02-2016.
 * @version 0.0.1
 */

"use strict";

var nodeUtil = require("util"),
    enFs = require("enfspatch");


function symlinkType(srcPath, options) {
    var stat;
    if (!nodeUtil.isObject(options)) {
        options = {type: options};
    } else {
        if (nodeUtil.isFunction(options.type)) {
            options.type = false;
        }
    }

    if (options.type) {
        return options.type;
    }
    options.fs = options.fs || enFs;
    try {
        stat = options.fs.lstatSync(srcPath);
    } catch (err) {
        return "file";
    }
    return (stat && stat.isDirectory()) ? "dir" : "file";
}


module.exports = symlinkType;

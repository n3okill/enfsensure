/**
 * @project enfsensure
 * @filename sync/symlinkType.js
 * @description sync ensure symlink helper
 * @author Joao Parreira <joaofrparreira@gmail.com>
 * @copyright Copyright(c) 2016 Joao Parreira <joaofrparreira@gmail.com>
 * @licence Creative Commons Attribution 4.0 International License
 * @createdAt Created at 18-02-2016.
 * @version 0.0.2
 */

"use strict";

const ensureUtil = require("../util");
const enFs = require("enfspatch");


function symlinkType(srcPath, options) {
    if (!ensureUtil.isObject(options)) {
        options = {type: options};
    } else {
        if (ensureUtil.isFunction(options.type)) {
            options.type = false;
        }
    }

    if (options.type) {
        return options.type;
    }
    options.fs = options.fs || enFs;
    try {
        const stat = options.fs.lstatSync(srcPath);
        return (stat && stat.isDirectory()) ? "dir" : "file";
    } catch (err) {
        return "file";
    }
}


module.exports = symlinkType;

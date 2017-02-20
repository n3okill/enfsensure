/**
 * @project enfsensure
 * @filename sync/file.js
 * @description sync ensure file
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
const ensureDirSync = require("./dir");


function ensureWriteStream(path, options) {
    return options.fs.createWriteStream(path, options.streamOptions);
}

function ensureWriteFile(file, options) {
    const fd = options.fs.openSync(file, options.append ? "a+" : "wx", options.mode);
    if (options.hasOwnProperty("data")) {
        options.fs.writeSync(fd, options.data, options.encoding);
    }
    options.fs.closeSync(fd);
}

function createFileSync(file, options) {
    ensureDirSync(nodePath.dirname(file), {fs: options.fs, mode: options.dirMode});
    if (options.stream) {
        return ensureWriteStream(file, options);
    } else {
        ensureWriteFile(file, options);
    }
}


/**
 * ensure - ensures file existence on file system
 * @param {String} path - the path to the file
 * @param {String|Object} opt  - used to create the file or modify it, options can be
 *  [mode] - to set the file mode
 *  [data] - to specify a content to the new file (this must be a string)
 *  [fs] - to specify another file system module
 *  [encoding] - to specify file encoding
 *  [dirMode] - the mode for the parent's directories if they don't exist
 *  [stream] - if true returns a ReadStream object
 *  [streamOptions] - options for the write stream
 *  [append] - if true data will be appended to the file
 * @return {Error|WriteStream} the path to the file or a WriteStream object
 */
function ensure(path, opt) {
    let options, stat;
    if (opt && !ensureUtil.isObject(opt)) {
        options = {mode: opt};
    }

    options = options || opt || {};
    options.fs = options.fs || enFs;
    options.mode = options.mode ? ensureUtil.isString(options.mode) ? parseInt(options.mode, 8) : options.mode : parseInt("0777", 8);
    options.stream = options.stream === true;
    options.append = options.append === true;

    try {
        stat = options.fs.statSync(path, options);
    } catch (err) {
        return createFileSync(path, options);
    }

    if (stat) {
        if (stat.isFile()) {
            if ((stat.mode & parseInt("0777", 8)) !== options.mode) {
                options.fs.chmodSync(path, options.mode);
            }
            if (options.stream) {
                return ensureWriteStream(path, options);
            } else if (options.append) {
                return ensureWriteFile(path, options);
            }
        } else {
            throw new Error("Item already exists and is not a file.");
        }
    }
}

module.exports = ensure;

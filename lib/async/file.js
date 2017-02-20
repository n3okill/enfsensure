/**
 * @project enfsensure
 * @filename async/file.js
 * @description async ensure file
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


function ensureWriteStream(path, options, callback) {
    try {
        return callback(null, options.fs.createWriteStream(path, options.streamOptions));
    } catch (err) {
        callback(err);
    }
}

function ensureWriteFile(file, options, callback) {
    options.fs.open(file, options.append ? "a+" : "wx", options.mode, (errOpen, fd) => {
        if (errOpen) {
            return callback(errOpen);
        }
        if ("data" in options) {
            options.fs.write(fd, options.data, options.encoding, (errWrite) => {
                if (errWrite) {
                    return callback(errWrite);
                }
                options.fs.close(fd, callback);
            });
        } else {
            options.fs.close(fd, callback);
        }
    });
}

function createFile(file, options, callback) {
    ensureDir(nodePath.dirname(file), {fs: options.fs, mode: options.dirMode}, (err) => {
        if (err) {
            return callback(err);
        }
        if (options.stream) {
            ensureWriteStream(file, options, callback);
        } else {
            ensureWriteFile(file, options, callback);
        }
    });
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
 *  [stream] - if true returns a WriteStream object
 *  [streamOptions] - options for the stream
 *  [append] - if true data will be appended to the file
 * @param {Function} callback
 * @return {Error|WriteStream} the path to the file or a WriteStream object
 */
function ensure(path, opt, callback) {

    if (ensureUtil.isFunction(opt)) {
        callback = opt;
        opt = {};
    }
    if (opt && !ensureUtil.isObject(opt)) {
        opt = {mode: opt};
    }
    callback = callback || noop;
    let options = opt || {};

    options.fs = options.fs || enFs;
    options.mode = options.mode ? ensureUtil.isString(options.mode) ? parseInt(options.mode, 8) : options.mode : parseInt("0777", 8);
    options.stream = options.stream === true;
    options.append = options.append === true;

    options.fs.stat(path, (err, stat) => {
        if (err) {
            createFile(path, options, callback);
        } else {
            if (stat.isFile()) {
                if ((stat.mode & parseInt("0777", 8)) !== options.mode) {
                    options.fs.chmod(path, options.mode, (errChmod) => {
                        if (errChmod) {
                            return callback(errChmod);
                        }
                        if (options.stream) {
                            return ensureWriteStream(path, options, callback);
                        } else if (options.append) {
                            return ensureWriteFile(path, options, callback);
                        }
                        callback(null);
                    });
                } else {
                    if (options.stream) {
                        return ensureWriteStream(path, options, callback);
                    } else if (options.append) {
                        return ensureWriteFile(path, options, callback);
                    }
                    return callback(null);
                }
            } else {
                callback(new Error("Item already exists and is not a file."));
            }
        }
    });
}


module.exports = ensure;

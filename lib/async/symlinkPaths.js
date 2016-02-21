/**
 * @project enfsensure
 * @filename async/symlinkPaths.js
 * @description async ensure symlink helper method
 * @author Joao Parreira <joaofrparreira@gmail.com>
 * @copyright Copyright(c) 2016 Joao Parreira <joaofrparreira@gmail.com>
 * @licence Creative Commons Attribution 4.0 International License
 * @createdAt Created at 18-02-2016.
 * @version 0.0.1
 */


"use strict";

var nodePath = require("path"),
    enFs = require("enfspatch");


/**
 * Function that returns two types of paths, one relative to symlink, and one
 * relative to the current working directory. Checks if path is absolute or
 * relative. If the path is relative, this function checks if the path is
 * relative to symlink or relative to current working directory. This is an
 * initiative to find a smarter `srcpath` to supply when building symlinks.
 * This allows you to determine which path to use out of one of three possible
 * types of source paths. The first is an absolute path. This is detected by
 * `path.isAbsolute()`. When an absolute path is provided, it is checked to
 * see if it exists. If it does it's used, if not an error is returned
 * (callback)/ thrown (sync). The other two options for `srcpath` are a
 * relative url. By default Node's `fs.symlink` works by creating a symlink
 * using `dstpath` and expects the `srcpath` to be relative to the newly
 * created symlink. If you provide a `srcpath` that does not exist on the file
 * system it results in a broken symlink. To minimize this, the function
 * checks to see if the 'relative to symlink' source file exists, and if it
 * does it will use it. If it does not, it checks if there's a file that
 * exists that is relative to the current working directory, if does its used.
 * This preserves the expectations of the original fs.symlink spec and adds
 * the ability to pass in `relative to current working direcotry` paths.
 */

function symlinkPaths(srcPath, dstPath, callback) {
    var dstDir, relativeToDst;
    if (nodePath.isAbsolute(srcPath)) {
        return enFs.lstat(srcPath, function(errSrcStat) {
            if (errSrcStat) {
                errSrcStat.message = errSrcStat.message.replace("lstat", "ensureSymlink");
                return callback(errSrcStat);
            }
            callback(null, {toCwd: srcPath, toDst: srcPath});
        });
    } else {
        dstDir = nodePath.dirname(dstPath);
        relativeToDst = nodePath.join(dstDir, srcPath);
        return enFs.lstat(relativeToDst, function(errRelative) {
            if (errRelative) {
                return enFs.lstat(srcPath, function(errSrcStat) {
                    if (errSrcStat) {
                        errSrcStat.message = errSrcStat.message.replace("lstat", "ensureSymlink");
                        return callback(errSrcStat);
                    }
                    callback(null, {toCwd: srcPath, toDst: nodePath.relative(dstDir, srcPath)});
                });
            } else {
                callback(null, {toCwd: relativeToDst, toDst: srcPath});
            }
        });
    }
}

module.exports = symlinkPaths;

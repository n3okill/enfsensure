/**
 * @project enfsensure
 * @filename ensure.js
 * @description entry point for enfsensure module
 * @author Joao Parreira <joaofrparreira@gmail.com>
 * @copyright Copyright(c) 2016 Joao Parreira <joaofrparreira@gmail.com>
 * @licence Creative Commons Attribution 4.0 International License
 * @createdAt Created at 18-02-2016.
 * @version 0.0.1
 */


"use strict";


module.exports = {
    ensureFile: require("./async/file"),
    ensureFileSync: require("./sync/file"),
    ensureDir: require("./async/dir"),
    ensureDirSync: require("./sync/dir"),
    ensureLink: require("./async/link"),
    ensureLinkSync: require("./sync/link"),
    ensureSymlink: require("./async/symlink"),
    ensureSymlinkSync: require("./sync/symlink")
};

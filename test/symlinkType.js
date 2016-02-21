/* global afterEach, beforeEach, describe, it, after, before, process */
/**
 * Created by n3okill on 22-12-2015.
 */

"use strict";


var nodePath = require("path"),
    nodeUtil = require("util"),
    nodeOs = require("os"),
    cwd = process.cwd(),
    rimraf = require("rimraf"),
    enFs = require("enfspatch"),
    enfsmkdirp = require("enfsmkdirp"),
    ensure = require("../"),
    ensureSymlinkType = require("../lib/async/symlinkType"),
    ensureSymlinkTypeSync = require("../lib/sync/symlinkType");

describe("enfsensure symlink type", function() {
    var tmpPath, tests;
    tmpPath = nodePath.join(nodeOs.tmpdir(), "enfsensuresymlinkType");

    tests = [
        // [{arguments} [srcpath, dirpath, [type] , result]
        // smart file type checking
        {src: "./foo.txt", result: "file"},
        {src: "./empty-dir", result: "dir"},
        {src: "./dir-foo/foo.txt", result: "file"},
        {src: "./dir-bar", result: "dir"},
        {src: "./dir-bar/bar.txt", result: "file"},
        {src: "./real-alpha/real-beta/real-gamma", result: "dir"},
        // force dir
        {src: "./foo.txt", force: "dir", result: "dir"},
        {src: "./empty-dir", force: "dir", result: "dir"},
        {src: "./dir-foo/foo.txt", force: "dir", result: "dir"},
        {src: "./dir-bar", force: "dir", result: "dir"},
        {src: "./dir-bar/bar.txt", force: "dir", result: "dir"},
        {src: "./real-alpha/real-beta/real-gamma", force: "dir", result: "dir"},
        // force file
        {src: "./foo.txt", force: "file", result: "file"},
        {src: "./empty-dir", force: "file", result: "file"},
        {src: "./dir-foo/foo.txt", force: "file", result: "file"},
        {src: "./dir-bar", force: "file", result: "file"},
        {src: "./dir-bar/bar.txt", force: "file", result: "file"},
        {src: "./real-alpha/real-beta/real-gamma", force: "file", result: "file"},
        // default for files or dirs that don't exist is file
        {src: "./missing.txt", result: "file"},
        {src: "./missing", result: "file"},
        {src: "./missing.txt", result: "file"},
        {src: "./missing", result: "file"},
        {src: "./empty-dir/missing.txt", result: "file"},
        {src: "./empty-dir/missing", result: "file"},
        {src: "./empty-dir/missing.txt", result: "file"},
        {src: "./empty-dir/missing", result: "file"},
        // when src doesnt exist and provided type 'file'
        {src: "./missing.txt", force: "file", result: "file"},
        {src: "./missing", force: "file", result: "file"},
        {src: "./missing.txt", force: "file", result: "file"},
        {src: "./missing", force: "file", result: "file"},
        {src: "./empty-dir/missing.txt", force: "file", result: "file"},
        {src: "./empty-dir/missing", force: "file", result: "file"},
        {src: "./empty-dir/missing.txt", force: "file", result: "file"},
        {src: "./empty-dir/missing", force: "file", result: "file"},
        // when src doesnt exist and provided type 'dir'
        {src: "./missing.txt", force: "dir", result: "dir"},
        {src: "./missing", force: "dir", result: "dir"},
        {src: "./missing.txt", force: "dir", result: "dir"},
        {src: "./missing", force: "dir", result: "dir"},
        {src: "./empty-dir/missing.txt", force: "dir", result: "dir"},
        {src: "./empty-dir/missing", force: "dir", result: "dir"},
        {src: "./empty-dir/missing.txt", force: "dir", result: "dir"},
        {src: "./empty-dir/missing", force: "dir", result: "dir"}
    ];


    before(function() {
        enfsmkdirp.mkdirpSync(tmpPath);
        process.chdir(tmpPath);
    });
    beforeEach(function() {
        enFs.writeFileSync(nodePath.join(tmpPath, "foo.txt"), "foo\n");
        ensure.ensureDirSync(nodePath.join(tmpPath, "empty-dir"));
        ensure.ensureFileSync(nodePath.join(tmpPath, "dir-foo", "foo.txt"), {data: "dir-foo\n"});
        ensure.ensureFileSync(nodePath.join(tmpPath, "dir-bar", "bar.txt"), {data: "dir-bar\n"});
        ensure.ensureDirSync(nodePath.join(tmpPath, "real-alpha", "real-beta", "real-gamma"));
    });
    afterEach(function() {
        rimraf.sync(tmpPath + nodePath.sep + "*");
    });
    after(function() {
        process.chdir(cwd);
        rimraf.sync(tmpPath);
    });

    describe("> async", function() {
        describe("symlinkType()", function() {
            tests.forEach(function(test) {
                it("should return '" + test.result + "' when src '" + test.src + "'", function(done) {
                    ensureSymlinkType(test.src, test.force || null, function(err, type) {
                        (err === null).should.be.equal(true);
                        type.should.be.equal(test.result);
                        done();
                    });
                });
            });
        });
    });
    describe("> sync", function() {
        describe("symlinkTypeSync()", function() {
            tests.forEach(function(test) {
                it("should return '" + test.result + "' when src '" + test.src + "'", function() {
                    ensureSymlinkTypeSync(test.src, test.force || null).should.be.equal(test.result);
                });
            });
        });
    });
});

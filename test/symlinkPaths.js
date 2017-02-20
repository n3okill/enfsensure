/* global afterEach, beforeEach, describe, it, after, before, process */
/**
 * Created by n3okill on 31-10-2015.
 */


"use strict";

const nodePath = require("path");
const nodeOs = require("os");
const enFs = require("enfspatch");
const enfsmkdirp = require("enfsmkdirp");
const cwd = process.cwd();
const rimraf = require("rimraf");
const ensure = require("../");
const ensureSymlinkPaths = require("../lib/async/symlinkPaths");
const ensureSymlinkPathsSync = require("../lib/sync/symlinkPaths");


describe("enfsensure symlink paths", function() {
    const tmpPath = nodePath.join(nodeOs.tmpdir(), "enfsensuresymlinkPaths");

    const tests = [
        {src: "foo.txt", dst: "symlink.txt", result: {toCwd: "foo.txt", toDst: "foo.txt"}},// smart && nodestyle
        {src: "foo.txt", dst: "empty-dir/symlink.txt", result: {toCwd: "foo.txt", toDst: "../foo.txt"}}, // smart
        {src: "../foo.txt", dst: "empty-dir/symlink.txt", result: {toCwd: "foo.txt", toDst: "../foo.txt"}},// nodestyle
        {src: "foo.txt", dst: "dir-bar/symlink.txt", result: {toCwd: "foo.txt", toDst: "../foo.txt"}},// smart
        {src: "../foo.txt", dst: "dir-bar/symlink.txt", result: {toCwd: "foo.txt", toDst: "../foo.txt"}},// nodestyle
        // this is to preserve node's symlink capability these arguments say create
        // a link to 'dir-foo/foo.txt' this works because it exists this is unlike
        // the previous example with 'empty-dir' because 'empty-dir/foo.txt' does not exist.
        {src: "foo.txt", dst: "dir-foo/symlink.txt", result: {toCwd: "dir-foo/foo.txt", toDst: "foo.txt"}},// nodestyle
        {
            src: "foo.txt",
            dst: "real-alpha/real-beta/real-gamma/symlink.txt",
            result: {toCwd: "foo.txt", toDst: "../../../foo.txt"}
        }
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


    // formats paths to pass on multiple operating systems
    tests.forEach(function(test) {
        test.src = nodePath.join(test.src);
        test.dst = nodePath.join(test.dst);
        test.result.toCwd = nodePath.join(test.result.toCwd);
        test.result.toDst = nodePath.join(test.result.toDst);
    });

    describe("> async", function() {
        describe('symlinkPaths()', function() {
            tests.forEach(function(test) {
                it("should return '" + JSON.stringify(test.result) + "' when src '" + test.src + "' and dst is '" + test.dst + "'", function(done) {
                    const args = [];
                    args.push(test.src);
                    args.push(test.dst);
                    args.push(function(err, relativePaths) {
                        (err === null).should.be.equal(true);
                        relativePaths.should.be.eql(test.result);
                        done();
                    });
                    ensureSymlinkPaths.apply(null, args);
                });
            });
        });
    });
    describe("> sync", function() {
        describe("symlinkPathsSync()", function() {
            tests.forEach(function(test) {
                const args = [];
                args.push(test.src);
                args.push(test.dst);
                it("should return '" + JSON.stringify(test.result) + "' when src '" + test.src + "' and dst is '" + test.dst + "'", function() {
                    const relativePaths = ensureSymlinkPathsSync.apply(null, args);
                    relativePaths.should.be.eql(test.result);
                });
            });
        });

    });
});


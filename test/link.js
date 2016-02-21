/* global afterEach, beforeEach, describe, it, after, before */
/**
 * Created by n3okill on 31-10-2015.
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
    ensureLink = ensure.ensureLink,
    ensureLinkSync = ensure.ensureLinkSync;


describe("enfsensure link", function() {
    var tmpPath, tests;
    tmpPath = nodePath.join(nodeOs.tmpdir(), "enfsensurelink");

    tests = [
        {src: "./foo.txt", dst: "./link.txt", fs: "file-success", ensure: "file-success"},
        {src: "./foo.txt", dst: "./dir-foo/link.txt", fs: "file-success", ensure: "file-success"},
        {src: "./foo.txt", dst: "./empty-dir/link.txt", fs: "file-success", ensure: "file-success"},
        {src: "./foo.txt", dst: "./real-alpha/link.txt", fs: "file-success", ensure: "file-success"},
        {src: "./foo.txt", dst: "./real-alpha/real-beta/link.txt", fs: "file-success", ensure: "file-success"},
        {
            src: "./foo.txt",
            dst: "./real-alpha/real-beta/real-gamma/link.txt",
            fs: "file-success",
            ensure: "file-success"
        },
        {src: "./foo.txt", dst: "./alpha/link.txt", fs: "file-error", ensure: "file-success"},
        {src: "./foo.txt", dst: "./alpha/beta/link.txt", fs: "file-error", ensure: "file-success"},
        {src: "./foo.txt", dst: "./alpha/beta/gamma/link.txt", fs: "file-error", ensure: "file-success"},
        {src: "./missing.txt", dst: "./link.txt", fs: "file-error", ensure: "file-error"},
        {src: "./missing.txt", dst: "./missing-dir/link.txt", fs: "file-error", ensure: "file-error"},
        {src: "./foo.txt", dst: "./link.txt", fs: "file-success", ensure: "file-success"},
        {src: "./dir-foo/foo.txt", dst: "./link.txt", fs: "file-success", ensure: "file-success"},
        {src: "./missing.txt", dst: "./link.txt", fs: "file-error", ensure: "file-error"},
        {src: "../foo.txt", dst: "./link.txt", fs: "file-error", ensure: "file-error"},
        {src: "../dir-foo/foo.txt", dst: "./link.txt", fs: "file-error", ensure: "file-error"},
        // error is thrown if destination path exists
        {src: "./foo.txt", dst: "./dir-foo/foo.txt", fs: "file-error", ensure: "file-dst-exists"}
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


    function FileSuccess(src, dst, fn, type) {
        var self = this;
        this.src = src;
        this.dst = dst;
        this.fn = fn;
        this.type = type;
        this.done = null;

        this.execute = function() {
            it("should create link file using src '" + self.src + "' and dst '" + self.dst + "'", function(done) {
                var args = [];
                self.done = done;
                args.push(self.src);
                args.push(self.dst);
                if (self.type === "async") {
                    args.push(self.result);
                    return self.fn.apply(null, args);
                } else {
                    try {
                        self.fn.apply(null, args);
                        self.result(null);
                    } catch (err) {
                        self.result(err);
                    }
                }
            });
        };
        this.result = function(err) {
            if (err) {
                return self.done(err);
            }
            enFs.readFile(self.src, "utf8", function(errReadFile, srcContent) {
                (errReadFile === null).should.be.equal(true);
                var dstDir, dstBasename;
                dstDir = nodePath.dirname(self.dst);
                dstBasename = nodePath.basename(self.dst);
                enFs.lstatSync(self.dst).isFile().should.be.equal(true);
                enFs.readFileSync(self.dst, "utf8").should.be.equal(srcContent);
                enFs.readdirSync(dstDir).indexOf(dstBasename).should.be.greaterThanOrEqual(0);
                self.done();
            });
        };
    }

    function FileError(src, dst, fn, type) {
        var self = this;
        this.src = src;
        this.dst = dst;
        this.fn = fn;
        this.type = type;
        this.done = null;
        this.statBefore = null;

        this.execute = function() {
            it("should throw error using '" + self.src + "' and dst '" + self.dst + "'", function(done) {
                self.done = done;
                enFs.stat(nodePath.dirname(self.dst), function(errBefore, stat) {
                    self.statBefore = stat;
                    var args = [];
                    args.push(self.src);
                    args.push(self.dst);
                    if (self.type === "async") {
                        args.push(self.result);
                        return self.fn.apply(null, args);
                    } else {
                        try {
                            self.fn.apply(null, args);
                            self.result(null);
                        } catch (err) {
                            self.result(err);
                        }
                    }
                });
            });
        };
        this.result = function(err) {
            err.should.be.instanceOf(Error);
            //ensure that directories aren't created if there's an error
            enFs.stat(nodePath.dirname(self.dst), function(errAfter, statAfter) {
                if (self.statBefore === undefined) {
                    (statAfter === undefined).should.be.equal(true);
                    return self.done();
                }
                self.statBefore.isDirectory().should.be.equal(statAfter.isDirectory());
                return self.done();
            });
        };
    }


    function FileDstExists(src, dst, fn, type) {
        var self = this;
        this.src = src;
        this.dst = dst;
        this.fn = fn;
        this.type = type;
        this.done = null;
        this.contentBefore = null;

        this.execute = function() {
            it("should do nothing using src '" + self.src + "' and dst '" + self.dst + "'", function(done) {
                self.done = done;
                self.contentBefore = enFs.readFileSync(self.dst, "utf8");

                var args = [];
                args.push(self.src);
                args.push(self.dst);
                if (self.type === "async") {
                    args.push(self.result);
                    return self.fn.apply(null, args);
                } else {
                    try {
                        self.fn.apply(null, args);
                        self.result(null);
                    } catch (err) {
                        self.result(err);
                    }
                }
            });
        };
        this.result = function(err) {
            (err === null).should.be.equal(true);
            enFs.readFileSync(self.dst, "utf8").should.be.equal(self.contentBefore);
            self.done();
        };
    }

    describe("> async", function() {
        describe("fs.link()", function() {
            tests.forEach(function(test) {
                switch (test.fs) {
                    case "file-success":
                        (new FileSuccess(test.src, test.dst, enFs.link, "async")).execute();
                        break;
                    case "file-error":
                        (new FileError(test.src, test.dst, enFs.link, "async")).execute();
                        break;
                    case "file-dst-exists":
                        (new FileDstExists(test.src, test.dst, enFs.link, "async")).execute();
                        break;
                    default:
                        throw new Error("Invalid option '" + test.fs + "'");
                }
            });
        });

        describe("ensureLink()", function() {
            tests.forEach(function(test) {
                switch (test.ensure) {
                    case "file-success":
                        (new FileSuccess(test.src, test.dst, ensureLink, "async")).execute();
                        break;
                    case "file-error":
                        (new FileError(test.src, test.dst, ensureLink, "async")).execute();
                        break;
                    case "file-dst-exists":
                        (new FileDstExists(test.src, test.dst, ensureLink, "async")).execute();
                        break;
                    default:
                        throw new Error("Invalid option '" + test.ensure + "'");
                }
            });
        });
    });

    describe("> sync", function() {
        describe("fs.linkSync()", function() {
            tests.forEach(function(test) {
                switch (test.fs) {
                    case "file-success":
                        (new FileSuccess(test.src, test.dst, enFs.linkSync, "sync")).execute();
                        break;
                    case "file-error":
                        (new FileError(test.src, test.dst, enFs.linkSync, "sync")).execute();
                        break;
                    case "file-dst-exists":
                        (new FileDstExists(test.src, test.dst, enFs.linkSync, "sync")).execute();
                        break;
                    default:
                        throw new Error("Invalid option '" + test.fs + "'");
                }
            });
        });

        describe("ensureLinkSync()", function() {
            tests.forEach(function(test) {
                switch (test.ensure) {
                    case "file-success":
                        (new FileSuccess(test.src, test.dst, ensureLinkSync, "sync")).execute();
                        break;
                    case "file-error":
                        (new FileError(test.src, test.dst, ensureLinkSync, "sync")).execute();
                        break;
                    case "file-dst-exists":
                        (new FileDstExists(test.src, test.dst, ensureLinkSync, "sync")).execute();
                        break;
                    default:
                        throw new Error("Invalid option '" + test.ensure + "'");
                }
            });
        });

    });
});


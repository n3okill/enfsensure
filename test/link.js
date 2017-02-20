/* global afterEach, beforeEach, describe, it, after, before */
/**
 * Created by n3okill on 31-10-2015.
 */


"use strict";

const nodePath = require("path");
const nodeOs = require("os");
const cwd = process.cwd();
const rimraf = require("rimraf");
const enFs = require("enfspatch");
const enfsmkdirp = require("enfsmkdirp");
const ensure = require("../");
const ensureLink = ensure.ensureLink;
const ensureLinkSync = ensure.ensureLinkSync;
const UtilLink = require("./utilLink");


describe("enfsensure link", function () {
    const tmpPath = nodePath.join(nodeOs.tmpdir(), "enfsensurelink");

    const tests = [
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

    before(function () {
        enfsmkdirp.mkdirpSync(tmpPath);
        process.chdir(tmpPath);
    });
    after(function () {
        process.chdir(cwd);
        rimraf.sync(tmpPath);
    });

    beforeEach(function () {
        enFs.writeFileSync(nodePath.join(tmpPath, "foo.txt"), "foo\n");
        ensure.ensureDirSync(nodePath.join(tmpPath, "empty-dir"));
        ensure.ensureFileSync(nodePath.join(tmpPath, "dir-foo", "foo.txt"), {data: "dir-foo\n"});
        ensure.ensureFileSync(nodePath.join(tmpPath, "dir-bar", "bar.txt"), {data: "dir-bar\n"});
        ensure.ensureDirSync(nodePath.join(tmpPath, "real-alpha", "real-beta", "real-gamma"));
    });
    afterEach(function (done) {
        rimraf(tmpPath + nodePath.sep + "*", done);
    });

    class FileSuccess extends UtilLink.FileSuccess {
        constructor(src, dst, fn, type) {
            super(src, dst, fn, type);
        }

        execute() {
            super.execute(`should create link file using '${this.src}' and dst '${this.dst}'`);
        }

        result(err) {
            if (err) {
                return this.done(err);
            }
            enFs.readFile(this.src, "utf8", (errReadFile, srcContent) => {
                (errReadFile === null).should.be.equal(true);
                const dstDir = nodePath.dirname(this.dst);
                const dstBasename = nodePath.basename(this.dst);
                enFs.lstatSync(this.dst).isFile().should.be.equal(true);
                enFs.readFileSync(this.dst, "utf8").should.be.equal(srcContent);
                enFs.readdirSync(dstDir).indexOf(dstBasename).should.be.greaterThanOrEqual(0);
                this.done();
            });
        }
    }

    class FileError extends UtilLink.FileError {
        constructor(src, dst, fn, type) {
            super(src, dst, fn, type);
        }

        execute() {
            super.execute(`should throw error using '${this.src}' and dst '${this.dst}'`);
        }

        result(err) {
            super.result(err);
        }
    }

    class FileDstExists extends UtilLink.FileDstExists {
        constructor(src, dst, fn, type) {
            super(src, dst, fn, type);
        }

        execute() {
            super.execute(`should do nothing using src '${this.src}' and dst '${this.dst}'`);
        }
        result(err){
            super.result(err);
        }
    }

    describe("> async", function () {
        describe("fs.link()", function () {
            tests.forEach(function (test) {
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

        describe("ensureLink()", function () {
            tests.forEach(function (test) {
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

    describe("> sync", function () {
        describe("fs.linkSync()", function () {
            tests.forEach(function (test) {
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

        describe("ensureLinkSync()", function () {
            tests.forEach(function (test) {
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


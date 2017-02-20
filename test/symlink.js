/* global afterEach, beforeEach, describe, it, after, before, process */
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
const ensureSymlink = ensure.ensureSymlink;
const ensureSymlinkSync = ensure.ensureSymlinkSync;
const ensureSymlinkPaths = require("../lib/async/symlinkPaths");


describe.only("enfsensure symlink", function () {
    const tmpPath = nodePath.join(nodeOs.tmpdir(), "enfsensuresymlink");
    const isWindows = /^win/.test(process.platform);
    const tests = [
        {src: "./foo.txt", dst: "./symlink.txt", fs: "file-success", ensure: "file-success"},
        {src: "../foo.txt", dst: "./empty-dir/symlink.txt", fs: "file-success", ensure: "file-success"},
        {src: "./foo.txt", dst: "./dir-foo/symlink.txt", fs: "file-success", ensure: "file-success"},
        {src: "./foo.txt", dst: "./empty-dir/symlink.txt", fs: "file-broken", ensure: "file-success"},
        {src: "./foo.txt", dst: "./real-alpha/symlink.txt", fs: "file-broken", ensure: "file-success"},
        {src: "./foo.txt", dst: "./real-alpha/real-beta/symlink.txt", fs: "file-broken", ensure: "file-success"},
        {
            src: "./foo.txt",
            dst: "./real-alpha/real-beta/real-gamma/symlink.txt",
            fs: "file-broken",
            ensure: "file-success"
        },
        {src: "./foo.txt", dst: "./alpha/symlink.txt", fs: "file-error", ensure: "file-success"},
        {src: "./foo.txt", dst: "./alpha/beta/symlink.txt", fs: "file-error", ensure: "file-success"},
        {src: "./foo.txt", dst: "./alpha/beta/gamma/symlink.txt", fs: "file-error", ensure: "file-success"},
        {src: "./missing.txt", dst: "./symlink.txt", fs: "file-broken", ensure: "file-error"},
        {src: "./missing.txt", dst: "./missing-dir/symlink.txt", fs: "file-error", ensure: "file-error"},
        {src: "./foo.txt", dst: "./dir-foo/foo.txt", fs: "file-error", ensure: "file-dst-exists"},
        {src: "./dir-foo", dst: "./symlink-dir-foo", fs: "dir-success", ensure: "dir-success"},
        {src: "./dir-bar", dst: "./dir-foo/symlink-dir-bar", fs: "dir-broken", ensure: "dir-success"},
        {src: "./dir-bar", dst: "./empty-dir/symlink-dir-bar", fs: "dir-broken", ensure: "dir-success"},
        {src: "./dir-bar", dst: "./real-alpha/symlink-dir-bar", fs: "dir-broken", ensure: "dir-success"},
        {src: "./dir-bar", dst: "./real-alpha/real-beta/symlink-dir-bar", fs: "dir-broken", ensure: "dir-success"},
        {
            src: "./dir-bar",
            dst: "./real-alpha/real-beta/real-gamma/symlink-dir-bar",
            fs: "dir-broken",
            ensure: "dir-success"
        },
        {src: "./dir-foo", dst: "./alpha/dir-foo", fs: "dir-error", ensure: "dir-success"},
        {src: "./dir-foo", dst: "./alpha/beta/dir-foo", fs: "dir-error", ensure: "dir-success"},
        {src: "./missing", dst: "./dir-foo/symlink-dir-missing", fs: "dir-broken", ensure: "dir-error"},
        {src: "./dir-foo", dst: "./real-alpha/real-beta", fs: "dir-error", ensure: "dir-dst-exists"}
    ];

    before(function () {
        enfsmkdirp.mkdirpSync(tmpPath);
        process.chdir(tmpPath);
    });
    after(function () {
        process.chdir(cwd);
        rimraf.sync(tmpPath);
    });

    /*class Test {
     constructor(src, dst, fn, type) {
     this.src = src;
     this.dst = dst;
     this.fn = fn;
     this.type = type;
     this.done = null;
     }

     execute() {
     throw new Error("Not implemented.");
     }

     result() {
     throw new Error("Not implemented.");
     }
     }*/

    /*class FileSuccess extends Test {
     constructor(src, dst, fn, type) {
     super(src, dst, fn, type);
     }

     execute() {
     it("should create symlink file using src '" + this.src + "' and dst '" + this.dst + "'", (done) => {
     const args = [];
     this.done = done;
     args.push(this.src);
     args.push(this.dst);
     if (this.type === "async") {
     args.push(this.result.bind(this));
     return this.fn.apply(this, args);
     } else {
     try {
     this.fn.apply(this, args);
     this.result(null);
     } catch (err) {
     this.result(err);
     }
     }
     });
     }

     result(err) {
     if (err && err.code === "EPERM" && isWindows && !windowsTestLink) {
     return this.done();
     }
     (err === null).should.be.equal(true);
     ensureSymlinkPaths(this.src, this.dst, (errPaths, relative) => {
     (errPaths === null).should.be.equal(true);
     enFs.readFile(relative.toCwd, "utf8", (errReadFile, srcContent) => {
     (errReadFile === null).should.be.equal(true);
     const dstDir = nodePath.dirname(this.dst);
     const dstBasename = nodePath.basename(this.dst);
     enFs.lstat(this.dst, (errStat, stat) => {
     (errStat === null).should.be.equal(true);
     enFs.readFile(this.dst, "utf8", (errReadDst, dstContent) => {
     (errReadDst === null).should.be.equal(true);
     enFs.readdir(dstDir, (errReaddir, dstDirContent) => {
     (errReaddir === null).should.be.equal(true);
     stat.isSymbolicLink().should.be.equal(true);
     srcContent.should.be.equal(dstContent);
     dstDirContent.indexOf(dstBasename).should.be.greaterThanOrEqual(0);
     this.done();
     });
     });
     });
     });

     });
     }
     }*/

    function FileSuccess(src, dst, fn, type) {
        const self = this;
        this.src = src;
        this.dst = dst;
        this.fn = fn;
        this.type = type;
        this.done = null;

        this.execute = function () {
            it("should create symlink file using src '" + src + "' and dst '" + dst + "'", function (done) {
                const args = [];
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
        this.result = function (err) {
            if (err && err.code === "EPERM" && isWindows) {
                return self.done();
            }
            (err === null).should.be.equal(true);
            ensureSymlinkPaths(self.src, self.dst, function (errPaths, relative) {
                (errPaths === null).should.be.equal(true);
                enFs.readFile(relative.toCwd, "utf8", function (errReadFile, srcContent) {
                    (errReadFile === null).should.be.equal(true);
                    const dstDir = nodePath.dirname(self.dst);
                    const dstBasename = nodePath.basename(self.dst);
                    enFs.lstat(self.dst, function (errStat, stat) {
                        (errStat === null).should.be.equal(true);
                        enFs.readFile(self.dst, "utf8", function (errReadDst, dstContent) {
                            (errReadDst === null).should.be.equal(true);
                            enFs.readdir(dstDir, function (errReaddir, dstDirContent) {
                                (errReaddir === null).should.be.equal(true);
                                stat.isSymbolicLink().should.be.equal(true);
                                srcContent.should.be.equal(dstContent);
                                dstDirContent.indexOf(dstBasename).should.be.greaterThanOrEqual(0);
                                self.done();
                            });
                        });
                    });
                });

            });
        };
    }

    /*class FileError extends Test {
     constructor(src, dst, fn, type) {
     super(src, dst, fn, type);
     this.statBefore = null;
     }

     execute() {
     it("should return error when creating symlink file using src '" + this.src + "' and dst '" + this.dst + "'", (done) => {
     this.done = done;
     enFs.stat(nodePath.dirname(this.dst), (errBefore, stat) => {
     this.statBefore = stat;
     const args = [];
     args.push(this.src);
     args.push(this.dst);
     if (this.type === "async") {
     args.push(this.result.bind(this));
     return this.fn.apply(null, args);
     } else {
     try {
     this.fn.apply(null, args);
     this.result(null);
     } catch (err) {
     this.result(err);
     }
     }
     });
     });
     }

     result(err) {
     if (err && err.code === "EPERM" && isWindows && !windowsTestLink) {
     return this.done();
     }
     err.should.be.instanceOf(Error);
     //ensure that directories aren't created if there's an error
     enFs.stat(nodePath.dirname(this.dst), (errAfter, statAfter) => {
     if (typeof this.statBefore === "undefined") {
     (typeof statAfter === "undefined").should.be.equal(true);
     return this.done();
     }
     this.statBefore.isDirectory().should.be.equal(statAfter.isDirectory());
     return this.done();
     });
     }
     }*/
    function FileError(src, dst, fn, type) {
        const self = this;
        this.src = src;
        this.dst = dst;
        this.fn = fn;
        this.type = type;
        this.done = null;
        this.statBefore = null;

        this.execute = function () {
            it("should return error when creating symlink file using src '" + self.src + "' and dst '" + self.dst + "'", function (done) {
                self.done = done;
                enFs.stat(nodePath.dirname(self.dst), function (errBefore, stat) {
                    self.statBefore = stat;
                    const args = [];
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

        this.result = function (err) {
            if (err && err.code === "EPERM" && isWindows) {
                return self.done();
            }
            err.should.be.instanceOf(Error);
            //ensure that directories aren't created if there's an error
            enFs.stat(nodePath.dirname(self.dst), function (errAfter, statAfter) {
                if (typeof self.statBefore === "undefined") {
                    (typeof statAfter === "undefined").should.be.equal(true);
                    return self.done();
                }
                self.statBefore.isDirectory().should.be.equal(statAfter.isDirectory());
                return self.done();
            });
        };
    }

    /*class FileDstExists extends Test {
     constructor(src, dst, fn, type) {
     super(src, dst, fn, type);
     this.contentBefore = null;
     }

     execute() {
     it("should do nothing using src '" + this.src + "' and dst '" + this.dst + "'", (done) => {
     this.done = done;
     enFs.readFile(this.dst, "utf8", (errBefore, contentBefore) => {
     this.contentBefore = contentBefore;

     const args = [];
     args.push(this.src);
     args.push(this.dst);
     if (this.type === "async") {
     args.push(this.result.bind(this));
     return this.fn.apply(null, args);
     } else {
     try {
     this.fn.apply(null, args);
     this.result(null);
     } catch (err) {
     this.result(err);
     }
     }
     });
     });
     }

     result(err) {
     if (err && err.code === "EPERM" && isWindows && !windowsTestLink) {
     return this.done();
     }
     (err === null).should.be.equal(true);
     enFs.readFile(this.dst, "utf8", (errAfter, contentAfter) => {
     this.contentBefore.should.be.equal(contentAfter);
     return this.done();
     });
     }
     }*/

    function FileDstExists(src, dst, fn, type) {
        const self = this;
        this.src = src;
        this.dst = dst;
        this.fn = fn;
        this.type = type;
        this.done = null;
        this.contentBefore = null;

        this.execute = function () {
            it("should do nothing using src '" + self.src + "' and dst '" + self.dst + "'", function (done) {
                self.done = done;
                enFs.readFile(self.dst, "utf8", function (errBefore, contentBefore) {
                    self.contentBefore = contentBefore;

                    const args = [];
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
        this.result = function (err) {
            if (err && err.code === "EPERM" && isWindows) {
                return self.done();
            }
            (err === null).should.be.equal(true);
            enFs.readFile(self.dst, "utf8", function (errAfter, contentAfter) {
                self.contentBefore.should.be.equal(contentAfter);
                return self.done();
            });
        };
    }

    /*class FileBroken extends Test {
     constructor(src, dst, fn, type) {
     super(src, dst, fn, type);
     }

     execute() {
     it("should create broken symlink file using src '" + this.src + "' and dst '" + this.dst + "'", (done) => {
     this.done = done;
     const args = [];
     args.push(this.src);
     args.push(this.dst);
     if (this.type === "async") {
     args.push(this.result.bind(this));
     return this.fn.apply(null, args);
     } else {
     try {
     this.fn.apply(null, args);
     this.result(null);
     } catch (err) {
     this.result(err);
     }
     }
     });
     }

     result(err) {
     if (err && err.code === "EPERM" && isWindows && !windowsTestLink) {
     return this.done();
     }
     (err === null).should.be.equal(true);
     enFs.lstat(this.dst, (errStat, stat) => {
     (errStat === null).should.be.equal(true);
     enFs.readdir(nodePath.dirname(this.dst), (errReaddir, contents) =>{
     (errReaddir === null).should.be.equal(true);
     stat.isSymbolicLink().should.be.equal(true);
     contents.indexOf(nodePath.basename(this.dst)).should.be.greaterThanOrEqual(0);
     enFs.readFile(this.dst, "utf8", (errReadFile) => {
     errReadFile.should.be.instanceOf(Error);
     return this.done();
     });
     });
     });
     }
     }*/

    function FileBroken(src, dst, fn, type) {
        const self = this;
        this.src = src;
        this.dst = dst;
        this.fn = fn;
        this.type = type;
        this.done = null;

        this.execute = function () {
            it("should create broken symlink file using src '" + self.src + "' and dst '" + self.dst + "'", function (done) {
                self.done = done;
                const args = [];
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
        this.result = function (err) {
            if (err && err.code === "EPERM" && isWindows) {
                return self.done();
            }
            if(err) {
                throw err;
            }
            (err === null).should.be.equal(true);
            enFs.lstat(self.dst, function (errStat, stat) {
                (errStat === null).should.be.equal(true);
                enFs.readdir(nodePath.dirname(self.dst), function (errReaddir, contents) {
                    (errReaddir === null).should.be.equal(true);
                    stat.isSymbolicLink().should.be.equal(true);
                    contents.indexOf(nodePath.basename(self.dst)).should.be.greaterThanOrEqual(0);
                    enFs.readFile(self.dst, "utf8", function (errReadFile) {
                        errReadFile.should.be.instanceOf(Error);
                        return self.done();
                    });
                });
            });
        };
    }

    function DirSuccess(src, dst, fn, type) {
        const self = this;
        this.src = src;
        this.dst = dst;
        this.fn = fn;
        this.type = type;
        this.done = null;

        this.execute = function () {
            it("should create symlink dir using src '" + self.src + "' and dst '" + self.dst + "'", function (done) {
                const args = [];
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
        this.result = function (err) {
            if (err && err.code === "EPERM" && isWindows) {
                return self.done();
            }
            (err === null).should.be.equal(true);
            ensureSymlinkPaths(self.src, self.dst, function (errPaths, relative) {
                (errPaths === null).should.be.equal(true);
                enFs.readdir(relative.toCwd, function (errReadDir, srcContent) {
                    (errReadDir === null).should.be.equal(true);
                    enFs.lstat(self.dst, function (errStat, stat) {
                        (errStat === null).should.be.equal(true);
                        enFs.readdir(self.dst, function (errReadDst, dstContent) {
                            (errReadDst === null).should.be.equal(true);
                            enFs.readdir(nodePath.dirname(self.dst), function (errReadDir2, dstDirContent) {
                                (errReadDir2 === null).should.be.equal(true);
                                stat.isSymbolicLink().should.be.equal(true);
                                srcContent.should.be.eql(dstContent);
                                dstDirContent.indexOf(nodePath.basename(self.dst)).should.be.greaterThanOrEqual(0);
                                self.done();
                            });
                        });
                    });
                });
            });
        };
    }

    function DirBroken(src, dst, fn, type) {
        const self = this;
        this.src = src;
        this.dst = dst;
        this.fn = fn;
        this.type = type;
        this.done = null;

        this.execute = function () {
            it("should create broken symlink dir using src '" + self.src + "' and dst '" + self.dst + "'", function (done) {
                self.done = done;
                const args = [];
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
        this.result = function (err) {
            if (err && err.code === "EPERM" && isWindows) {
                return self.done();
            }
            (err === null).should.be.equal(true);
            enFs.lstat(self.dst, function (errStat, stat) {
                (errStat === null).should.be.equal(true);
                enFs.readdir(nodePath.dirname(self.dst), function (errReaddir, contents) {
                    (errReaddir === null).should.be.equal(true);
                    stat.isSymbolicLink().should.be.equal(true);
                    contents.indexOf(nodePath.basename(self.dst)).should.be.greaterThanOrEqual(0);
                    enFs.readdir(self.dst, function (errReadFile) {
                        if (errReadFile) {
                            errReadFile.should.be.instanceOf(Error);
                        }
                        return self.done();
                    });
                });
            });
        };
    }

    function DirError(src, dst, fn, type) {
        const self = this;
        this.src = src;
        this.dst = dst;
        this.fn = fn;
        this.type = type;
        this.done = null;
        this.statBefore = null;

        this.execute = function () {
            it("should return error when creating symlink dir using src '" + self.src + "' and dst '" + self.dst + "'", function (done) {
                self.done = done;
                enFs.stat(nodePath.dirname(self.dst), function (errBefore, stat) {
                    self.statBefore = stat;
                    const args = [];
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
        this.result = function (err) {
            if (err && err.code === "EPERM" && isWindows) {
                return self.done();
            }
            err.should.be.instanceOf(Error);
            //ensure that directories aren't created if there's an error
            enFs.stat(nodePath.dirname(self.dst), function (errAfter, statAfter) {
                if (self.statBefore === undefined) {
                    (statAfter === undefined).should.be.equal(true);
                    return self.done();
                }
                self.statBefore.isDirectory().should.be.equal(statAfter.isDirectory());
                return self.done();
            });
        };
    }

    function DirDstExists(src, dst, fn, type) {
        const self = this;
        this.src = src;
        this.dst = dst;
        this.fn = fn;
        this.type = type;
        this.done = null;
        this.contentBefore = null;

        this.execute = function () {
            it("should do nothing using src '" + self.src + "' and dst '" + self.dst + "'", function (done) {
                self.done = done;
                enFs.readdir(self.dst, function (errBefore, contentBefore) {
                    self.contentBefore = contentBefore;

                    const args = [];
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
        this.result = function (err) {
            if (err && err.code === "EPERM" && isWindows) {
                return self.done();
            }
            (err === null).should.be.equal(true);
            enFs.readdir(self.dst, function (errAfter, contentAfter) {
                self.contentBefore.should.be.eql(contentAfter);
                return self.done();
            });
        };
    }

    describe("> async", function () {
        describe("fs.symlink()", function () {
            beforeEach(function () {
                enFs.writeFileSync(nodePath.join(tmpPath, "foo.txt"), "foo\n");
                ensure.ensureDirSync(nodePath.join(tmpPath, "empty-dir"));
                ensure.ensureFileSync(nodePath.join(tmpPath, "dir-foo", "foo.txt"), {data: "dir-foo\n"});
                ensure.ensureFileSync(nodePath.join(tmpPath, "dir-bar", "bar.txt"), {data: "dir-bar\n"});
                ensure.ensureDirSync(nodePath.join(tmpPath, "real-alpha", "real-beta", "real-gamma"));
            });
            afterEach(function () {
                rimraf.sync(tmpPath + nodePath.sep + "*");
            });
            tests.forEach(function (test) {
                switch (test.fs) {
                    case "file-success":
                        (new FileSuccess(test.src, test.dst, enFs.symlink, "async")).execute();
                        break;
                    case "file-broken":
                        (new FileBroken(test.src, test.dst, enFs.symlink, "async")).execute();
                        break;
                    case "file-error":
                        (new FileError(test.src, test.dst, enFs.symlink, "async")).execute();
                        break;
                    case "file-dst-exists":
                        (new FileDstExists(test.src, test.dst, enFs.symlink, "async")).execute();
                        break;
                    case "dir-success":
                        (new DirSuccess(test.src, test.dst, enFs.symlink, "async")).execute();
                        break;
                    case "dir-broken":
                        (new DirBroken(test.src, test.dst, enFs.symlink, "async")).execute();
                        break;
                    case "dir-error":
                        (new DirError(test.src, test.dst, enFs.symlink, "async")).execute();
                        break;
                    case "dir-dst-exists":
                        (new DirDstExists(test.src, test.dst, enFs.symlink, "async")).execute();
                        break;
                    default:
                        throw new Error("Invalid option '" + test.fs + "'");
                }
            });
        });

        describe("ensureSymlink()", function () {
            beforeEach(function () {
                enFs.writeFileSync(nodePath.join(tmpPath, "foo.txt"), "foo\n");
                ensure.ensureDirSync(nodePath.join(tmpPath, "empty-dir"));
                ensure.ensureFileSync(nodePath.join(tmpPath, "dir-foo", "foo.txt"), {data: "dir-foo\n"});
                ensure.ensureFileSync(nodePath.join(tmpPath, "dir-bar", "bar.txt"), {data: "dir-bar\n"});
                ensure.ensureDirSync(nodePath.join(tmpPath, "real-alpha", "real-beta", "real-gamma"));
            });
            afterEach(function () {
                rimraf.sync(tmpPath + nodePath.sep + "*");
            });
            tests.forEach(function (test) {
                switch (test.ensure) {
                    case "file-success":
                        (new FileSuccess(test.src, test.dst, ensureSymlink, "async")).execute();
                        break;
                    case "file-broken":
                        (new FileBroken(test.src, test.dst, ensureSymlink, "async")).execute();
                        break;
                    case "file-error":
                        (new FileError(test.src, test.dst, ensureSymlink, "async")).execute();
                        break;
                    case "file-dst-exists":
                        (new FileDstExists(test.src, test.dst, ensureSymlink, "async")).execute();
                        break;
                    case "dir-success":
                        (new DirSuccess(test.src, test.dst, ensureSymlink, "async")).execute();
                        break;
                    case "dir-broken":
                        (new DirBroken(test.src, test.dst, ensureSymlink, "async")).execute();
                        break;
                    case "dir-error":
                        (new DirError(test.src, test.dst, ensureSymlink, "async")).execute();
                        break;
                    case "dir-dst-exists":
                        (new DirDstExists(test.src, test.dst, ensureSymlink, "async")).execute();
                        break;
                    default:
                        throw new Error("Invalid option '" + test.fs + "'");
                }
            });
        });
    });

    describe("> sync", function () {
        describe("fs.symlinkSync()", function () {
            beforeEach(function () {
                enFs.writeFileSync(nodePath.join(tmpPath, "foo.txt"), "foo\n");
                ensure.ensureDirSync(nodePath.join(tmpPath, "empty-dir"));
                ensure.ensureFileSync(nodePath.join(tmpPath, "dir-foo", "foo.txt"), {data: "dir-foo\n"});
                ensure.ensureFileSync(nodePath.join(tmpPath, "dir-bar", "bar.txt"), {data: "dir-bar\n"});
                ensure.ensureDirSync(nodePath.join(tmpPath, "real-alpha", "real-beta", "real-gamma"));
            });
            afterEach(function () {
                rimraf.sync(tmpPath + nodePath.sep + "*");
            });
            tests.forEach(function (test) {
                switch (test.fs) {
                    case "file-success":
                        (new FileSuccess(test.src, test.dst, enFs.symlinkSync, "sync")).execute();
                        break;
                    case "file-broken":
                        (new FileBroken(test.src, test.dst, enFs.symlinkSync, "sync")).execute();
                        break;
                    case "file-error":
                        (new FileError(test.src, test.dst, enFs.symlinkSync, "sync")).execute();
                        break;
                    case "file-dst-exists":
                        (new FileDstExists(test.src, test.dst, enFs.symlinkSync, "sync")).execute();
                        break;
                    case "dir-success":
                        (new DirSuccess(test.src, test.dst, enFs.symlinkSync, "sync")).execute();
                        break;
                    case "dir-broken":
                        (new DirBroken(test.src, test.dst, enFs.symlinkSync, "sync")).execute();
                        break;
                    case "dir-error":
                        (new DirError(test.src, test.dst, enFs.symlinkSync, "sync")).execute();
                        break;
                    case "dir-dst-exists":
                        (new DirDstExists(test.src, test.dst, enFs.symlinkSync, "sync")).execute();
                        break;
                    default:
                        throw new Error("Invalid option '" + test.fs + "'");
                }
            });
        });

        describe("ensureSymlinkSync()", function () {
            beforeEach(function () {
                enFs.writeFileSync(nodePath.join(tmpPath, "foo.txt"), "foo\n");
                ensure.ensureDirSync(nodePath.join(tmpPath, "empty-dir"));
                ensure.ensureFileSync(nodePath.join(tmpPath, "dir-foo", "foo.txt"), {data: "dir-foo\n"});
                ensure.ensureFileSync(nodePath.join(tmpPath, "dir-bar", "bar.txt"), {data: "dir-bar\n"});
                ensure.ensureDirSync(nodePath.join(tmpPath, "real-alpha", "real-beta", "real-gamma"));
            });
            afterEach(function () {
                rimraf.sync(tmpPath + nodePath.sep + "*");
            });
            tests.forEach(function (test) {
                switch (test.ensure) {
                    case "file-success":
                        (new FileSuccess(test.src, test.dst, ensureSymlinkSync, "sync")).execute();
                        break;
                    case "file-broken":
                        (new FileBroken(test.src, test.dst, ensureSymlinkSync, "sync")).execute();
                        break;
                    case "file-error":
                        (new FileError(test.src, test.dst, ensureSymlinkSync, "sync")).execute();
                        break;
                    case "file-dst-exists":
                        (new FileDstExists(test.src, test.dst, ensureSymlinkSync, "sync")).execute();
                        break;
                    case "dir-success":
                        (new DirSuccess(test.src, test.dst, ensureSymlinkSync, "sync")).execute();
                        break;
                    case "dir-broken":
                        (new DirBroken(test.src, test.dst, ensureSymlinkSync, "sync")).execute();
                        break;
                    case "dir-error":
                        (new DirError(test.src, test.dst, ensureSymlinkSync, "sync")).execute();
                        break;
                    case "dir-dst-exists":
                        (new DirDstExists(test.src, test.dst, ensureSymlinkSync, "sync")).execute();
                        break;
                    default:
                        throw new Error("Invalid option '" + test.fs + "'");
                }
            });
        });
    });
});

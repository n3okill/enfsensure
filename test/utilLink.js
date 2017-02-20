/**
 * @project enf
 * @filename utilSymlink.js
 * @author Joao Parreira <joaofrparreira@gmail.com>
 * @copyright Copyright(c) 2017 Joao Parreira <joaofrparreira@gmail.com>
 * @licence Creative Commons Attribution 4.0 International License
 * @createdAt Created at 20-02-2017
 * @version 0.0.1
 * @description
 */

/* global it*/

"use strict";

const nodePath = require("path");
const enFs = require("enfspatch");

class Test {
    constructor(src, dst, fn, type) {
        this.src = src;
        this.dst = dst;
        this.fn = fn;
        this.type = type;
        this.done = null;
    }

    execute(done) {
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
    }

    result() {
        throw new Error("Not implemented.");
    }
}

class FileSuccess extends Test {
    constructor(src, dst, fn, type) {
        super(src, dst, fn, type);
    }

    execute(msg) {
        it(msg, (done) => {
            super.execute(done);
        });
    }

    result(err) {
        super.result();
    }
}


class FileError extends Test {
    constructor(src, dst, fn, type) {
        super(src, dst, fn, type);
        this.statBefore = null;
    }

    execute(msg, done) {
        it(msg, (done) => {
            enFs.stat(nodePath.dirname(this.dst), (errBefore, stat) => {
                this.statBefore = stat;
                super.execute(done);
            });
        });
    }

    result(err) {
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
}


class FileDstExists extends Test {
    constructor(src, dst, fn, type) {
        super(src, dst, fn, type);
        this.contentBefore = null;
    }

    execute(msg) {
        it(msg, (done) => {
            enFs.readFile(this.dst, "utf8", (errBefore, contentBefore) => {
                this.contentBefore = contentBefore;
                super.execute(done);
            });
        });
    }

    result(err) {
        (err === null).should.be.equal(true);
        enFs.readFile(this.dst, "utf8", (errAfter, contentAfter) => {
            this.contentBefore.should.be.equal(contentAfter);
            return this.done();
        });
    }
}

class FileBroken extends Test {
    constructor(src, dst, fn, type) {
        super(src, dst, fn, type);
    }

    execute(msg) {
        it(msg, (done) => {
            super.execute(done);
        });
    }

    result(err) {
        super.result();
    }
}

class DirSuccess extends Test {
    constructor(src, dst, fn, type) {
        super(src, dst, fn, type);
    }

    execute() {
        it("should create symlink dir using src '" + this.src + "' and dst '" + this.dst + "'", (done) => {
            super.execute(done);
        });
    }

    result(err) {
        if (err && err.code === "EPERM" && isWindows) {
            return this.done();
        }
        (err === null).should.be.equal(true);
        ensureSymlinkPaths(this.src, this.dst, (errPaths, relative) => {
            (errPaths === null).should.be.equal(true);
            enFs.readdir(relative.toCwd, (errReadDir, srcContent) => {
                (errReadDir === null).should.be.equal(true);
                enFs.lstat(this.dst, (errStat, stat) => {
                    (errStat === null).should.be.equal(true);
                    enFs.readdir(this.dst, (errReadDst, dstContent) => {
                        (errReadDst === null).should.be.equal(true);
                        enFs.readdir(nodePath.dirname(this.dst), (errReadDir2, dstDirContent) => {
                            (errReadDir2 === null).should.be.equal(true);
                            stat.isSymbolicLink().should.be.equal(true);
                            srcContent.should.be.eql(dstContent);
                            dstDirContent.indexOf(nodePath.basename(this.dst)).should.be.greaterThanOrEqual(0);
                            this.done();
                        });
                    });
                });
            });
        });
    }
}

class DirBroken extends Test {
    constructor(src, dst, fn, type) {
        super(src, dst, fn, type);
    }

    execute() {
        it("should create broken symlink dir using src '" + this.src + "' and dst '" + this.dst + "'", (done) => {
            super.execute(done);
        });
    }

    result(err) {
        if (err && err.code === "EPERM" && isWindows) {
            return this.done();
        }
        (err === null).should.be.equal(true);
        enFs.lstat(this.dst, (errStat, stat) => {
            (errStat === null).should.be.equal(true);
            enFs.readdir(nodePath.dirname(this.dst), (errReaddir, contents) => {
                (errReaddir === null).should.be.equal(true);
                stat.isSymbolicLink().should.be.equal(true);
                contents.indexOf(nodePath.basename(this.dst)).should.be.greaterThanOrEqual(0);
                enFs.readdir(this.dst, (errReadFile) => {
                    if (errReadFile) {
                        errReadFile.should.be.instanceOf(Error);
                    }
                    return this.done();
                });
            });
        });
    }
}

class DirError extends Test {
    constructor(src, dst, fn, type) {
        super(src, dst, fn, type);
    }

    execute() {
        it("should return error when creating symlink dir using src '" + this.src + "' and dst '" + this.dst + "'", (done) => {
            enFs.stat(nodePath.dirname(this.dst), (errBefore, stat) => {
                this.statBefore = stat;
                super.execute(done);
            });
        });
    }

    result(err) {
        if (err && err.code === "EPERM" && isWindows) {
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
}

class DirDstExists extends Test {
    constructor(src, dst, fn, type) {
        super(src, dst, fn, type);
    }

    execute() {
        it("should do nothing using src '" + this.src + "' and dst '" + this.dst + "'", (done) => {
            enFs.readdir(this.dst, (errBefore, contentBefore) => {
                this.contentBefore = contentBefore;
                super.execute(done);
            });
        });
    }

    result(err) {
        if (err && err.code === "EPERM" && isWindows) {
            return this.done();
        }
        (err === null).should.be.equal(true);
        enFs.readdir(this.dst, (errAfter, contentAfter) => {
            this.contentBefore.should.be.eql(contentAfter);
            return this.done();
        });
    }
}

module.exports = {
    Test,
    FileSuccess,
    FileError,
    FileDstExists,
    FileBroken,
    DirSuccess,
    DirBroken,
    DirError,
    DirDstExists
};
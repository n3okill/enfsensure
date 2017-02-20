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
                this.result.call(this, null);
            } catch (err) {
                this.result.call(this, err);
            }
        }
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
}


class FileError extends Test {
    constructor(src, dst, fn, type) {
        super(src, dst, fn, type);
        this.statBefore = null;
    }

    execute(msg, done) {
        let execute = super.execute.bind(this);
        let self = this;
        it(msg, (done) => {
            enFs.stat(nodePath.dirname(this.dst), (errBefore, stat) => {
                self.statBefore = stat;
                execute(done);
            });
        });
    }
}


class FileDstExists extends Test {
    constructor(src, dst, fn, type) {
        super(src, dst, fn, type);
        this.contentBefore = null;
    }

    execute(msg) {
        let execute = super.execute.bind(this);
        let self = this;
        it(msg, (done) => {
            enFs.readFile(this.dst, "utf8", (errBefore, contentBefore) => {
                self.contentBefore = contentBefore;
                execute(done);
            });
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
/* global afterEach, beforeEach, describe, it, after, before */
/**
 * Created by JParreir on 06-10-2015.
 */


"use strict";

var nodePath = require("path"),
    nodeOs = require("os"),
    rimraf = require("rimraf"),
    enfsmkdirp = require("enfsmkdirp"),
    enFs = require("enfspatch"),
    ensure = require("../"),
    cwd = process.cwd(),
    ensureFile = ensure.ensureFile,
    ensureFileSync = ensure.ensureFileSync,
    ensureDir = ensure.ensureDir,
    ensureDirSync = ensure.ensureDirSync;


describe("enfsensure create", function() {
    var tmpPath;
    tmpPath = nodePath.join(nodeOs.tmpdir(), "enfsensurecreate");

    before(function() {
        enfsmkdirp.mkdirpSync(tmpPath);
        process.chdir(tmpPath);
    });
    afterEach(function() {
        rimraf.sync(tmpPath + nodePath.sep + "*");
    });
    after(function() {
        process.chdir(cwd);
        rimraf.sync(tmpPath);
    });
    describe("> async", function() {
        describe("> when the file and directory does not exist", function() {
            it("should create the file", function(done) {
                var file = nodePath.join(tmpPath, Math.random() + "test", Math.random() + ".txt");
                enFs.existStatSync(file).should.be.equal(false);
                ensureFile(file, function(errEnsure) {
                    (errEnsure === null).should.be.equal(true);
                    enFs.statSync(file).isFile().should.be.equal(true);
                    done();
                });
            });
        });
        describe("> when the file does exist", function() {
            it("should not modify the file", function(done) {
                var file = nodePath.join(tmpPath, Math.random() + "test", Math.random() + ".txt");
                ensureDir(nodePath.dirname(file), function(errEnsureDir) {
                    (errEnsureDir === null).should.be.equal(true);
                    enFs.writeFileSync(file, "hello world!", "utf8");
                    ensureFile(file, function(errEnsureFile) {
                        (errEnsureFile === null).should.be.equal(true);
                        enFs.readFileSync(file, "utf8").should.be.equal("hello world!");
                        done();
                    });
                });
            });
            it("should append to the file", function(done) {
                var file = nodePath.join(tmpPath, Math.random() + "test", Math.random() + ".txt");
                ensureDir(nodePath.dirname(file), function(errEnsureDir) {
                    (errEnsureDir === null).should.be.equal(true);
                    enFs.writeFileSync(file, "hello world!", "utf8");
                    ensureFile(file, {data: " new content", append: true}, function(errEnsureFile) {
                        (errEnsureFile === null).should.be.equal(true);
                        var data = enFs.readFileSync(file, "utf8");
                        data.should.be.equal("hello world! new content");
                        done();
                    });
                });
            });
        });
    });
    describe("> sync", function() {
        describe("> when the file and directory does not exist", function() {
            it("should create the file", function() {
                var file = nodePath.join(tmpPath, Math.random() + "test", Math.random() + ".txt");
                enFs.existStatSync(file).should.be.equal(false);
                ensureFileSync(file);
                enFs.statSync(file).isFile().should.be.equal(true);
            });
        });
        describe("> when the file does exist", function() {
            it("should not modify the file", function() {
                var file = nodePath.join(tmpPath, Math.random() + "test", Math.random() + ".txt");
                ensureDirSync(nodePath.dirname(file));
                enFs.writeFileSync(file, "Hello World!");
                ensureFileSync(file);
                enFs.readFileSync(file, "utf8").should.be.equal("Hello World!");
            });
            it("should append to the file", function() {
                var file = nodePath.join(tmpPath, Math.random() + "test", Math.random() + ".txt");
                ensureDirSync(nodePath.dirname(file));
                enFs.writeFileSync(file, "Hello World!");
                ensureFileSync(file, {data: " new content", append: true});
                enFs.readFileSync(file, "utf8").should.be.equal("Hello World! new content");
            });
        });
    });
});

/* global afterEach, beforeEach, describe, it, after, before, process */
/**
 * Created by JParreir on 06-10-2015.
 */


"use strict";

var nodePath = require("path"),
    nodeOs = require("os"),
    rimraf = require("rimraf"),
    enFs = require("enfspatch"),
    enfsmkdirp = require("enfsmkdirp"),
    ensure = require("../"),
    cwd = process.cwd(),
    ensureFile = ensure.ensureFile,
    ensureFileSync = ensure.ensureFileSync,
    ensureDir = ensure.ensureDir,
    ensureDirSync = ensure.ensureDirSync;

describe("enfsensure files", function() {
    var _0777, _0755, _0744, tmpPath, isWindows;
    tmpPath = nodePath.join(nodeOs.tmpdir(), "enfsensurefile");
    _0777 = parseInt("0777", 8);
    _0755 = parseInt("0755", 8);
    _0744 = parseInt("0744", 8);
    isWindows = /^win/.test(process.platform);

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
        it("should test ensureFile chmod", function(done) {
            var file;
            file = nodePath.join(tmpPath, "file1");
            ensureFile(file, _0744, function(err) {
                (err === null).should.be.equal(true);
                var stat = enFs.statSync(file);
                stat.isFile().should.be.equal(true);
                if (!isWindows) {
                    (stat.mode & _0777).should.be.equal(_0744);
                }
                ensureFile(file, _0755, function(err2) {
                    (err2 === null).should.be.equal(true);
                    var stat2 = enFs.statSync(file);
                    stat2.isFile().should.be.equal(true);
                    if (!isWindows) {
                        (stat2.mode & _0777).should.be.equal(_0755);
                        (stat2.mode & _0777).should.not.be.equal(_0744);
                    }
                    done();
                });
            });
        });
        it("should test ensureFile with content", function(done) {
            var file, data;
            data = "This will be written to the file";
            file = nodePath.join(tmpPath, "fileContent");
            ensureFile(file, {data: data}, function(err) {
                (err === null).should.be.equal(true);
                enFs.statSync(file).isFile().should.be.equal(true);
                enFs.readFileSync(file, "utf8").should.be.equal(data);
                done();
            });
        });
        it("should test ensureFile and fail to create file", function(done) {
            var file;
            file = nodePath.join(tmpPath, "fileFolder");
            ensureDir(file, function(errDir) {
                (errDir === null).should.be.equal(true);
                ensureFile(file, _0755, function(err) {
                    (err === null).should.be.equal(false);
                    err.message.should.containEql("Item already exists and is not a file");
                    enFs.statSync(file).isDirectory().should.be.equal(true);
                    done();
                });
            });
        });
        it("should not modify the file", function(done) {
            var file;
            file = nodePath.join(tmpPath, "notModify", "file.txt");
            ensureDir(nodePath.dirname(file), function(errDir) {
                (errDir === null).should.be.equal(true);
                enFs.writeFileSync(file, "hello world");
                ensureFile(file, function(err) {
                    (err === null).should.be.equal(true);
                    enFs.readFileSync(file, "utf8").should.be.equal("hello world");
                    done();
                });
            });
        });
    });
    describe("> sync", function() {
        it("should test ensureFileSync chmod", function() {
            var file;
            file = nodePath.join(tmpPath, "file1");
            ensureFileSync(file, _0744);
            var stat = enFs.statSync(file);
            stat.isFile().should.be.equal(true);
            if (!isWindows) {
                (stat.mode & _0777).should.be.equal(_0744);
            }
            ensureFileSync(file, _0755);
            var stat2 = enFs.statSync(file);
            stat2.isFile().should.be.equal(true);
            if (!isWindows) {
                (stat2.mode & _0777).should.be.equal(_0755);
                (stat2.mode & _0777).should.not.be.equal(_0744);
            }
        });
        it("should test ensureFileSync with content", function() {
            var file, data;
            data = "This will be written to the file";
            file = nodePath.join(tmpPath, "fileContent");
            ensureFileSync(file, {data: data});
            enFs.statSync(file).isFile().should.be.equal(true);
            enFs.readFileSync(file, "utf8").should.be.equal(data)
        });
        it("should test ensureFileSync and fail to create file", function() {
            var file;
            file = nodePath.join(tmpPath, "notModify", "fileFolder");
            ensureDirSync(file);
            enFs.statSync(file).isDirectory().should.be.equal(true);
            (function() {
                ensureFileSync(file);
            }).should.throw(/Item already exists and is not a file/);
        });
    });
});

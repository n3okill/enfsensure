/**
 * Created by JParreir on 06-10-2015.
 */
/* global afterEach, beforeEach, describe, it, after, before, process */

"use strict";

var nodePath = require("path"),
    nodeOs = require("os"),
    rimraf = require("rimraf"),
    enFs = require("enfspatch"),
    enfsmkdirp = require("enfsmkdirp"),
    ensure = require("../"),
    cwd = process.cwd(),
    ensureDir = ensure.ensureDir,
    ensureDirSync = ensure.ensureDirSync;


describe("enfsensure directories", function() {
    var _0777, _0755, _0744, tmpPath, isWindows;
    tmpPath = nodePath.join(nodeOs.tmpdir(), "enfsensuredir");
    _0777 = parseInt("0777", 8);
    _0755 = parseInt("0755", 8);
    _0744 = parseInt("0744", 8);
    isWindows = /^win/.test(process.platform);

    before(function() {
        enfsmkdirp.mkdirpSync(tmpPath);
        process.chdir(tmpPath);
    });
    after(function() {
        process.chdir(cwd);
        rimraf.sync(tmpPath);
    });
    describe("> async", function() {
        it("should test ensureDir chmod", function(done) {
            var ps, file;
            ps = [tmpPath];
            for (var i = 0; i < 2; i++) {
                ps.push(Math.floor(Math.random() * Math.pow(16, 4)).toString(16));
            }
            file = ps.join(nodePath.sep);
            ensureDir(file, _0744, function(err) {
                (err === null).should.be.equal(true);
                var stat = enFs.statSync(file);
                stat.isDirectory().should.be.equal(true);
                if (!isWindows) {
                    (stat.mode & _0777).should.be.equal(_0744);
                }
                ensureDir(file, _0755, function(err2) {
                    (err2 === null).should.be.equal(true);
                    var stat2 = enFs.statSync(file);
                    stat2.isDirectory().should.be.equal(true);
                    if (!isWindows) {
                        (stat2.mode & _0777).should.be.equal(_0755);
                        (stat2.mode & _0777).should.not.be.equal(_0744);
                    }
                    done();
                });
            });
        });
    });
    describe("> sync", function() {
        it("should test ensureDirSync chmod", function() {
            var ps, file, path;
            ps = [tmpPath];
            for (var i = 0; i < 2; i++) {
                ps.push(Math.floor(Math.random() * Math.pow(16, 4)).toString(16));
            }
            file = ps.join(nodePath.sep);
            path = ensureDirSync(file, _0744);
            var stat = enFs.statSync(path);
            stat.isDirectory().should.be.equal(true);
            if (!isWindows) {
                (stat.mode & _0777).should.be.equal(_0744);
            }
            path = ensureDirSync(file, _0755);
            var stat2 = enFs.statSync(path);
            stat2.isDirectory().should.be.equal(true);
            if (!isWindows) {
                (stat2.mode & _0777).should.be.equal(_0755);
                (stat2.mode & _0777).should.not.be.equal(_0744);
            }
        });
    });
});

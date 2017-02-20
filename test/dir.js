/**
 * Created by JParreir on 06-10-2015.
 */
/* global afterEach, beforeEach, describe, it, after, before, process */

"use strict";

const nodePath = require("path");
const nodeOs = require("os");
const rimraf = require("rimraf");
const enFs = require("enfspatch");
const enfsmkdirp = require("enfsmkdirp");
const ensure = require("../");
const cwd = process.cwd();
const ensureDir = ensure.ensureDir;
const ensureDirSync = ensure.ensureDirSync;


describe("enfsensure directories", function() {
    const tmpPath = nodePath.join(nodeOs.tmpdir(), "enfsensuredir");
    const _0777 = parseInt("0777", 8);
    const _0755 = parseInt("0755", 8);
    const _0744 = parseInt("0744", 8);
    const isWindows = /^win/.test(process.platform);

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
            const ps = [tmpPath];
            for (let i = 0; i < 2; i++) {
                ps.push(Math.floor(Math.random() * Math.pow(16, 4)).toString(16));
            }
            const file = ps.join(nodePath.sep);
            ensureDir(file, _0744, function(err) {
                (err === null).should.be.equal(true);
                const stat = enFs.statSync(file);
                stat.isDirectory().should.be.equal(true);
                if (!isWindows) {
                    (stat.mode & _0777).should.be.equal(_0744);
                }
                ensureDir(file, _0755, function(err2) {
                    (err2 === null).should.be.equal(true);
                    const stat2 = enFs.statSync(file);
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
            const ps = [tmpPath];
            for (let i = 0; i < 2; i++) {
                ps.push(Math.floor(Math.random() * Math.pow(16, 4)).toString(16));
            }
            const file = ps.join(nodePath.sep);
            let path = ensureDirSync(file, _0744);
            const stat = enFs.statSync(path);
            stat.isDirectory().should.be.equal(true);
            if (!isWindows) {
                (stat.mode & _0777).should.be.equal(_0744);
            }
            path = ensureDirSync(file, _0755);
            const stat2 = enFs.statSync(path);
            stat2.isDirectory().should.be.equal(true);
            if (!isWindows) {
                (stat2.mode & _0777).should.be.equal(_0755);
                (stat2.mode & _0777).should.not.be.equal(_0744);
            }
        });
    });
});

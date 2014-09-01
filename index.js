'use strict';

var exec = require('child_process').exec;
var Download = require('download');
var rm = require('rimraf');
var tempfile = require('tempfile');

/**
 * Initialize new `BinBuild`
 *
 * @api public
 */

function BinBuild() {
    if (!(this instanceof BinBuild)) {
        return new BinBuild();
    }

    this._cmd = [];
}

/**
 * Define the source archive to download
 *
 * @param {String} str
 * @api public
 */

BinBuild.prototype.src = function (str) {
    if (!arguments.length) {
        return this._src;
    }

    this._src = str;
    return this;
};

/**
 * Add a command to run
 *
 * @param {String} str
 * @api public
 */

BinBuild.prototype.cmd = function (str) {
    if (!arguments.length) {
        return this._cmd;
    }

    this._cmd.push(str);
    return this;
};

/**
 * Build
 *
 * @param {Function} cb
 * @api public
 */

BinBuild.prototype.build = function (cb) {
    cb = cb || function () {};

    var str = this.cmd().join(' && ');
    var tmp = tempfile();
    var download = new Download({ strip: 1, extract: true, mode: 777 })
        .get(this.src(), tmp);

    download.run(function (err) {
        if (err) {
            cb(err);
            return;
        }

        exec(str, { cwd: tmp }, function (err) {
            if (err) {
                cb(err);
                return;
            }

            rm(tmp, cb);
        });
    });
};

/**
 * Module exports
 */

module.exports = BinBuild;
